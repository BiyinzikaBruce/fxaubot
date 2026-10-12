import { floorToStep, stopPrices, type ForexBroker } from "@/lib/brokers/types"

const OANDA_BASE = {
  practice: "https://api-fxpractice.oanda.com",
  live: "https://api-fxtrade.oanda.com",
} as const

export type OandaEnvironment = "practice" | "live"

export type OandaAccountSummary = {
  id: string
  currency: string
  balance: number
  equity: number       // NAV in OANDA terms
  unrealizedPL: number
  openTradeCount: number
  alias?: string
}

async function oandaFetch(
  token: string,
  environment: OandaEnvironment,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = OANDA_BASE[environment]
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}

export async function getOandaAccountSummary(
  token: string,
  accountId: string,
  environment: OandaEnvironment,
): Promise<OandaAccountSummary> {
  const res = await oandaFetch(token, environment, `/v3/accounts/${accountId}/summary`)

  if (res.status === 401) throw new Error("Invalid OANDA access token. Check your API token and try again.")
  if (res.status === 400 || res.status === 404) throw new Error("OANDA account ID not found. Check the account number format (e.g. 001-001-1234567-001).")
  if (!res.ok) throw new Error(`OANDA API error: ${res.status} ${res.statusText}`)

  const json = await res.json()
  const a = json.account

  return {
    id: a.id,
    currency: a.currency,
    balance: parseFloat(a.balance),
    equity: parseFloat(a.NAV),
    unrealizedPL: parseFloat(a.unrealizedPL ?? "0"),
    openTradeCount: a.openTradeCount ?? 0,
    alias: a.alias,
  }
}

export async function validateOandaCredentials(
  token: string,
  accountId: string,
  environment: OandaEnvironment,
): Promise<OandaAccountSummary> {
  return getOandaAccountSummary(token, accountId, environment)
}

// ── Trading (used by the bot runner) ─────────────────────────────────────────

const GRANULARITY: Record<string, string> = {
  "1m": "M1", "5m": "M5", "15m": "M15", "30m": "M30", "1h": "H1", "4h": "H4", "1d": "D",
}

/** "EUR/USD", "EURUSD", "eur-usd" → "EUR_USD" */
export function toOandaInstrument(symbol: string): string {
  const s = symbol.toUpperCase().trim()
  if (/[/_\-]/.test(s)) return s.replace(/[/\-]/g, "_")
  if (/^[A-Z]{6}$/.test(s)) return `${s.slice(0, 3)}_${s.slice(3)}`
  return s
}

async function oandaJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (json as { errorMessage?: string }).errorMessage ?? `${res.status} ${res.statusText}`
    throw new Error(`OANDA: ${msg}`)
  }
  return json as T
}

export function createOandaBroker(token: string, accountId: string, environment: OandaEnvironment): ForexBroker {
  const call = <T>(path: string, init?: RequestInit) =>
    oandaFetch(token, environment, path, init).then((r) => oandaJson<T>(r))

  return {
    async resolveSymbol(symbol) {
      const instrument = toOandaInstrument(symbol)
      const json = await call<{ instruments: unknown[] }>(
        `/v3/accounts/${accountId}/instruments?instruments=${instrument}`,
      ).catch(() => ({ instruments: [] }))
      if (json.instruments.length === 0) throw new Error(`OANDA does not offer "${symbol}" on this account.`)
      return instrument
    },

    async fetchCandles(instrument, timeframe, count) {
      const granularity = GRANULARITY[timeframe]
      if (!granularity) throw new Error(`Unsupported timeframe ${timeframe}`)
      const json = await call<{ candles: Array<{ time: string; volume: number; mid: Record<"o" | "h" | "l" | "c", string> }> }>(
        `/v3/instruments/${instrument}/candles?count=${count}&granularity=${granularity}&price=M`,
      )
      return json.candles.map((c) => ({
        timestamp: Date.parse(c.time),
        open: parseFloat(c.mid.o),
        high: parseFloat(c.mid.h),
        low: parseFloat(c.mid.l),
        close: parseFloat(c.mid.c),
        volume: c.volume,
      }))
    },

    async getBalance() {
      return (await getOandaAccountSummary(token, accountId, environment)).balance
    },

    async hasOpenPosition(instrument) {
      const json = await call<{ trades: Array<{ instrument: string }> }>(`/v3/accounts/${accountId}/openTrades`)
      return json.trades.some((t) => t.instrument === instrument)
    },

    async placeRiskOrder({ symbol: instrument, side, riskAmount, stopLossPct, takeProfitPct }) {
      const [spec, pricing] = await Promise.all([
        call<{ instruments: Array<{ displayPrecision: number; tradeUnitsPrecision: number; minimumTradeSize: string; name: string }> }>(
          `/v3/accounts/${accountId}/instruments?instruments=${instrument}`,
        ),
        call<{
          prices: Array<{
            bids: Array<{ price: string }>
            asks: Array<{ price: string }>
            quoteHomeConversionFactors?: { positiveUnits: string; negativeUnits: string }
          }>
          homeConversions?: Array<{ currency: string; accountLoss: string }>
        }>(`/v3/accounts/${accountId}/pricing?instruments=${instrument}&includeHomeConversions=true`),
      ])
      const inst = spec.instruments[0]
      const price = pricing.prices[0]
      const entry = parseFloat(side === "buy" ? price.asks[0].price : price.bids[0].price)

      // Loss of 1 unit moving 1.0 in quote currency, expressed in account currency
      const quote = instrument.split("_")[1]
      const quoteToHome =
        parseFloat(price.quoteHomeConversionFactors?.negativeUnits ?? "") ||
        parseFloat(pricing.homeConversions?.find((h) => h.currency === quote)?.accountLoss ?? "") ||
        1

      const { stopLoss, takeProfit, slDistance } = stopPrices(side, entry, stopLossPct, takeProfitPct)
      const step = 10 ** -inst.tradeUnitsPrecision
      const units = floorToStep(riskAmount / (slDistance * quoteToHome), step)
      const minUnits = parseFloat(inst.minimumTradeSize)
      if (units < minUnits) {
        throw new Error(
          `Position too small: risk ${riskAmount.toFixed(2)} with a ${stopLossPct}% stop gives ${units} units (minimum ${minUnits}). Increase risk % or tighten the stop.`,
        )
      }

      const fmt = (p: number) => p.toFixed(inst.displayPrecision)
      const json = await call<{
        orderFillTransaction?: { id: string; price: string; tradeOpened?: { tradeID: string; units: string } }
        orderCancelTransaction?: { reason: string }
      }>(`/v3/accounts/${accountId}/orders`, {
        method: "POST",
        body: JSON.stringify({
          order: {
            type: "MARKET",
            instrument,
            units: String(side === "buy" ? units : -units),
            timeInForce: "FOK",
            positionFill: "DEFAULT",
            stopLossOnFill: { price: fmt(stopLoss) },
            takeProfitOnFill: { price: fmt(takeProfit) },
          },
        }),
      })

      const fill = json.orderFillTransaction
      if (!fill) throw new Error(`OANDA rejected the order: ${json.orderCancelTransaction?.reason ?? "unknown reason"}`)
      return {
        orderId: fill.tradeOpened?.tradeID ?? fill.id,
        price: parseFloat(fill.price),
        quantity: units,
        stopLoss: parseFloat(fmt(stopLoss)),
        takeProfit: parseFloat(fmt(takeProfit)),
      }
    },

    async close() {},
  }
}
