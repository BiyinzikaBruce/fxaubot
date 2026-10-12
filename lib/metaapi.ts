// Use the explicit Node/CJS subpath — the bare "metaapi.cloud-sdk" export map
// prefers a browser-targeted ESM build under Next's externals resolution,
// which crashes server-side with "window is not defined".
import MetaApi from "metaapi.cloud-sdk/node"
import { floorToStep, stopPrices, type ForexBroker } from "@/lib/brokers/types"

let client: MetaApi | null = null

function getClient(): MetaApi {
  const token = process.env.METAAPI_TOKEN
  if (!token) throw new Error("METAAPI_TOKEN is not configured")
  if (!client) client = new MetaApi(token)
  return client
}

export type Mt5Platform = "mt4" | "mt5"

export type Mt5ProvisionInput = {
  name: string
  login: string
  password: string
  server: string
  platform: Mt5Platform
}

export type Mt5AccountSnapshot = {
  state: string
  connectionStatus: string
  balance?: number
  equity?: number
  currency?: string
}

/** Friendly messages for the MetaApi error codes seen in their official examples. */
function friendlyError(err: unknown): string {
  const code = (err as { details?: { code?: string } })?.details?.code
  switch (code) {
    case "E_SRV_NOT_FOUND":
      return "Broker server name not recognized. Double-check the server name (e.g. Exness-MT5Real8)."
    case "E_AUTH":
      return "Broker rejected the login/password combination."
    case "E_SERVER_TIMEZONE":
      return "Couldn't detect broker settings automatically. Try again in a moment."
    case "E_RESOURCE_SLOTS":
      return "MetaApi account capacity exceeded for this plan."
    default:
      return err instanceof Error ? err.message : "Failed to connect to MT5 account."
  }
}

/** Registers (or reuses) a MetaApi cloud account and starts deployment. Returns immediately — does not block on the broker connection, since that can take 1-3 minutes on first deploy. */
export async function provisionMt5Account(input: Mt5ProvisionInput): Promise<string> {
  const api = getClient()
  const account = await api.metatraderAccountApi.createAccount({
    name: input.name,
    login: input.login,
    password: input.password,
    server: input.server,
    platform: input.platform,
    magic: 0,
    manualTrades: true,
    // "high" reliability (the SDK default) uses redundant infra billed at 2x resource
    // slots and requires a funded MetaApi plan. "regular" is the standard tier and
    // is the right default for a multi-tenant SaaS provisioning many user accounts.
    reliability: "regular",
  })
  await account.deploy()
  return account.id
}

/** Cheap, non-blocking status check — reloads account state from MetaApi without waiting for a broker connection. */
export async function getMt5AccountStatus(metaApiAccountId: string): Promise<Mt5AccountSnapshot> {
  const api = getClient()
  const account = await api.metatraderAccountApi.getAccount(metaApiAccountId)
  await account.reload()

  if (account.state !== "DEPLOYED" || account.connectionStatus !== "CONNECTED") {
    return { state: account.state, connectionStatus: account.connectionStatus }
  }

  const connection = account.getRPCConnection()
  try {
    await connection.connect()
    await connection.waitSynchronized(20)
    const info = await connection.getAccountInformation()
    return {
      state: account.state,
      connectionStatus: account.connectionStatus,
      balance: info.balance,
      equity: info.equity,
      currency: info.currency,
    }
  } finally {
    await connection.close()
  }
}

export async function removeMt5Account(metaApiAccountId: string): Promise<void> {
  const api = getClient()
  const account = await api.metatraderAccountApi.getAccount(metaApiAccountId)
  try {
    await account.undeploy()
  } catch {
    // best-effort — proceed to remove even if undeploy fails (e.g. already undeployed)
  }
  await account.remove()
}

export { friendlyError }

// ── Trading (used by the bot runner) ─────────────────────────────────────────

/**
 * Opens one RPC connection per bot run. Sizing uses the broker's lossTickValue
 * (loss per tick per lot, already in account currency), so no FX conversion is needed.
 */
export async function createMt5Broker(metaApiAccountId: string): Promise<ForexBroker> {
  const api = getClient()
  const account = await api.metatraderAccountApi.getAccount(metaApiAccountId)
  if (account.state !== "DEPLOYED") {
    throw new Error(`MT5 account is ${account.state.toLowerCase()} on MetaApi, not deployed. Reconnect it from the Accounts page.`)
  }
  const connection = account.getRPCConnection()
  try {
    await connection.connect()
    await connection.waitSynchronized(30)
  } catch (err) {
    await connection.close().catch(() => {})
    throw new Error(`Could not reach MT5 broker: ${friendlyError(err)}`)
  }

  let symbols: string[] | null = null

  return {
    async resolveSymbol(symbol) {
      const base = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "")
      symbols ??= await connection.getSymbols()
      // Exact match first, then broker-suffixed variants (Exness "XAUUSDm", IC "EURUSD.a", …)
      const match = symbols.find((s) => s.toUpperCase() === base)
        ?? symbols.find((s) => s.toUpperCase().startsWith(base))
      if (!match) throw new Error(`Broker does not offer "${symbol}" on this MT5 account.`)
      return match
    },

    async fetchCandles(symbol, timeframe, count) {
      const candles = await account.getHistoricalCandles(symbol, timeframe, undefined, count)
      return candles
        .map((c) => ({
          timestamp: new Date(c.time).getTime(),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.tickVolume,
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
    },

    async getBalance() {
      return (await connection.getAccountInformation()).balance
    },

    async hasOpenPosition(symbol) {
      const positions = await connection.getPositions()
      return positions.some((p) => p.symbol === symbol)
    },

    async placeRiskOrder({ symbol, side, riskAmount, stopLossPct, takeProfitPct }) {
      const [spec, price] = await Promise.all([
        connection.getSymbolSpecification(symbol),
        connection.getSymbolPrice(symbol, false),
      ])
      const entry = side === "buy" ? price.ask : price.bid
      const { stopLoss, takeProfit, slDistance } = stopPrices(side, entry, stopLossPct, takeProfitPct)

      const lossPerLot = (slDistance / spec.tickSize) * price.lossTickValue
      let volume = floorToStep(riskAmount / lossPerLot, spec.volumeStep)
      volume = Math.min(volume, spec.maxVolume)
      if (volume < spec.minVolume) {
        throw new Error(
          `Position too small: risk ${riskAmount.toFixed(2)} with a ${stopLossPct}% stop gives ${volume} lots (minimum ${spec.minVolume}). Increase risk % or tighten the stop.`,
        )
      }

      const roundPrice = (p: number) => Math.round(p / spec.tickSize) * spec.tickSize
      const sl = roundPrice(stopLoss)
      const tp = roundPrice(takeProfit)
      const opts = { comment: "FXAU bot" }
      try {
        const res = side === "buy"
          ? await connection.createMarketBuyOrder(symbol, volume, sl, tp, opts)
          : await connection.createMarketSellOrder(symbol, volume, sl, tp, opts)
        return { orderId: res.positionId ?? res.orderId, price: entry, quantity: volume, stopLoss: sl, takeProfit: tp }
      } catch (err) {
        const e = err as { stringCode?: string; message?: string }
        throw new Error(`MT5 rejected the order${e.stringCode ? ` (${e.stringCode})` : ""}: ${e.message ?? "unknown error"}`)
      }
    },

    async close() {
      await connection.close().catch(() => {})
    },
  }
}
