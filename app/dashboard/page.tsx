"use client"

import { useAnalyticsSummary } from "@/hooks/use-analytics"
import { useTrades } from "@/hooks/use-trades"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EquityCurve } from "@/components/dashboard/equity-curve"
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import {
  TrendingUp, Percent, BarChart2, Zap, Trophy, AlertTriangle, Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value ?? <span className={skeleton} />}
            trend={card.trend}
            icon={card.icon}
            sub={card.sub}
          />
        ))}
      </div>

      {/* Equity Curve + Calendar Heatmap */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Equity Curve</h2>
          {loadingSum ? (
            <div className="h-[220px] animate-pulse rounded bg-[var(--color-bg-elevated)]" />
          ) : (
            <EquityCurve data={summary?.equityCurve ?? []} />
          )}
        </div>

        <div className="lg:col-span-2 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Daily P&L Heatmap</h2>
          {loadingSum ? (
            <div className="h-[220px] animate-pulse rounded bg-[var(--color-bg-elevated)]" />
          ) : (
            <CalendarHeatmap data={summary?.equityCurve ?? []} />
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Trades</h2>
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
