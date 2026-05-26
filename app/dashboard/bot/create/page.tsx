"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { useCreateBot } from "@/hooks/use-bots"
import { useAccounts, type TradingAccount } from "@/hooks/use-accounts"
import { cn } from "@/lib/utils"
import type { IndicatorConfig, StrategyConfig } from "@/lib/indicators/index"

const STEPS = ["Exchange & Account", "Symbol & Timeframe", "Strategy", "Position Sizing", "Review"]
const EXCHANGES = ["binance", "bybit", "okx", "coinbase"]
const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"]
const COMMON_SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "EUR/USD", "GBP/USD"]

const inputCls = "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors w-full"

type FormState = {
  name: string
  accountId: string
  exchange: string
  symbol: string
  timeframe: string
  strategy: StrategyConfig
  positionSizePct: number
  stopLossPct: number
  takeProfitPct: number
}

const INITIAL: FormState = {
  name: "",
  accountId: "",
  exchange: "binance",
  symbol: "BTC/USDT",
  timeframe: "1h",
  strategy: { indicators: [], logic: "AND" },
  positionSizePct: 1,
  stopLossPct: 2,
  takeProfitPct: 4,
}

function IndicatorBuilder({ strategy, onChange }: { strategy: StrategyConfig; onChange: (s: StrategyConfig) => void }) {
  function addIndicator(type: IndicatorConfig["type"]) {
    const defaults: Record<string, IndicatorConfig> = {
      RSI: { type: "RSI", period: 14, overbought: 70, oversold: 30 },
      EMA: { type: "EMA", fast: 9, slow: 21 },
      MACD: { type: "MACD", fast: 12, slow: 26, signal: 9 },
      BB: { type: "BB", period: 20, stddev: 2 },
      ATR: { type: "ATR", period: 14, multiplier: 1.5 },
    }
    onChange({ ...strategy, indicators: [...strategy.indicators, defaults[type]] })
  }

  function removeIndicator(i: number) {
    const indicators = strategy.indicators.filter((_, idx) => idx !== i)
    onChange({ ...strategy, indicators })
  }

  function updateIndicator(i: number, updates: Partial<IndicatorConfig>) {
    const indicators = strategy.indicators.map((ind, idx) => idx === i ? { ...ind, ...updates } as IndicatorConfig : ind)
    onChange({ ...strategy, indicators })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {(["RSI", "EMA", "MACD", "BB", "ATR"] as const).map((t) => (
          <button key={t} onClick={() => addIndicator(t)}
            className="rounded-lg border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors">
            + {t}
          </button>
        ))}
      </div>

      {strategy.indicators.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-muted)]">Logic:</span>
          {(["AND", "OR"] as const).map((l) => (
            <button key={l} onClick={() => onChange({ ...strategy, logic: l })}
              className={cn("rounded-lg px-3 py-1 text-xs font-medium transition-colors", strategy.logic === l ? "bg-[var(--color-accent-primary)] text-white" : "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]")}>
              {l}
            </button>
          ))}
          <span className="text-xs text-[var(--color-text-muted)]">{strategy.logic === "AND" ? "All signals agree" : "Any signal triggers"}</span>
        </div>
      )}

      {strategy.indicators.map((ind, i) => (
        <div key={i} className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">{ind.type}</span>
            <button onClick={() => removeIndicator(i)} className="text-xs text-[var(--color-loss)] hover:underline">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ind.type === "RSI" && <>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Period <input type="number" value={ind.period} onChange={(e) => updateIndicator(i, { period: +e.target.value })} className={inputCls} /></label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Overbought <input type="number" value={ind.overbought} onChange={(e) => updateIndicator(i, { overbought: +e.target.value })} className={inputCls} /></label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Oversold <input type="number" value={ind.oversold} onChange={(e) => updateIndicator(i, { oversold: +e.target.value })} className={inputCls} /></label>
            </>}
            {ind.type === "EMA" && <>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Fast Period <input type="number" value={ind.fast} onChange={(e) => updateIndicator(i, { fast: +e.target.value })} className={inputCls} /></label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Slow Period <input type="number" value={ind.slow} onChange={(e) => updateIndicator(i, { slow: +e.target.value })} className={inputCls} /></label>
            </>}
            {ind.type === "MACD" && <>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Fast <input type="number" value={ind.fast} onChange={(e) => updateIndicator(i, { fast: +e.target.value })} className={inputCls} /></label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Slow <input type="number" value={ind.slow} onChange={(e) => updateIndicator(i, { slow: +e.target.value })} className={inputCls} /></label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Signal <input type="number" value={ind.signal} onChange={(e) => updateIndicator(i, { signal: +e.target.value })} className={inputCls} /></label>
            </>}
            {ind.type === "BB" && <>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Period <input type="number" value={ind.period} onChange={(e) => updateIndicator(i, { period: +e.target.value })} className={inputCls} /></label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Std Dev <input type="number" step="0.1" value={ind.stddev} onChange={(e) => updateIndicator(i, { stddev: +e.target.value })} className={inputCls} /></label>
            </>}
            {ind.type === "ATR" && <>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Period <input type="number" value={ind.period} onChange={(e) => updateIndicator(i, { period: +e.target.value })} className={inputCls} /></label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">Multiplier <input type="number" step="0.1" value={ind.multiplier} onChange={(e) => updateIndicator(i, { multiplier: +e.target.value })} className={inputCls} /></label>
            </>}
          </div>
        </div>
      ))}
      {strategy.indicators.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">Add at least one indicator to generate signals.</p>
      )}
    </div>
  )
}

