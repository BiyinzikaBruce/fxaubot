"use client"

import { motion } from "framer-motion"
import { useAnalyticsSummary } from "@/hooks/use-analytics"
import { useTrades } from "@/hooks/use-trades"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EquityCurve } from "@/components/dashboard/equity-curve"
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import {
  TrendingUp, Percent, BarChart2, Zap, Trophy, AlertTriangle, Flame, CalendarDays, History,
} from "lucide-react"

function fmt(n: number) {
  const sign = n >= 0 ? "+" : ""
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSum } = useAnalyticsSummary()
  const { data: recentData, isLoading: loadingTrades } = useTrades({ limit: 5, page: 1 })

  const skeleton = "animate-pulse rounded bg-[var(--color-bg-elevated)] h-8 w-24"

  const statCards = [
    {
      label: "Total Net P&L",
      value: loadingSum ? null : fmt(summary?.totalNetPnl ?? 0),
      trend: (summary?.totalNetPnl ?? 0) >= 0 ? "up" as const : "down" as const,
      icon: TrendingUp,
      sub: `${summary?.totalTrades ?? 0} closed trades`,
    },
    {
      label: "Win Rate",
      value: loadingSum ? null : pct(summary?.winRate ?? 0),
      trend: (summary?.winRate ?? 0) >= 0.5 ? "up" as const : "down" as const,
      icon: Percent,
      sub: `${summary?.winCount ?? 0}W / ${summary?.lossCount ?? 0}L`,
    },
    {
      label: "Profit Factor",
      value: loadingSum ? null : (summary?.profitFactor ?? 0).toFixed(2),
      trend: (summary?.profitFactor ?? 0) >= 1.5 ? "up" as const : "neutral" as const,
      icon: BarChart2,
      sub: `$${(summary?.grossProfit ?? 0).toFixed(0)} gross profit`,
    },
    {
      label: "Avg Win",
      value: loadingSum ? null : fmt(summary?.avgWin ?? 0),
      trend: "up" as const,
      icon: Zap,
      sub: `Avg loss: ${fmt(summary?.avgLoss ?? 0)}`,
    },
    {
      label: "Best Trade",
      value: loadingSum ? null : fmt(summary?.bestTrade?.netPnl ?? 0),
      trend: "up" as const,
      icon: Trophy,
      sub: summary?.bestTrade?.symbol ?? "",
    },
    {
      label: "Worst Trade",
      value: loadingSum ? null : fmt(summary?.worstTrade?.netPnl ?? 0),
      trend: "down" as const,
      icon: AlertTriangle,
      sub: summary?.worstTrade?.symbol ?? "",
    },
    {
      label: "Current Streak",
      value: loadingSum ? null : `${summary?.streak ?? 0} ${summary?.streakType ?? ""}`,
      trend: summary?.streakType === "win" ? "up" as const : "down" as const,
      icon: Flame,
      sub: "consecutive trades",
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]} />

      {/* KPI stat cards */}
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <StatCard
              label={card.label}
              value={card.value ?? <span className={skeleton} />}
              trend={card.trend}
              icon={card.icon}
              sub={card.sub}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Equity Curve + Calendar Heatmap */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 transition-shadow hover:shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Equity Curve</h2>
          </div>
          {loadingSum ? (
            <div className="h-[220px] animate-pulse rounded bg-[var(--color-bg-elevated)]" />
          ) : (
            <EquityCurve data={summary?.equityCurve ?? []} />
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 transition-shadow hover:shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Daily P&L Heatmap</h2>
          </div>
          {loadingSum ? (
            <div className="h-[220px] animate-pulse rounded bg-[var(--color-bg-elevated)]" />
          ) : (
            <CalendarHeatmap data={summary?.equityCurve ?? []} />
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 transition-shadow hover:shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]">
              <History className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Trades</h2>
          </div>
          <a
            href="/dashboard/journal"
            className="text-xs text-[var(--color-accent-primary)] hover:underline"
          >
            View all →
          </a>
        </div>
        {loadingTrades ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
            ))}
          </div>
        ) : (
          <RecentTrades trades={recentData?.trades ?? []} />
        )}
      </div>
    </div>
  )
}
