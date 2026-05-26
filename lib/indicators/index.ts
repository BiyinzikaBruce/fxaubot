import type { OHLCV } from "@/lib/exchanges/index"

// ── Core math ────────────────────────────────────────────────────────────────

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = []
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period
  result.push(...new Array(period - 1).fill(NaN))
  result.push(prev)
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    result.push(prev)
  }
  return result
}

export function rsi(closes: number[], period = 14): number[] {
  const result: number[] = new Array(period).fill(NaN)
  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) avgGain += diff
    else avgLoss += Math.abs(diff)
  }
  avgGain /= period
  avgLoss /= period
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  }
  return result
}

export function macd(closes: number[], fast = 12, slow = 26, signal = 9): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEma = ema(closes, fast)
  const slowEma = ema(closes, slow)
  const macdLine = fastEma.map((v, i) => (isNaN(v) || isNaN(slowEma[i]) ? NaN : v - slowEma[i]))
  const validMacd = macdLine.filter((v) => !isNaN(v))
  const signalPad = macdLine.length - validMacd.length
  const signalRaw = ema(validMacd, signal)
  const signalLine = [...new Array(signalPad).fill(NaN), ...signalRaw]
  const histogram = macdLine.map((v, i) => (isNaN(v) || isNaN(signalLine[i]) ? NaN : v - signalLine[i]))
  return { macd: macdLine, signal: signalLine, histogram }
}

export function bollingerBands(closes: number[], period = 20, stddev = 2): { upper: number[]; middle: number[]; lower: number[] } {
  const middle: number[] = []
  const upper: number[] = []
  const lower: number[] = []
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { middle.push(NaN); upper.push(NaN); lower.push(NaN); continue }
    const slice = closes.slice(i - period + 1, i + 1)
    const avg = slice.reduce((a, b) => a + b, 0) / period
    const variance = slice.reduce((a, b) => a + (b - avg) ** 2, 0) / period
    const sd = Math.sqrt(variance)
    middle.push(avg)
    upper.push(avg + stddev * sd)
    lower.push(avg - stddev * sd)
  }
  return { upper, middle, lower }
}

export function atr(highs: number[], lows: number[], closes: number[], period = 14): number[] {
  const result: number[] = [NaN]
  const trs: number[] = []
  for (let i = 1; i < closes.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])))
  }
  let atrVal = trs.slice(0, period).reduce((a, b) => a + b, 0) / period
  result.push(...new Array(period - 1).fill(NaN))
  result.push(atrVal)
  for (let i = period; i < trs.length; i++) {
    atrVal = (atrVal * (period - 1) + trs[i]) / period
    result.push(atrVal)
  }
  return result
}

// ── Strategy types ────────────────────────────────────────────────────────────

export type RSIConfig = { type: "RSI"; period: number; overbought: number; oversold: number }
export type EMAConfig = { type: "EMA"; fast: number; slow: number }
export type MACDConfig = { type: "MACD"; fast: number; slow: number; signal: number }
export type BBConfig = { type: "BB"; period: number; stddev: number }
export type ATRConfig = { type: "ATR"; period: number; multiplier: number }
export type IndicatorConfig = RSIConfig | EMAConfig | MACDConfig | BBConfig | ATRConfig

export type StrategyConfig = {
  indicators: IndicatorConfig[]
  logic: "AND" | "OR"
}

export type SignalResult = {
  signal: "buy" | "sell" | "neutral"
  values: Record<string, number>
}

// ── Signal evaluation ─────────────────────────────────────────────────────────

export function evaluateSignal(candles: OHLCV[], config: StrategyConfig): SignalResult {
  if (candles.length < 30) return { signal: "neutral", values: {} }

  const closes = candles.map((c) => c.close)
  const highs = candles.map((c) => c.high)
  const lows = candles.map((c) => c.low)
  const last = candles.length - 1
  const values: Record<string, number> = {}
  const signals: ("buy" | "sell" | "neutral")[] = []

  for (const ind of config.indicators) {
    if (ind.type === "RSI") {
      const r = rsi(closes, ind.period)
      const v = r[last]
      values["rsi"] = parseFloat(v.toFixed(2))
      if (v <= ind.oversold) signals.push("buy")
      else if (v >= ind.overbought) signals.push("sell")
      else signals.push("neutral")
    }

    if (ind.type === "EMA") {
      const fast = ema(closes, ind.fast)
      const slow = ema(closes, ind.slow)
      values["ema_fast"] = parseFloat(fast[last].toFixed(4))
      values["ema_slow"] = parseFloat(slow[last].toFixed(4))
      const prevFast = fast[last - 1], prevSlow = slow[last - 1]
      if (!isNaN(prevFast) && !isNaN(prevSlow)) {
        if (prevFast < prevSlow && fast[last] > slow[last]) signals.push("buy")
        else if (prevFast > prevSlow && fast[last] < slow[last]) signals.push("sell")
        else signals.push("neutral")
      } else signals.push("neutral")
    }

    if (ind.type === "MACD") {
      const m = macd(closes, ind.fast, ind.slow, ind.signal)
      values["macd"] = parseFloat((m.macd[last] ?? 0).toFixed(4))
      values["macd_signal"] = parseFloat((m.signal[last] ?? 0).toFixed(4))
      values["macd_hist"] = parseFloat((m.histogram[last] ?? 0).toFixed(4))
      const prev = m.histogram[last - 1], curr = m.histogram[last]
      if (!isNaN(prev) && !isNaN(curr)) {
        if (prev < 0 && curr > 0) signals.push("buy")
        else if (prev > 0 && curr < 0) signals.push("sell")
        else signals.push("neutral")
      } else signals.push("neutral")
    }

    if (ind.type === "BB") {
      const bb = bollingerBands(closes, ind.period, ind.stddev)
      values["bb_upper"] = parseFloat((bb.upper[last] ?? 0).toFixed(4))
      values["bb_lower"] = parseFloat((bb.lower[last] ?? 0).toFixed(4))
      const price = closes[last]
      if (price <= bb.lower[last]) signals.push("buy")
      else if (price >= bb.upper[last]) signals.push("sell")
      else signals.push("neutral")
    }

    if (ind.type === "ATR") {
      const atrVals = atr(highs, lows, closes, ind.period)
      values["atr"] = parseFloat((atrVals[last] ?? 0).toFixed(4))
      signals.push("neutral")
    }
  }

  if (signals.length === 0) return { signal: "neutral", values }

  if (config.logic === "AND") {
    if (signals.every((s) => s === "buy")) return { signal: "buy", values }
    if (signals.every((s) => s === "sell")) return { signal: "sell", values }
    return { signal: "neutral", values }
  }

  const buys = signals.filter((s) => s === "buy").length
  const sells = signals.filter((s) => s === "sell").length
  if (buys > sells) return { signal: "buy", values }
  if (sells > buys) return { signal: "sell", values }
  return { signal: "neutral", values }
}
