"use client"

import { useState } from "react"
import { Plus, Loader2, AlertTriangle, Trash2, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMt5Accounts } from "@/hooks/use-mt5-accounts"
import { useDeleteAccount, type TradingAccount } from "@/hooks/use-accounts"
import { useSyncMt5Account } from "@/hooks/use-mt5-accounts"
import { ConnectMt5Modal } from "@/components/dashboard/connect-mt5-modal"

function fmtMoney(n?: number | null, currency?: string | null) {
  if (n === undefined || n === null) return "—"
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency ?? ""}`.trim()
}

const STATUS_DOT: Record<string, string> = {
  connecting: "bg-[var(--color-neutral)] animate-pulse",
  connected: "bg-[var(--color-profit)]",
  failed: "bg-[var(--color-loss)]",
  disconnected: "bg-[var(--color-text-tertiary)]",
}

function Mt5AccountCard({ account }: { account: TradingAccount }) {
  const isConnecting = account.connectionStatus === "connecting"
  useSyncMt5Account(account.id, { enabled: isConnecting, refetchInterval: isConnecting ? 4000 : false })
  const { mutate: del, isPending: deleting } = useDeleteAccount()

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] px-5 py-4 min-w-[260px]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7B5CF0] text-white text-sm font-bold">
        {(account.broker ?? "MT5")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{account.name}</p>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0",
              account.accountType === "live"
                ? "bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]",
            )}
          >
            {account.accountType}
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] truncate">
          {account.broker} · {account.mt5Server}
        </p>
        {account.connectionStatus === "failed" && account.lastError ? (
          <p className="flex items-center gap-1 text-[11px] text-[var(--color-loss)] mt-0.5">
            <AlertTriangle className="h-3 w-3 shrink-0" /> {account.lastError}
          </p>
        ) : (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {account.connectionStatus === "connected"
              ? `${fmtMoney(account.balance, account.currency)} bal · ${fmtMoney(account.equity, account.currency)} eq`
              : account.connectionStatus === "connecting"
                ? "Connecting to broker…"
                : "Disconnected"}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[account.connectionStatus ?? "disconnected"])} />
        <button
          onClick={() => { if (confirm(`Remove "${account.name}"?`)) del(account.id) }}
          disabled={deleting}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-loss)] hover:bg-[var(--color-loss-bg)] transition-colors disabled:opacity-40"
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

export function Mt5AccountsBar() {
  const { data: accounts, isLoading } = useMt5Accounts()
  const [showModal, setShowModal] = useState(false)

  if (isLoading) {
    return <div className="h-[88px] animate-pulse rounded-2xl bg-[var(--color-bg-card)]" />
  }

  if (accounts.length === 0) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-6 py-5 text-left transition-colors hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-card-hover)]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Connect your MT5 account</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Link a demo or live account with Exness, IC Markets, and more — your bots trade through it directly.
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent-primary)] px-3.5 py-2 text-sm font-semibold text-white shrink-0 group-hover:opacity-90">
            <Plus className="h-4 w-4" /> Connect
          </span>
        </button>
        <ConnectMt5Modal open={showModal} onClose={() => setShowModal(false)} />
      </>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {accounts.map((acc) => (
          <Mt5AccountCard key={acc.id} account={acc} />
        ))}
        <button
          onClick={() => setShowModal(true)}
          className="flex h-full min-w-[140px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[var(--color-border-default)] px-5 py-4 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs font-medium">Add account</span>
        </button>
      </div>
      <ConnectMt5Modal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
