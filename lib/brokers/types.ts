import type { OHLCV } from "@/lib/exchanges/index"

export type OrderSide = "buy" | "sell"

export type RiskOrderInput = {
  symbol: string          // broker-native symbol from resolveSymbol()
  side: OrderSide
  riskAmount: number      // account currency lost if stop loss is hit
  stopLossPct: number     // SL distance as % of entry price
  takeProfitPct: number   // TP distance as % of entry price
}

export type BrokerOrderResult = {
  orderId: string
  price: number
  quantity: number        // OANDA units / MT5 lots
  stopLoss: number
  takeProfit: number
}

/** Forex/CFD broker used by the bot runner. Order size is derived from risk, not notional. */
export type ForexBroker = {
  resolveSymbol(symbol: string): Promise<string>
  fetchCandles(symbol: string, timeframe: string, count: number): Promise<OHLCV[]>
  getBalance(): Promise<number>
  hasOpenPosition(symbol: string): Promise<boolean>
  placeRiskOrder(input: RiskOrderInput): Promise<BrokerOrderResult>
  close(): Promise<void>
}

export const TIMEFRAME_MS: Record<string, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
}

/** Rounds `value` down to a multiple of `step` (floating-point safe). */
export function floorToStep(value: number, step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)))
  return parseFloat((Math.floor(value / step + 1e-9) * step).toFixed(decimals))
}

export function stopPrices(side: OrderSide, entry: number, stopLossPct: number, takeProfitPct: number) {
  const sl = entry * (stopLossPct / 100)
  const tp = entry * (takeProfitPct / 100)
  return side === "buy"
    ? { stopLoss: entry - sl, takeProfit: entry + tp, slDistance: sl }
    : { stopLoss: entry + sl, takeProfit: entry - tp, slDistance: sl }
}
