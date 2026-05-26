"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Plus, Play, Square, Trash2, TrendingUp, Zap, Activity } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { useBots, useStartBot, useStopBot, useDeleteBot } from "@/hooks/use-bots"
import { useSignals } from "@/hooks/use-signals"
import type { BotConfig } from "@/hooks/use-bots"
import type { BotSignal } from "@/hooks/use-signals"
import { cn } from "@/lib/utils"

const SIGNAL_BG: Record<string, string> = {
  buy: "var(--color-profit)",
  sell: "var(--color-loss)",
  neutral: "var(--color-border-subtle)",
}

export default function BotPage() {
  const botsQuery = useBots()
  const signalsQuery = useSignals({ limit: 20 })
  const bots = (botsQuery.data ?? []) as BotConfig[]
  const signals = (signalsQuery.data ?? []) as BotSignal[]
  const isLoading = botsQuery.isLoading
  const { mutate: start } = useStartBot()
  const { mutate: stop } = useStopBot()
  const { mutate: del } = useDeleteBot()

  const activeBots = bots.filter((b: BotConfig) => b.isActive).length
  const totalSignals = bots.reduce((a: number, b: BotConfig) => a + b._count.signals, 0)
  const recentBuys = signals.filter((s: BotSignal) => s.signalType === "buy").length
  const recentSells = signals.filter((s: BotSignal) => s.signalType === "sell").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bot System"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bot" }]}
        actions={
          <Link
            href="/dashboard/bot/create"
            className="flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> New Bot
          </Link>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active Bots" value={activeBots} icon={Activity} />
        <StatCard label="Total Bots" value={bots.length} icon={Zap} />
        <StatCard label="Total Signals" value={totalSignals} icon={TrendingUp} />
        <StatCard label="Recent Buys / Sells" value={`${recentBuys} / ${recentSells}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bot list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Your Bots</h2>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />)}
            </div>
          ) : bots.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
              <Zap className="h-8 w-8 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-muted)]">No bots yet</p>
              <Link href="/dashboard/bot/create" className="text-sm text-[var(--color-accent-primary)] hover:underline">Create your first bot</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bots.map((bot: BotConfig) => (
                <div key={bot.id} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: bot.isActive ? "var(--color-profit)" : "var(--color-border-subtle)" }}
                        />
                        <Link href={`/dashboard/bot/${bot.id}`} className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] truncate">
                          {bot.name}
                        </Link>
                        <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">{bot.isActive ? "Active" : "Stopped"}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">{bot.symbol} · {bot.timeframe} · {bot.account.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-[var(--color-text-muted)]">{bot._count.signals} signals</span>
                      <button
                        onClick={() => bot.isActive ? stop(bot.id) : start(bot.id)}
                        className={cn("rounded-lg p-1.5 transition-colors", bot.isActive ? "hover:bg-[var(--color-loss)]/10 text-[var(--color-loss)]" : "hover:bg-[var(--color-profit)]/10 text-[var(--color-profit)]")}
                        title={bot.isActive ? "Stop bot" : "Start bot"}
                      >
                        {bot.isActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${bot.name}"?`)) del(bot.id) }}
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-loss)] hover:bg-[var(--color-loss)]/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-3 text-xs text-[var(--color-text-muted)]">
                    <span>SL {bot.stopLossPct}%</span>
                    <span>TP {bot.takeProfitPct}%</span>
                    <span>Size {bot.positionSizePct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent signals */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Signals</h2>
            <Link href="/dashboard/signals" className="text-xs text-[var(--color-accent-primary)] hover:underline">View all</Link>
          </div>
          <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] divide-y divide-[var(--color-border-subtle)]">
            {signals.length === 0 ? (
              <p className="p-4 text-sm text-[var(--color-text-muted)]">No signals yet</p>
            ) : (
              signals.slice(0, 10).map((s: BotSignal) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-medium text-[var(--color-text-primary)] truncate">{s.botConfig.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{s.symbol} · {s.timeframe}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span
                      className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-bold uppercase text-white"
                      style={{ background: SIGNAL_BG[s.signalType] ?? "var(--color-border-subtle)" }}
                    >
                      {s.signalType}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{format(new Date(s.triggeredAt), "HH:mm")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
