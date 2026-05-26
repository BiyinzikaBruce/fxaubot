"use client"

import { use } from "react"
import Link from "next/link"
import { format, formatDuration, intervalToDuration } from "date-fns"
import { ArrowLeft, Star } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useTrade, useUpdateTrade } from "@/hooks/use-trades"
import { cn } from "@/lib/utils"

function Stat({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
      <span className="text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">{value}</span>
    </div>
  )
}

function pnlFmt(n: number | null) {
  if (n === null) return "Open"
  const sign = n >= 0 ? "+" : ""
  return `${sign}$${Math.abs(n).toFixed(2)}`
}

function durationFmt(seconds: number | null) {
  if (!seconds) return "—"
  const dur = intervalToDuration({ start: 0, end: seconds * 1000 })
  return formatDuration(dur, { format: ["days", "hours", "minutes"] }) || "<1 min"
}

type Props = { params: Promise<{ tradeId: string }> }

export default function TradeDetailPage({ params }: Props) {
  const { tradeId } = use(params)
  const { data: trade, isLoading } = useTrade(tradeId)
  const { mutate: updateTrade } = useUpdateTrade()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-[var(--color-bg-card)]" />
        <div className="h-48 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-[var(--color-text-secondary)]">Trade not found</p>
        <Link href="/dashboard/journal" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          Back to Journal
        </Link>
      </div>
    )
  }

  const isWin = (trade.netPnl ?? 0) > 0
  const rr =
    trade.mae && trade.mfe && trade.mae !== 0
      ? (trade.mfe / trade.mae).toFixed(2)
      : "—"

  // Efficiency = netPnl / mfe (how much of the max favorable move was captured)
  const efficiency =
    trade.mfe && trade.mfe !== 0 && trade.netPnl !== null
      ? Math.min(100, Math.max(0, (trade.netPnl / trade.mfe) * 100)).toFixed(0)
      : null

  function updateRating(r: number) {
    updateTrade({ tradeId: trade!.id, data: { rating: r } })
  }

  function updateNotes(notes: string) {
    updateTrade({ tradeId: trade!.id, data: { notes } })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${trade.symbol} ${trade.side.toUpperCase()}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Journal", href: "/dashboard/journal" },
          { label: trade.symbol },
        ]}
        actions={
          <Link
            href="/dashboard/journal"
            className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        <Stat
          label="Net P&L"
          value={
            <span className={isWin ? "text-[var(--color-profit)]" : "text-[var(--color-loss)]"}>
              {pnlFmt(trade.netPnl)}
            </span>
          }
        />
        <Stat label="Gross P&L" value={pnlFmt(trade.grossPnl)} />
        <Stat label="Fees" value={`$${trade.fees.toFixed(2)}`} />
        <Stat label="MAE" value={trade.mae !== null ? `$${trade.mae.toFixed(2)}` : "—"} />
        <Stat label="MFE" value={trade.mfe !== null ? `$${trade.mfe.toFixed(2)}` : "—"} />
        <Stat label="Duration" value={durationFmt(trade.duration)} />
        <Stat label="Entry" value={trade.entryPrice.toLocaleString()} />
        <Stat label="Exit" value={trade.exitPrice?.toLocaleString() ?? "Open"} />
        <Stat label="Quantity" value={trade.quantity} />
        <Stat label="R:R" value={rr} />
        <Stat
          label="Entry Date"
          value={format(new Date(trade.entryAt), "MMM d, yyyy HH:mm")}
        />
        <Stat
          label="Exit Date"
          value={trade.exitAt ? format(new Date(trade.exitAt), "MMM d, yyyy HH:mm") : "—"}
        />
      </div>

      {/* Efficiency bar */}
      {efficiency !== null && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Trade Efficiency</span>
            <span className="text-sm font-bold text-[var(--color-accent-primary)]">{efficiency}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--color-bg-elevated)]">
            <div
              className="h-2 rounded-full bg-[var(--color-accent-primary)] transition-all"
              style={{ width: `${efficiency}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
            Captured {efficiency}% of maximum favorable excursion
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Tags + Playbook */}
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Tags</p>
            {trade.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {trade.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex h-6 items-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2.5 text-xs text-[var(--color-text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">No tags</p>
            )}
          </div>
          {trade.playbook && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Playbook</p>
              <span className="text-sm text-[var(--color-accent-primary)]">{trade.playbook.name}</span>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => updateRating(r)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className="h-5 w-5"
                    fill={(trade.rating ?? 0) >= r ? "#FACC15" : "transparent"}
                    stroke={(trade.rating ?? 0) >= r ? "#FACC15" : "var(--color-border-subtle)"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="lg:col-span-2 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Notes</p>
          <textarea
            defaultValue={trade.notes ?? ""}
            onBlur={(e) => updateNotes(e.target.value)}
            rows={6}
            placeholder="Add trade notes, observations, and lessons learned..."
            className="w-full resize-none rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors placeholder:text-[var(--color-text-muted)]"
          />
          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">Auto-saved on blur</p>
        </div>
      </div>
    </div>
  )
}
