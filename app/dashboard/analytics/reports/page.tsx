"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { SymbolChart } from "@/components/analytics/symbol-chart"
import { useReport } from "@/hooks/use-analytics"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line,
} from "recharts"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "symbol", label: "Symbol" },
  { id: "playbook", label: "Playbook" },
  { id: "tags", label: "Tags" },
  { id: "time", label: "Time" },
  { id: "win-loss", label: "Win/Loss" },
  { id: "risk", label: "Risk" },
] as const

type TabId = (typeof TABS)[number]["id"]

const chartStyle = {
  contentStyle: {
    background: "var(--color-bg-card)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: 8,
    fontSize: 12,
  },
}

function TableReport({ columns, rows }: { columns: string[]; rows: Record<string, unknown>[] }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-[var(--color-border-subtle)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-subtle)]">
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50">
              {columns.map((c) => {
                const val = row[c.toLowerCase().replace(/[/ ]/g, "")] ?? row[c] ?? "—"
                const numVal = typeof val === "number" ? val : null
                return (
                  <td key={c} className={cn("px-4 py-3 tabular-nums", numVal !== null && numVal < 0 && "text-[var(--color-loss)]", numVal !== null && numVal > 0 && "text-[var(--color-profit)]")}>
                    {typeof val === "number" && c.toLowerCase().includes("pnl") ? `$${val.toFixed(2)}` : typeof val === "number" && c.toLowerCase().includes("rate") ? `${(val * 100).toFixed(1)}%` : String(val)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SymbolTab() {
  const { data, isLoading } = useReport("symbol")
  return (
    <div className="flex flex-col gap-6">
      {isLoading ? <div className="h-56 animate-pulse rounded bg-[var(--color-bg-elevated)]" /> : <SymbolChart data={data ?? []} />}
      {data && (
        <TableReport
          columns={["Symbol", "Trades", "Net P&L", "Avg P&L", "Win Rate"]}
          rows={(data as { symbol: string; trades: number; netPnl: number; avgPnl: number; winRate: number }[]).map((r) => ({
            Symbol: r.symbol, Trades: r.trades, "Net P&L": r.netPnl, "Avg P&L": r.avgPnl, "Win Rate": r.winRate,
          }))}
        />
      )}
    </div>
  )
}

function PlaybookTab() {
  const { data, isLoading } = useReport("playbook")
  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <div className="h-56 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={(data ?? []) as { playbook: string; netPnl: number }[]} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
            <XAxis dataKey="playbook" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={65} />
            <Tooltip {...chartStyle} formatter={(v) => [`$${Number(v).toFixed(2)}`, "Net P&L"]} />
            <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
              {((data ?? []) as { netPnl: number }[]).map((r, i) => (
                <Cell key={i} fill={r.netPnl >= 0 ? "var(--color-profit)" : "var(--color-loss)"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      {data && (
        <TableReport
          columns={["Playbook", "Trades", "Net P&L", "Avg P&L", "Win Rate"]}
          rows={(data as { playbook: string; trades: number; netPnl: number; avgPnl: number; winRate: number }[]).map((r) => ({
            Playbook: r.playbook, Trades: r.trades, "Net P&L": r.netPnl, "Avg P&L": r.avgPnl, "Win Rate": r.winRate,
          }))}
        />
      )}
    </div>
  )
}

function TagsTab() {
  const { data, isLoading } = useReport("tags")
  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <div className="h-56 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={(data ?? []) as { tag: string; netPnl: number }[]} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
            <YAxis type="category" dataKey="tag" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
            <Tooltip {...chartStyle} formatter={(v) => [`$${Number(v).toFixed(2)}`, "Net P&L"]} />
            <Bar dataKey="netPnl" radius={[0, 4, 4, 0]}>
              {((data ?? []) as { netPnl: number }[]).map((r, i) => (
                <Cell key={i} fill={r.netPnl >= 0 ? "var(--color-profit)" : "var(--color-loss)"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      {data && (
        <TableReport
          columns={["Tag", "Trades", "Net P&L", "Win Rate"]}
          rows={(data as { tag: string; trades: number; netPnl: number; winRate: number }[]).map((r) => ({
            Tag: r.tag, Trades: r.trades, "Net P&L": r.netPnl, "Win Rate": r.winRate,
          }))}
        />
      )}
    </div>
  )
}

function TimeTab() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const { data, isLoading } = useReport("time", { period })
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(["daily", "weekly", "monthly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              period === p
                ? "bg-[var(--color-accent-primary)] text-white"
                : "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]",
            )}
          >
            {p}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="h-56 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={(data ?? []) as { date: string; netPnl: number }[]} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={65} />
            <Tooltip {...chartStyle} formatter={(v) => [`$${Number(v).toFixed(2)}`, "Net P&L"]} />
            <Line type="monotone" dataKey="netPnl" stroke="var(--color-accent-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function WinLossTab() {
  const { data, isLoading } = useReport("win-loss")
  if (isLoading) return <div className="h-48 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
  if (!data) return null
  const d = data as Record<string, number>
  const rows = [
    { Metric: "Total Trades", Value: d.total },
    { Metric: "Wins", Value: d.wins },
    { Metric: "Losses", Value: d.losses },
    { Metric: "Win Rate", Value: `${((d.winRate ?? 0) * 100).toFixed(1)}%` },
    { Metric: "Total Net P&L", Value: `$${d.totalNetPnl?.toFixed(2)}` },
    { Metric: "Gross Profit", Value: `$${d.grossProfit?.toFixed(2)}` },
    { Metric: "Gross Loss", Value: `$${d.grossLoss?.toFixed(2)}` },
    { Metric: "Profit Factor", Value: d.profitFactor },
    { Metric: "Avg Win", Value: `$${d.avgWin?.toFixed(2)}` },
    { Metric: "Avg Loss", Value: `$${d.avgLoss?.toFixed(2)}` },
    { Metric: "Best Trade", Value: `$${d.bestTrade?.toFixed(2)}` },
    { Metric: "Worst Trade", Value: `$${d.worstTrade?.toFixed(2)}` },
    { Metric: "Expectancy", Value: `$${d.expectancy}` },
  ]
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <div key={r.Metric} className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] px-4 py-3 flex flex-col gap-1">
          <span className="text-xs text-[var(--color-text-muted)]">{r.Metric}</span>
          <span className="text-base font-semibold text-[var(--color-text-primary)]">{String(r.Value)}</span>
        </div>
      ))}
    </div>
  )
}

function RiskTab() {
  const { data, isLoading } = useReport("risk")
  if (isLoading) return <div className="h-48 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
  const rows = ((data ?? []) as { symbol: string; netPnl: number; rr: number | null; mae: number | null; mfe: number | null }[])
    .filter((r) => r.rr !== null)
    .sort((a, b) => (b.rr ?? 0) - (a.rr ?? 0))
    .slice(0, 20)
  return (
    <TableReport
      columns={["Symbol", "MAE", "MFE", "R:R", "Net P&L"]}
      rows={rows.map((r) => ({
        Symbol: r.symbol,
        MAE: r.mae !== null ? `$${r.mae.toFixed(2)}` : "—",
        MFE: r.mfe !== null ? `$${r.mfe.toFixed(2)}` : "—",
        "R:R": r.rr?.toFixed(2) ?? "—",
        "Net P&L": r.netPnl,
      }))}
    />
  )
}

export default function ReportsPage() {
  const [tab, setTab] = useState<TabId>("symbol")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Analytics", href: "/dashboard/analytics" },
          { label: "Reports" },
        ]}
      />

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-[var(--color-accent-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        {tab === "symbol" && <SymbolTab />}
        {tab === "playbook" && <PlaybookTab />}
        {tab === "tags" && <TagsTab />}
        {tab === "time" && <TimeTab />}
        {tab === "win-loss" && <WinLossTab />}
        {tab === "risk" && <RiskTab />}
      </div>
    </div>
  )
}