export default function CreateBotPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL)
  const accountsQuery = useAccounts()
  const accounts: TradingAccount[] = accountsQuery.data ?? []
  const { mutateAsync, isPending } = useCreateBot()

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    await mutateAsync(form as never)
    router.push("/dashboard/bot")
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        title="Create Bot"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bot", href: "/dashboard/bot" }, { label: "Create" }]}
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((_label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors", i === step ? "bg-[var(--color-accent-primary)] text-white" : i < step ? "bg-[var(--color-profit)] text-white cursor-pointer" : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]")}
            >
              {i + 1}
            </button>
            {i < STEPS.length - 1 && <div className={cn("h-px w-8 transition-colors", i < step ? "bg-[var(--color-accent-primary)]" : "bg-[var(--color-border-subtle)]")} />}
          </div>
        ))}
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">{STEPS[step]}</p>

      {/* Step content */}
      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
              Bot Name
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. RSI Scalper" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
              Exchange
              <select value={form.exchange} onChange={(e) => update("exchange", e.target.value)} className={inputCls}>
                {EXCHANGES.map((ex) => <option key={ex} value={ex}>{ex.charAt(0).toUpperCase() + ex.slice(1)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
              Trading Account
              <select value={form.accountId} onChange={(e) => update("accountId", e.target.value)} className={inputCls}>
                <option value="">Select account</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
              Symbol
              <input value={form.symbol} onChange={(e) => update("symbol", e.target.value)} list="symbols-list" className={inputCls} />
              <datalist id="symbols-list">{COMMON_SYMBOLS.map((s) => <option key={s} value={s} />)}</datalist>
            </label>
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">Timeframe</p>
              <div className="flex flex-wrap gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button key={tf} onClick={() => update("timeframe", tf)}
                    className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", form.timeframe === tf ? "bg-[var(--color-accent-primary)] text-white" : "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]")}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <IndicatorBuilder strategy={form.strategy} onChange={(s) => update("strategy", s)} />
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            {([["positionSizePct", "Position Size (%)", "% of balance per trade"], ["stopLossPct", "Stop Loss (%)", "% below entry"], ["takeProfitPct", "Take Profit (%)", "% above entry"]] as const).map(([key, label, hint]) => (
              <label key={key} className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                {label}
                <input type="number" step="0.1" min="0.1" value={form[key]} onChange={(e) => update(key, parseFloat(e.target.value))} className={inputCls} />
                <span className="text-[var(--color-text-muted)] font-normal">{hint}</span>
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-3 text-sm">
            {[
              ["Name", form.name],
              ["Exchange", form.exchange],
              ["Symbol", form.symbol],
              ["Timeframe", form.timeframe],
              ["Indicators", form.strategy.indicators.map((i) => i.type).join(", ") || "None"],
              ["Logic", form.strategy.logic],
              ["Position Size", `${form.positionSizePct}%`],
              ["Stop Loss", `${form.stopLossPct}%`],
              ["Take Profit", `${form.takeProfitPct}%`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[var(--color-border-subtle)] pb-2">
                <span className="text-[var(--color-text-muted)]">{k}</span>
                <span className="font-medium text-[var(--color-text-primary)]">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
          className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-40 transition-colors">
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && (!form.name || !form.accountId)}
            className="rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isPending || form.strategy.indicators.length === 0}
            className="rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity">
            {isPending ? "Creating…" : "Create Bot"}
          </button>
        )}
      </div>
    </div>
  )
}
