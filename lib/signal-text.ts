/** Plain-language view of a BUY/SELL bot signal, for display. */
export type SignalPlan = {
  action: "BUY" | "SELL"
  price?: number
  stopLoss?: number
  takeProfit?: number
}

export function signalPlan(s: { signalType: string; indicatorValues: Record<string, number> }): SignalPlan | null {
  if (s.signalType !== "buy" && s.signalType !== "sell") return null
  const v = s.indicatorValues ?? {}
  return {
    action: s.signalType === "buy" ? "BUY" : "SELL",
    price: v.price,
    stopLoss: v.stopLoss,
    takeProfit: v.takeProfit,
  }
}

/** Prices < 10 (FX majors) need 5 decimals; gold/indices read fine with 2. */
export function fmtPrice(n?: number): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—"
  return n.toLocaleString(undefined, { minimumFractionDigits: n < 10 ? 5 : 2, maximumFractionDigits: n < 10 ? 5 : 2 })
}

/** "XAU/USD" → "gold", otherwise the symbol itself. */
export function marketName(symbol: string): string {
  const key = symbol.toUpperCase().replace(/[^A-Z]/g, "")
  if (key.startsWith("XAUUSD")) return "Gold"
  if (key.startsWith("XAGUSD")) return "Silver"
  return symbol
}
