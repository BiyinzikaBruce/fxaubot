"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import type { Trade } from "@/hooks/use-trades"

type TradeTableProps = {
  trades: Trade[]
  onDelete?: (id: string) => void
}

function pnlColor(pnl: number | null) {
  if (pnl === null) return "text-[var(--color-text-muted)]"
  return pnl >= 0 ? "text-[var(--color-profit)]" : "text-[var(--color-loss)]"
}

function pnlDisplay(pnl: number | null) {
  if (pnl === null) return "Open"
  return `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-[var(--color-text-muted)]">—</span>
  return (
    <span className="text-yellow-400 text-xs tracking-tighter">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  )
}

export function TradeTable({ trades, onDelete }: TradeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "entryAt", desc: true }])

  const columns = useMemo<ColumnDef<Trade>[]>(
    () => [
      {
        id: "entryAt",
        accessorKey: "entryAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
            {format(new Date(row.original.entryAt), "MMM d, HH:mm")}
          </span>
        ),
        sortingFn: "datetime",
      },
      {
        id: "symbol",
        accessorKey: "symbol",
        header: "Symbol",
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium">{row.original.symbol}</span>
        ),
      },
      {
        id: "side",
        accessorKey: "side",
        header: "Side",
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex h-5 w-10 items-center justify-center rounded text-[10px] font-bold uppercase",
              row.original.side === "long"
                ? "bg-[var(--color-profit)]/15 text-[var(--color-profit)]"
                : "bg-[var(--color-loss)]/15 text-[var(--color-loss)]",
            )}
          >
            {row.original.side}
          </span>
        ),
      },
      {
        id: "entryPrice",
        accessorKey: "entryPrice",
        header: "Entry",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">{row.original.entryPrice.toLocaleString()}</span>
        ),
      },
      {
        id: "exitPrice",
        accessorKey: "exitPrice",
        header: "Exit",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {row.original.exitPrice?.toLocaleString() ?? <span className="text-[var(--color-text-muted)]">—</span>}
          </span>
        ),
      },
      {
        id: "netPnl",
        accessorKey: "netPnl",
        header: "Net P&L",
        cell: ({ row }) => (
          <span className={cn("text-sm font-semibold tabular-nums", pnlColor(row.original.netPnl))}>
            {pnlDisplay(row.original.netPnl)}
          </span>
        ),
      },
      {
        id: "tags",
        header: "Tags",
        cell: ({ row }) =>
          row.original.tags.length ? (
            <div className="flex flex-wrap gap-1 max-w-[160px]">
              {row.original.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-4 items-center rounded px-1.5 text-[10px] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                >
                  {tag}
                </span>
              ))}
              {row.original.tags.length > 2 && (
                <span className="text-[10px] text-[var(--color-text-muted)]">+{row.original.tags.length - 2}</span>
              )}
            </div>
          ) : (
            <span className="text-[var(--color-text-muted)]">—</span>
          ),
      },
      {
        id: "playbook",
        header: "Playbook",
        cell: ({ row }) =>
          row.original.playbook ? (
            <span className="text-xs text-[var(--color-accent-primary)] truncate max-w-[100px] block">
              {row.original.playbook.name}
            </span>
          ) : (
            <span className="text-[var(--color-text-muted)]">—</span>
          ),
      },
      {
        id: "rating",
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => <StarRating rating={row.original.rating} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/journal/${row.original.id}`}
              className="text-xs text-[var(--color-accent-primary)] hover:underline whitespace-nowrap"
            >
              View
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(row.original.id)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-loss)]"
              >
                Delete
              </button>
            )}
          </div>
        ),
      },
    ],
    [onDelete],
  )

  const table = useReactTable({
    data: trades,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  // Group rows by day
  const rows = table.getRowModel().rows
  const groupedRows = useMemo(() => {
    const out: ({ type: "header"; date: string } | { type: "row"; row: (typeof rows)[0] })[] = []
    let lastDate = ""
    for (const row of rows) {
      const d = format(new Date(row.original.entryAt), "EEEE, MMMM d yyyy")
      if (d !== lastDate) {
        out.push({ type: "header", date: d })
        lastDate = d
      }
      out.push({ type: "row", row })
    }
    return out
  }, [rows])

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-[14px] border border-[var(--color-border-subtle)]">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-[var(--color-border-subtle)]">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] whitespace-nowrap"
                  >
                    {header.column.getCanSort() ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {groupedRows.map((item, i) =>
              item.type === "header" ? (
                <tr key={`header-${i}`} className="bg-[var(--color-bg-elevated)]">
                  <td
                    colSpan={columns.length}
                    className="px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide"
                  >
                    {item.date}
                  </td>
                </tr>
              ) : (
                <tr
                  key={item.row.id}
                  className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                >
                  {item.row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ),
            )}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[var(--color-text-muted)] text-sm">
                  No trades found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
        <span>
          {rows.length} of {table.getRowCount()} trades
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded border border-[var(--color-border-subtle)] disabled:opacity-40 hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            Prev
          </button>
          <span className="tabular-nums">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded border border-[var(--color-border-subtle)] disabled:opacity-40 hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
