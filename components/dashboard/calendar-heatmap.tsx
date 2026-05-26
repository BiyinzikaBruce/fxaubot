"use client"

import { useMemo } from "react"
import { eachDayOfInterval, format, startOfYear, endOfToday, getDay } from "date-fns"
import { cn } from "@/lib/utils"

type CalendarHeatmapProps = {
  data: { date: string; pnl: number }[]
}

function getColor(pnl: number | undefined) {
  if (pnl === undefined) return "bg-[var(--color-bg-elevated)]"
  if (pnl > 500) return "bg-[var(--color-profit)] opacity-100"
  if (pnl > 100) return "bg-[var(--color-profit)] opacity-70"
  if (pnl > 0) return "bg-[var(--color-profit)] opacity-40"
  if (pnl < -500) return "bg-[var(--color-loss)] opacity-100"
  if (pnl < -100) return "bg-[var(--color-loss)] opacity-70"
  if (pnl < 0) return "bg-[var(--color-loss)] opacity-40"
  return "bg-[var(--color-bg-elevated)]"
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const pnlMap = useMemo(() => {
    const m: Record<string, number> = {}
    for (const d of data) m[d.date] = d.pnl
    return m
  }, [data])

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfYear(new Date()), end: endOfToday() }),
    [],
  )

  // pad start so first day aligns with correct weekday
  const startPad = getDay(days[0])

  const weeks: (Date | null)[][] = []
  let week: (Date | null)[] = Array(startPad).fill(null)
  for (const day of days) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)])

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {wk.map((day, di) => {
              if (!day) return <div key={di} className="h-3 w-3" />
              const key = format(day, "yyyy-MM-dd")
              const pnl = pnlMap[key]
              const label = pnl !== undefined ? `${key}: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}` : key
              return (
                <div
                  key={di}
                  className={cn("h-3 w-3 rounded-sm transition-opacity", getColor(pnl))}
                  title={label}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
        <span>Less</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-[var(--color-bg-elevated)]" />
        <div className="h-2.5 w-2.5 rounded-sm bg-[var(--color-profit)] opacity-40" />
        <div className="h-2.5 w-2.5 rounded-sm bg-[var(--color-profit)] opacity-70" />
        <div className="h-2.5 w-2.5 rounded-sm bg-[var(--color-profit)]" />
        <span>More</span>
      </div>
    </div>
  )
}
