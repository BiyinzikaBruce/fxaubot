import { evaluateSignal } from "@/lib/indicators/index"
import type { StrategyConfig } from "@/lib/indicators/index"
import type { OHLCV } from "@/lib/exchanges/index"

export type BacktestConfig = {
  exchange: string
  symbol: string
  timeframe: string
  startDate: string
  endDate: string
  strategyConfig: StrategyConfig
  initialBalance: number
  positionSizePct: number
  stopLossPct: number
  takeProfitPct: number
}

export type BacktestTrade = {
  entryTime: number
  exitTime: number
  side: "long" | "short"
  entryPrice: number
  exitPrice: number
  pnlPct: number
  pnl: number
  reason: "sl" | "tp" | "signal" | "end"
}

export type BacktestResults = {
  trades: BacktestTrade[]
  equity: { time: number; value: number }[]
  metrics: {
    totalTrades: number
    winRate: number
    avgWin: number
    avgLoss: number
    maxDrawdown: number
    totalPnl: number
    totalPnlPct: number
    sharpeRatio: number
    profitFactor: number
  }
}

async function fetchPublicOHLCV(symbol: string, timeframe: string, startMs: number, endMs: number): Promise<OHLCV[]> {
  const s = symbol.replace("/", "").toUpperCase()
  const url = `https://api.binance.com/api/v3/klines?symbol=${s}&interval=${timeframe}&startTime=${startMs}&endTime=${endMs}&limit=1000`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Binance OHLCV fetch failed: ${res.status}`)
  const data = await res.json() as unknown[][]
  return data.map((k) => ({
    timestamp: k[0] as number,
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
    volume: parseFloat(k[5] as string),
  }))
}

export async function runBacktest(config: BacktestConfig): Promise<BacktestResults> {
  const startMs = new Date(config.startDate).getTime()
  const endMs = new Date(config.endDate).getTime()
  const candles = await fetchPublicOHLCV(config.symbol, config.timeframe, startMs, endMs)

  if (candles.length < 50) throw new Error("Not enough historical data for this range. Try a wider date range.")

  const trades: BacktestTrade[] = []
  const equity: { time: number; value: number }[] = []
  let balance = config.initialBalance
  let position: { side: "long" | "short"; entryPrice: number; entryTime: number; size: number } | null = null

  for (let i = 50; i < candles.length; i++) {
    const window = candles.slice(0, i + 1)
    const current = candles[i]

    if (position) {
      const { side, entryPrice, size } = position
      const slPrice = side === "long" ? entryPrice * (1 - config.stopLossPct / 100) : entryPrice * (1 + config.stopLossPct / 100)
      const tpPrice = side === "long" ? entryPrice * (1 + config.takeProfitPct / 100) : entryPrice * (1 - config.takeProfitPct / 100)

      let exitPrice: number | null = null
      let reason: "sl" | "tp" | "signal" | "end" = "end"

      if (side === "long") {
        if (current.low <= slPrice) { exitPrice = slPrice; reason = "sl" }
        else if (current.high >= tpPrice) { exitPrice = tpPrice; reason = "tp" }
      } else {
        if (current.high >= slPrice) { exitPrice = slPrice; reason = "sl" }
        else if (current.low <= tpPrice) { exitPrice = tpPrice; reason = "tp" }
      }

      if (exitPrice) {
        const pnlPct = side === "long"
          ? (exitPrice - entryPrice) / entryPrice * 100
          : (entryPrice - exitPrice) / entryPrice * 100
        const pnl = size * pnlPct / 100
        balance += pnl
        trades.push({ entryTime: position.entryTime, exitTime: current.timestamp, side, entryPrice, exitPrice, pnlPct, pnl, reason })
        position = null
      }
    }

    const { signal } = evaluateSignal(window, config.strategyConfig)

    if (!position && signal !== "neutral") {
      const size = balance * (config.positionSizePct / 100)
      position = { side: signal === "buy" ? "long" : "short", entryPrice: current.close, entryTime: current.timestamp, size }
    }

    equity.push({ time: current.timestamp, value: balance })
  }

  if (position && candles.length > 0) {
    const last = candles[candles.length - 1]
    const pnlPct = position.side === "long"
      ? (last.close - position.entryPrice) / position.entryPrice * 100
      : (position.entryPrice - last.close) / position.entryPrice * 100
    const pnl = position.size * pnlPct / 100
    balance += pnl
    trades.push({ entryTime: position.entryTime, exitTime: last.timestamp, side: position.side, entryPrice: position.entryPrice, exitPrice: last.close, pnlPct, pnl, reason: "end" })
  }

  const wins = trades.filter((t) => t.pnl > 0)
  const losses = trades.filter((t) => t.pnl <= 0)
  const totalPnl = balance - config.initialBalance
  const totalPnlPct = (totalPnl / config.initialBalance) * 100

  let maxDrawdown = 0
  let peak = config.initialBalance
  for (const e of equity) {
    if (e.value > peak) peak = e.value
    const dd = (peak - e.value) / peak * 100
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  const returns = equity.slice(1).map((e, i) => equity[i].value > 0 ? (e.value - equity[i].value) / equity[i].value : 0)
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
  const stdReturn = returns.length > 0 ? Math.sqrt(returns.reduce((a, b) => a + (b - avgReturn) ** 2, 0) / returns.length) : 0
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0

  const grossWins = wins.reduce((a, t) => a + t.pnl, 0)
  const grossLosses = Math.abs(losses.reduce((a, t) => a + t.pnl, 0))

  return {
    trades,
    equity,
    metrics: {
      totalTrades: trades.length,
      winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
      avgWin: wins.length > 0 ? grossWins / wins.length : 0,
      avgLoss: losses.length > 0 ? grossLosses / losses.length : 0,
      maxDrawdown,
      totalPnl,
      totalPnlPct,
      sharpeRatio,
      profitFactor: grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 999 : 0,
    },
  }
}
