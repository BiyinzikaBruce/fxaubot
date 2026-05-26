"use client"

import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Trade } from "@/hooks/use-trades"

type RecentTradesProps = {
  trades: Trade[]
}

export function RecentTrades({ trades }: RecentTradesProps) {
  if (!trades.length) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No trades yet</p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
      {trades.map((trade) => {
        const pnl = trade.netPnl ?? 0
        const isWin = pnl > 0
        return (
          <Link
            key={trade.id}
            href={`/dashboard/journal/${trade.id}`}
            className="flex items-center justify-between py-3 hover:bg-[var(--color-bg-elevated)] px-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex h-6 w-12 items-center justify-center rounded text-[10px] font-bold uppercase",
                  trade.side === "long"
                    ? "bg-[var(--color-profit)]/15 text-[var(--color-profit)]"
                    : "bg-[var(--color-loss)]/15 text-[var(--color-loss)]",
                )}
              >
                {trade.side}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{trade.symbol}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {format(new Date(trade.entryAt), "MMM d, HH:mm")}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                isWin ? "text-[var(--color-profit)]" : "text-[var(--color-loss)]",
              )}
            >
              {isWin ? "+" : ""}${pnl.toFixed(2)}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
