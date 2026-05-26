"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

type SymbolRow = { symbol: string; netPnl: number; trades: number }

type SymbolChartProps = {
  data: SymbolRow[]
}

export function SymbolChart({ data }: SymbolChartProps) {
  const sorted = [...data].sort((a, b) => b.netPnl - a.netPnl).slice(0, 8)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
        <XAxis
          dataKey="symbol"
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.replace("/USDT", "").replace("/USD", "")}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v.toLocaleString()}`}
          width={65}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v, name) => [
            name === "netPnl" ? `$${Number(v ?? 0).toFixed(2)}` : Number(v),
            name === "netPnl" ? "Net P&L" : "Trades",
          ]}
        />
        <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
          {sorted.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.netPnl >= 0 ? "var(--color-profit)" : "var(--color-loss)"}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
