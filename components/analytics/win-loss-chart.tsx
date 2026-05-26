"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

type WinLossChartProps = {
  wins: number
  losses: number
}

export function WinLossChart({ wins, losses }: WinLossChartProps) {
  const data = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          <Cell fill="var(--color-profit)" />
          <Cell fill="var(--color-loss)" />
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
