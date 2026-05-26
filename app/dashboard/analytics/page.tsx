"use client"

import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EquityCurve } from "@/components/dashboard/equity-curve"
import { WinLossChart } from "@/components/analytics/win-loss-chart"
import { SymbolChart } from "@/components/analytics/symbol-chart"
import { useAnalyticsSummary, useReport } from "@/hooks/use-analytics"
import { TrendingUp, Percent, BarChart2, Zap, Trophy, AlertTriangle } from "lucide-react"
import Link from "next/link"

function fmt(n: number) {
  const sign = n >= 0 ? "+" : ""
  return `${sign}$${Math.abs(n).toFixed(2)}`
}

export default function AnalyticsPage() {
  const { data: summary, isLoading } = useAnalyticsSummary()
  const { data: symbolData } = useReport("symbol")

  const statCards = [
    { label: "Total Net P&L", value: isLoading ? "—" : fmt(summary?.totalNetPnl ?? 0), trend: (summary?.totalNetPnl ?? 0) >= 0 ? "up" as const : "down" as const, icon: TrendingUp },
    { label: "Win Rate", value: isLoading ? "—" : `${((summary?.winRate ?? 0) * 100).toFixed(1)}%`, trend: (summary?.winRate ?? 0) >= 0.5 ? "up" as const : "down" as const, icon: Percent, sub: `${summary?.winCount ?? 0}W / ${summary?.lossCount ?? 0}L` },
    { label: "Profit Factor", value: isLoading ? "—" : (summary?.profitFactor ?? 0).toFixed(2), trend: (summary?.profitFactor ?? 0) >= 1.5 ? "up" as const : "neutral" as const, icon: BarChart2 },
    { label: "Avg Win", value: isLoading ? "—" : fmt(summary?.avgWin ?? 0), trend: "up" as const, icon: Zap, sub: `Avg loss: ${fmt(summary?.avgLoss ?? 0)}` },
    { label: "Best Trade", value: isLoading ? "—" : fmt(summary?.bestTrade?.netPnl ?? 0), trend: "up" as const, icon: Trophy, sub: summary?.bestTrade?.symbol },
    { label: "Worst Trade", value: isLoading ? "—" : fmt(summary?.worstTrade?.netPnl ?? 0), trend: "down" as const, icon: AlertTriangle, sub: summary?.worstTrade?.symbol },
  ]

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Analytics"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]}
        actions={
          <Link
            href="/dashboard/analytics/reports"
            className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            Full Reports →
          </Link>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Equity curve */}
      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Equity Curve</h2>
        {isLoading ? (
          <div className="h-[220px] animate-pulse rounded bg-[var(--color-bg-elevated)]" />
        ) : (
          <EquityCurve data={summary?.equityCurve ?? []} />
        )}
      </div>

      {/* Win/Loss donut + Symbol breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Win / Loss Ratio</h2>
          {isLoading ? (
            <div className="h-[200px] animate-pulse rounded bg-[var(--color-bg-elevated)]" />
          ) : (
            <WinLossChart wins={summary?.winCount ?? 0} losses={summary?.lossCount ?? 0} />
          )}
        </div>

        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">P&L by Symbol</h2>
          {!symbolData ? (
            <div className="h-[220px] animate-pulse rounded bg-[var(--color-bg-elevated)]" />
          ) : (
            <SymbolChart data={symbolData} />
          )}
        </div>
      </div>
    </div>
  )
}
