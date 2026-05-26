"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Download } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { TradeTable } from "@/components/journal/trade-table"
import { TradeFiltersPanel } from "@/components/journal/trade-filters"
import { useTrades, useDeleteTrade, type TradeFilters } from "@/hooks/use-trades"
import { useAccounts } from "@/hooks/use-accounts"

function exportCSV(trades: { entryAt: string; symbol: string; side: string; entryPrice: number; exitPrice: number | null; quantity: number; netPnl: number | null; tags: string[]; notes: string | null }[]) {
  const header = "Date,Symbol,Side,Entry,Exit,Quantity,Net P&L,Tags,Notes"
  const rows = trades.map((t) =>
    [
      t.entryAt,
      t.symbol,
      t.side,
      t.entryPrice,
      t.exitPrice ?? "",
      t.quantity,
      t.netPnl ?? "",
      t.tags.join("|"),
      (t.notes ?? "").replace(/,/g, ";"),
    ].join(","),
  )
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `fxau-trades-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function JournalPage() {
  const [filters, setFilters] = useState<TradeFilters>({ limit: 50, page: 1 })
  const { data, isLoading } = useTrades(filters)
  const { data: accounts = [] } = useAccounts()
  const { mutate: deleteTrade } = useDeleteTrade()

  function handleDelete(id: string) {
    if (confirm("Delete this trade? This cannot be undone.")) deleteTrade(id)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Trade Journal"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Journal" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => data && exportCSV(data.trades)}
              disabled={!data?.trades.length}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-40 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <Link
              href="/dashboard/journal/add"
              className="flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Add Trade
            </Link>
          </div>
        }
      />

      <TradeFiltersPanel filters={filters} onChange={setFilters} accounts={accounts} />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--color-bg-card)]" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center text-sm text-[var(--color-text-muted)]">
            <span>{data?.total ?? 0} total trades</span>
          </div>
          <TradeTable trades={data?.trades ?? []} onDelete={handleDelete} />
        </>
      )}
    </div>
  )
}
