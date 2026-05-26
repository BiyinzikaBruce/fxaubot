"use client"

import { useState } from "react"
import { format } from "date-fns"
import { PageHeader } from "@/components/layout/page-header"
import { useSignals, type BotSignal } from "@/hooks/use-signals"
import { useBots, type BotConfig } from "@/hooks/use-bots"
import { cn } from "@/lib/utils"

const SIGNAL_BG: Record<string, string> = {
  buy: "var(--color-profit)",
  sell: "var(--color-loss)",
  neutral: "var(--color-border-subtle)",
}

export default function SignalsPage() {
  const [botFilter, setBotFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const botsQuery = useBots()
  const bots = (botsQuery.data ?? []) as BotConfig[]
  const signalsQuery = useSignals({
    botId: botFilter || undefined,
    signal: typeFilter || undefined,
    limit: 100,
  })
  const signals = (signalsQuery.data ?? []) as BotSignal[]
  const isLoading = signalsQuery.isLoading

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Signals Feed"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Signals" }]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={botFilter}
          onChange={(e) => setBotFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
        >
          <option value="">All Bots</option>
          {bots.map((b: BotConfig) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div className="flex gap-1">
          {["", "buy", "sell", "neutral"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors",
                typeFilter === t
                  ? "bg-[var(--color-accent-primary)] text-white"
                  : "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
              )}
            >
              {t || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Signal feed */}
      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--color-bg-elevated)]" />)}
          </div>
        ) : signals.length === 0 ? (
          <div className="py-20 text-center text-sm text-[var(--color-text-muted)]">No signals found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {["Time", "Bot", "Symbol", "TF", "Signal", "Acted", "Indicators"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signals.map((s: BotSignal) => (
                  <tr key={s.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50">
                    <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap tabular-nums">{format(new Date(s.triggeredAt), "MMM d, HH:mm")}</td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{s.botConfig.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{s.symbol}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{s.timeframe}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-bold uppercase text-white" style={{ background: SIGNAL_BG[s.signalType] }}>
                        {s.signalType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium", s.acted ? "text-[var(--color-profit)]" : "text-[var(--color-text-muted)]")}>
                        {s.acted ? "Yes" : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                      {Object.entries(s.indicatorValues).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
