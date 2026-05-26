"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import type { TradeFilters } from "@/hooks/use-trades"
import type { TradingAccount } from "@/hooks/use-accounts"

type TradeFiltersProps = {
  filters: TradeFilters
  onChange: (f: TradeFilters) => void
  accounts: TradingAccount[]
}

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "EUR/USD", "GBP/USD"]

export function TradeFiltersPanel({ filters, onChange, accounts }: TradeFiltersProps) {
  const [open, setOpen] = useState(false)

  function set(key: keyof TradeFilters, value: string | undefined) {
    onChange({ ...filters, [key]: value || undefined, page: 1 })
  }

  const activeCount = Object.entries(filters).filter(([k, v]) => k !== "page" && k !== "limit" && v).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-primary)] text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            onClick={() => onChange({ page: 1 })}
            className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {open && (
        <div className="grid grid-cols-2 gap-3 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-muted)]">Account</label>
            <select
              value={filters.accountId ?? ""}
              onChange={(e) => set("accountId", e.target.value)}
              className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
            >
              <option value="">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-muted)]">Symbol</label>
            <select
              value={filters.symbol ?? ""}
              onChange={(e) => set("symbol", e.target.value)}
              className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
            >
              <option value="">All symbols</option>
              {SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-muted)]">Side</label>
            <select
              value={filters.side ?? ""}
              onChange={(e) => set("side", e.target.value)}
              className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
            >
              <option value="">Both</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-muted)]">From</label>
            <input
              type="date"
              value={filters.from ?? ""}
              onChange={(e) => set("from", e.target.value)}
              className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-muted)]">To</label>
            <input
              type="date"
              value={filters.to ?? ""}
              onChange={(e) => set("to", e.target.value)}
              className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-muted)]">Tag</label>
            <input
              type="text"
              placeholder="e.g. breakout"
              value={filters.tags ?? ""}
              onChange={(e) => set("tags", e.target.value)}
              className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
