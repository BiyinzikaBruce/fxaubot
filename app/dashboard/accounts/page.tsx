"use client"

import { useState } from "react"
import { Wallet, Plus, Trash2, Star, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useAccounts, useCreateAccount, useDeleteAccount, type TradingAccount } from "@/hooks/use-accounts"
import { useOandaAccounts, useSyncOandaAccount } from "@/hooks/use-oanda-accounts"
import { ConnectOandaModal } from "@/components/dashboard/connect-oanda-modal"

const EXCHANGES = ["manual", "binance", "bybit", "okx", "coinbase"]
const inputCls = "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] w-full"

const EXCHANGE_COLOR: Record<string, string> = {
  binance: "#F0B90B",
  bybit: "#F7A600",
  okx: "#00C2FF",
  coinbase: "#0052FF",
  oanda: "#4F8EF7",
  manual: "var(--color-accent-primary)",
}

function ConnectionBadge({ status }: { status?: string | null }) {
  if (!status) return null
  if (status === "connected") return (
    <span className="flex items-center gap-1 text-xs font-medium text-green-400">
      <CheckCircle2 className="h-3.5 w-3.5" /> Connected
    </span>
  )
  if (status === "failed") return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-400">
      <XCircle className="h-3.5 w-3.5" /> Failed
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-yellow-400">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting
    </span>
  )
}

function OandaAccountCard({ acc }: { acc: TradingAccount }) {
  const { mutate: sync, isPending } = useSyncOandaAccount()
  const { mutate: del } = useDeleteAccount()

  return (
    <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)" }}>
            O
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-[var(--color-text-primary)]">{acc.name}</p>
              {acc.isDefault && <Star className="h-3.5 w-3.5 text-[#F0B90B] fill-[#F0B90B]" />}
              <span className={cn(
                "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
                acc.oandaEnvironment === "live"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-yellow-500/15 text-yellow-400"
              )}>
                {acc.oandaEnvironment ?? "practice"}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              OANDA · {acc.oandaAccountId} · {acc.currency}
            </p>
            <div className="mt-1">
              <ConnectionBadge status={acc.connectionStatus} />
              {acc.lastError && (
                <p className="text-xs text-red-400 mt-0.5">{acc.lastError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-[var(--color-text-primary)]">
              ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Balance</p>
            {acc.equity != null && (
              <>
                <p className="text-sm font-semibold text-[var(--color-text-secondary)] mt-1">
                  ${acc.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Equity</p>
              </>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => sync(acc.id)}
              disabled={isPending}
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10 transition-colors disabled:opacity-40"
              title="Sync account"
            >
              <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
            </button>
            <button
              onClick={() => { if (confirm(`Delete "${acc.name}"?`)) del(acc.id) }}
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-loss)] hover:bg-[var(--color-loss)]/10 transition-colors"
              title="Delete account"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {acc.lastSyncedAt && (
        <p className="text-[10px] text-[var(--color-text-muted)] mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
          Last synced {new Date(acc.lastSyncedAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts()
  const { data: oandaAccounts } = useOandaAccounts()
  const accs = (accounts as TradingAccount[]).filter((a) => a.exchange !== "oanda")
  const { mutate: create, isPending } = useCreateAccount()
  const { mutate: del } = useDeleteAccount()

  const [showForm, setShowForm] = useState(false)
  const [showOandaModal, setShowOandaModal] = useState(false)
  const [name, setName] = useState("")
  const [exchange, setExchange] = useState("manual")
  const [balance, setBalance] = useState(0)
  const [currency, setCurrency] = useState("USDT")

  function handleCreate() {
    if (!name) return
    create({ name, exchange, balance, currency }, {
      onSuccess: () => { setShowForm(false); setName(""); setBalance(0) },
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <PageHeader
        title="Accounts"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Accounts" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOandaModal(true)}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10 transition-colors"
            >
              <Plus className="h-4 w-4" /> Connect OANDA
            </button>
            <button onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Manual
            </button>
          </div>
        }
      />

      {/* OANDA accounts section */}
      {oandaAccounts.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">OANDA Forex</p>
          {oandaAccounts.map((acc) => <OandaAccountCard key={acc.id} acc={acc} />)}
        </div>
      )}

      {/* Manual / other accounts */}
      <div className="flex flex-col gap-3">
        {(oandaAccounts.length > 0 || accs.length > 0) && (
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Other Accounts</p>
        )}

        {showForm && (
          <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">New Account</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
                Account name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Binance" className={inputCls} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
                Exchange
                <select value={exchange} onChange={(e) => setExchange(e.target.value)} className={inputCls}>
                  {EXCHANGES.map((ex) => <option key={ex} value={ex}>{ex.charAt(0).toUpperCase() + ex.slice(1)}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
                Starting balance
                <input type="number" value={balance} onChange={(e) => setBalance(parseFloat(e.target.value))} className={inputCls} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
                Currency
                <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USDT" className={inputCls} />
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={isPending || !name}
                className="rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-40">
                {isPending ? "Creating…" : "Create"}
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">Cancel</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />)}
          </div>
        ) : accs.length === 0 && oandaAccounts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
            <Wallet className="h-8 w-8 text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)]">No accounts yet.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowOandaModal(true)}
                className="rounded-lg border border-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10 transition-colors">
                Connect OANDA
              </button>
              <button onClick={() => setShowForm(true)}
                className="rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm text-white hover:opacity-90">
                Add manual
              </button>
            </div>
          </div>
        ) : accs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {accs.map((acc: TradingAccount) => (
              <div key={acc.id} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: EXCHANGE_COLOR[acc.exchange] ?? "var(--color-accent-primary)" }}>
                      {acc.exchange[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--color-text-primary)]">{acc.name}</p>
                        {acc.isDefault && <Star className="h-3.5 w-3.5 text-[#F0B90B] fill-[#F0B90B]" />}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] capitalize">{acc.exchange} · {acc.currency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">${acc.balance.toLocaleString()}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Balance</p>
                    </div>
                    <button onClick={() => { if (confirm(`Delete "${acc.name}"?`)) del(acc.id) }}
                      className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-loss)] hover:bg-[var(--color-loss)]/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {showOandaModal && <ConnectOandaModal onClose={() => setShowOandaModal(false)} />}
    </div>
  )
}
