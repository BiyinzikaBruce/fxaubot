"use client"

import { use } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Play, Square } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useBot, useStartBot, useStopBot, type BotSignalEntry } from "@/hooks/use-bots"
import { cn } from "@/lib/utils"

type Props = { params: Promise<{ botId: string }> }

const SIGNAL_BG: Record<string, string> = {
  buy: "var(--color-profit)",
  sell: "var(--color-loss)",
  neutral: "var(--color-border-subtle)",
}

export default function BotDetailPage({ params }: Props) {
  const { botId } = use(params)
  const { data: bot, isLoading } = useBot(botId)
  const { mutate: start, isPending: starting } = useStartBot()
  const { mutate: stop, isPending: stopping } = useStopBot()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-[var(--color-bg-card)]" />
        <div className="h-48 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-[var(--color-text-secondary)]">Bot not found</p>
        <Link href="/dashboard/bot" className="text-sm text-[var(--color-accent-primary)] hover:underline">Back to Bots</Link>
      </div>
    )
  }

  const botSignals: BotSignalEntry[] = bot.signals as BotSignalEntry[]
  const buySignals = botSignals.filter((s) => s.signalType === "buy").length
  const sellSignals = botSignals.filter((s) => s.signalType === "sell").length
  const actedSignals = botSignals.filter((s) => s.acted).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={bot.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bot", href: "/dashboard/bot" },
          { label: bot.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/bot"
              className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <button
              onClick={() => bot.isActive ? stop(botId) : start(botId)}
              disabled={starting || stopping}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                bot.isActive
                  ? "bg-[var(--color-loss)]/10 text-[var(--color-loss)] hover:bg-[var(--color-loss)]/20"
                  : "bg-[var(--color-profit)]/10 text-[var(--color-profit)] hover:bg-[var(--color-profit)]/20"
              )}
            >
              {bot.isActive ? <><Square className="h-4 w-4" /> Stop</> : <><Play className="h-4 w-4" /> Start</>}
            </button>
          </div>
        }
      />

      {/* Status + config */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        {[
          ["Status", bot.isActive ? "Active" : "Stopped"],
          ["Symbol", bot.symbol],
          ["Timeframe", bot.timeframe],
          ["Exchange", bot.account.exchange],
          ["Position Size", `${bot.positionSizePct}%`],
          ["Stop Loss", `${bot.stopLossPct}%`],
          ["Take Profit", `${bot.takeProfitPct}%`],
          ["Total Signals", bot.signals.length],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
            <span className={cn("text-base font-semibold", label === "Status" && (bot.isActive ? "text-[var(--color-profit)]" : "text-[var(--color-text-muted)]"))}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Signal summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Buy Signals", buySignals, "var(--color-profit)"],
          ["Sell Signals", sellSignals, "var(--color-loss)"],
          ["Acted", actedSignals, "var(--color-accent-primary)"],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
            <p className="text-xs text-[var(--color-text-muted)]">{label as string}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: color as string }}>{value as number}</p>
          </div>
        ))}
      </div>

      {/* Signal history */}
      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Signal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)]">
                {["Time", "Type", "Acted", "Indicator Values"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {botSignals.map((s) => (
                <tr key={s.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{format(new Date(s.triggeredAt), "MMM d HH:mm")}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-bold uppercase text-white" style={{ background: SIGNAL_BG[s.signalType] }}>
                      {s.signalType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", s.acted ? "text-[var(--color-profit)]" : "text-[var(--color-text-muted)]")}>
                      {s.acted ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                    {Object.entries(s.indicatorValues).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </td>
                </tr>
              ))}
              {botSignals.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">No signals yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
