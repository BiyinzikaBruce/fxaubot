"use client"

import { useState } from "react"
import { format } from "date-fns"
import { FlaskConical, Trash2, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useBacktestSessions, useRunBacktest, useDeleteBacktest, type BacktestSession } from "@/hooks/use-backtest"
import type { IndicatorConfig, StrategyConfig } from "@/lib/indicators/index"
import { cn } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"]
const COMMON_SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"]

const inputCls = "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] w-full"

type FormState = {
  name: string
  symbol: string
  timeframe: string
  startDate: string
  endDate: string
  initialBalance: number
  positionSizePct: number
  stopLossPct: number
  takeProfitPct: number
  strategy: StrategyConfig
}

const INITIAL: FormState = {
  name: "",
  symbol: "BTC/USDT",
  timeframe: "1h",
  startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  initialBalance: 10000,
  positionSizePct: 10,
  stopLossPct: 2,
  takeProfitPct: 4,
  strategy: { indicators: [{ type: "RSI", period: 14, overbought: 70, oversold: 30 }], logic: "AND" },
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-xl font-bold" style={{ color: color ?? "var(--color-text-primary)" }}>{value}</p>
    </div>
  )
}

function ResultsPanel({ session }: { session: BacktestSession }) {
  const results = session.results
  if (!results) return null
  const { metrics, equity, trades } = results
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total Trades" value={String(metrics.totalTrades)} />
        <MetricCard label="Win Rate" value={`${fmt(metrics.winRate)}%`} color={metrics.winRate >= 50 ? "var(--color-profit)" : "var(--color-loss)"} />
        <MetricCard label="Total P&L" value={`$${fmt(metrics.totalPnl)}`} color={metrics.totalPnl >= 0 ? "var(--color-profit)" : "var(--color-loss)"} />
        <MetricCard label="Max Drawdown" value={`${fmt(metrics.maxDrawdown)}%`} color="var(--color-loss)" />
        <MetricCard label="Profit Factor" value={metrics.profitFactor === 999 ? "∞" : fmt(metrics.profitFactor)} color={metrics.profitFactor >= 1 ? "var(--color-profit)" : "var(--color-loss)"} />
      </div>

      {equity.length > 0 && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Equity Curve</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equity.map((e) => ({ t: e.time, v: Math.round(e.value * 100) / 100 }))}>
                <XAxis dataKey="t" hide />
                <YAxis domain={["auto", "auto"]} hide />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Balance"]} labelFormatter={() => ""} />
                <ReferenceLine y={INITIAL.initialBalance} stroke="var(--color-border-subtle)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="v" stroke="var(--color-accent-primary)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {trades.length > 0 && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] overflow-x-auto">
          <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Trades ({trades.length})</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)]">
                {["Entry", "Exit", "Side", "Entry $", "Exit $", "P&L %", "Reason"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[var(--color-text-muted)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 50).map((t, i) => (
                <tr key={i} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-2 text-[var(--color-text-muted)]">{format(new Date(t.entryTime), "MMM d HH:mm")}</td>
                  <td className="px-4 py-2 text-[var(--color-text-muted)]">{format(new Date(t.exitTime), "MMM d HH:mm")}</td>
                  <td className="px-4 py-2">
                    <span className={cn("font-semibold", t.side === "long" ? "text-[var(--color-profit)]" : "text-[var(--color-loss)]")}>{t.side}</span>
                  </td>
                  <td className="px-4 py-2">${fmt(t.entryPrice)}</td>
                  <td className="px-4 py-2">${fmt(t.exitPrice)}</td>
                  <td className={cn("px-4 py-2 font-semibold", t.pnlPct >= 0 ? "text-[var(--color-profit)]" : "text-[var(--color-loss)]")}>
                    {t.pnlPct >= 0 ? "+" : ""}{fmt(t.pnlPct)}%
                  </td>
                  <td className="px-4 py-2 text-[var(--color-text-muted)] uppercase">{t.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function BacktestingPage() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [activeSession, setActiveSession] = useState<BacktestSession | null>(null)
  const [error, setError] = useState("")
  const sessionsQuery = useBacktestSessions()
  const sessions = (sessionsQuery.data ?? []) as BacktestSession[]
  const { mutateAsync: run, isPending } = useRunBacktest()
  const { mutate: del } = useDeleteBacktest()

  function update<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleRun() {
    setError("")
    try {
      const session = await run({ ...form, exchange: "binance" })
      setActiveSession(session)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function addIndicator(type: IndicatorConfig["type"]) {
    const defaults: Record<string, IndicatorConfig> = {
      RSI: { type: "RSI", period: 14, overbought: 70, oversold: 30 },
      EMA: { type: "EMA", fast: 9, slow: 21 },
      MACD: { type: "MACD", fast: 12, slow: 26, signal: 9 },
      BB: { type: "BB", period: 20, stddev: 2 },
      ATR: { type: "ATR", period: 14, multiplier: 1.5 },
    }
    update("strategy", { ...form.strategy, indicators: [...form.strategy.indicators, defaults[type]] })
  }

  function removeIndicator(i: number) {
    update("strategy", { ...form.strategy, indicators: form.strategy.indicators.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Backtesting"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Backtesting" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Config panel */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Configuration</p>

            <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
              Name (optional)
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="My RSI strategy" className={inputCls} />
            </label>

            <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
              Symbol
              <input value={form.symbol} onChange={(e) => update("symbol", e.target.value)} list="sym-list" className={inputCls} />
              <datalist id="sym-list">{COMMON_SYMBOLS.map((s) => <option key={s} value={s} />)}</datalist>
            </label>

            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1.5">Timeframe</p>
              <div className="flex flex-wrap gap-1.5">
                {TIMEFRAMES.map((tf) => (
                  <button key={tf} onClick={() => update("timeframe", tf)}
                    className={cn("rounded-lg px-2.5 py-1 text-xs font-medium transition-colors", form.timeframe === tf ? "bg-[var(--color-accent-primary)] text-white" : "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]")}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
                Start date
                <input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} className={inputCls} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
                End date
                <input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputCls} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([["initialBalance", "Initial Balance ($)", 1000], ["positionSizePct", "Position Size %", 1], ["stopLossPct", "Stop Loss %", 0.1], ["takeProfitPct", "Take Profit %", 0.1]] as const).map(([key, label, step]) => (
                <label key={key} className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
                  {label}
                  <input type="number" step={step} value={form[key]} onChange={(e) => update(key, parseFloat(e.target.value))} className={inputCls} />
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Indicators</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(["RSI", "EMA", "MACD", "BB", "ATR"] as const).map((t) => (
                  <button key={t} onClick={() => addIndicator(t)}
                    className="rounded-lg border border-[var(--color-border-subtle)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]">
                    + {t}
                  </button>
                ))}
              </div>
              {form.strategy.indicators.map((ind, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--color-bg-elevated)] px-3 py-2 mb-1.5">
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">{ind.type}</span>
                  <button onClick={() => removeIndicator(i)} className="text-xs text-[var(--color-loss)]">Remove</button>
                </div>
              ))}
              {form.strategy.indicators.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">Add at least one indicator</p>
              )}
            </div>

            {error && <p className="text-xs text-[var(--color-loss)] bg-[var(--color-loss)]/10 rounded-lg px-3 py-2">{error}</p>}

            <button onClick={handleRun} disabled={isPending || form.strategy.indicators.length === 0}
              className="rounded-lg bg-[var(--color-accent-primary)] py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
              <FlaskConical className="h-4 w-4" />
              {isPending ? "Running…" : "Run Backtest"}
            </button>
          </div>

          {/* History */}
          {sessions.length > 0 && (
            <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">History</p>
              <div className="flex flex-col gap-2">
                {sessions.map((s: BacktestSession) => {
                  const m = s.results?.metrics
                  return (
                    <div key={s.id} className={cn("rounded-lg border p-3 cursor-pointer transition-colors", activeSession?.id === s.id ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-glow)]" : "border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]")}
                      onClick={() => setActiveSession(s)}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text-primary)]">{s.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">{s.symbol} · {s.timeframe}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {m && (
                            <span className={cn("text-xs font-semibold", m.totalPnlPct >= 0 ? "text-[var(--color-profit)]" : "text-[var(--color-loss)]")}>
                              {m.totalPnlPct >= 0 ? <TrendingUp className="h-3 w-3 inline" /> : <TrendingDown className="h-3 w-3 inline" />}
                              {" "}{m.totalPnlPct.toFixed(1)}%
                            </span>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); del(s.id) }} className="text-[var(--color-text-muted)] hover:text-[var(--color-loss)]">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          {activeSession ? (
            <ResultsPanel session={activeSession} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-24 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
              <Activity className="h-10 w-10 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-muted)]">Configure and run a backtest to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
