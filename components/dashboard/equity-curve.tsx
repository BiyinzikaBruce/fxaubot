"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

type Point = { date: string; cumulative: number; pnl: number }

type EquityCurveProps = {
  data: Point[]
}

function fmt(n: number) {
  return n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`
}

export function EquityCurve({ data }: EquityCurveProps) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[var(--color-text-muted)]">
        No trade data yet
      </div>
    )
  }

  const isPositive = (data.at(-1)?.cumulative ?? 0) >= 0

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v.toLocaleString()}`}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [fmt(Number(v ?? 0)), "Cumulative P&L"]}
          labelStyle={{ color: "var(--color-text-secondary)", marginBottom: 4 }}
        />
        <ReferenceLine y={0} stroke="var(--color-border-subtle)" strokeDasharray="4 2" />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke={isPositive ? "var(--color-profit)" : "var(--color-loss)"}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: isPositive ? "var(--color-profit)" : "var(--color-loss)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
