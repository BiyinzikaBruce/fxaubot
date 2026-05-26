"use client"

import { useState } from "react"
import { Wallet, Plus, Trash2, Star } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useAccounts, useCreateAccount, useDeleteAccount, type TradingAccount } from "@/hooks/use-accounts"
import { cn } from "@/lib/utils"

const EXCHANGES = ["manual", "binance", "bybit", "okx", "coinbase"]
const inputCls = "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] w-full"

const EXCHANGE_COLOR: Record<string, string> = {
  binance: "#F0B90B",
  bybit: "#F7A600",
  okx: "#00C2FF",
  coinbase: "#0052FF",
  manual: "var(--color-accent-primary)",
}

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts()
  const accs = accounts as TradingAccount[]
  const { mutate: create, isPending } = useCreateAccount()
  const { mutate: del } = useDeleteAccount()

  const [showForm, setShowForm] = useState(false)
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
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        title="Accounts"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Accounts" }]}
        actions={
          <button onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Account
          </button>
        }
      />

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
      ) : accs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
          <Wallet className="h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">No accounts yet. Add one to track your trades.</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
