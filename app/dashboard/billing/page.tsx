"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useSubscriptions, useCreateSubscription, type Subscription } from "@/hooks/use-subscriptions"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    id: "pro",
    name: "Pro",
    monthly: 49.99,
    yearly: 479.99,
    features: ["Trading Journal", "Analytics Dashboard", "1 Active Bot", "Signal Feed", "Basic Backtesting"],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    monthly: 99.99,
    yearly: 959.99,
    features: ["Everything in Pro", "Unlimited Bots", "Copy Trading", "Unlimited Backtesting", "Mentor Access", "Education"],
    highlighted: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    monthly: 299.99,
    yearly: 2879.99,
    features: ["Everything in Ultimate", "MT5 Account Connection", "Prop Firm Sync", "Custom Strategy Builder", "API Access", "Priority Support"],
    elite: true,
  },
]

const WALLETS = {
  trc20: process.env.NEXT_PUBLIC_USDT_TRC20 ?? "TRX_WALLET_ADDRESS_HERE",
  erc20: process.env.NEXT_PUBLIC_USDT_ERC20 ?? "ETH_WALLET_ADDRESS_HERE",
}

const STATUS_STYLE: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  pending: { icon: Clock, color: "var(--color-text-muted)", label: "Pending" },
  active: { icon: CheckCircle, color: "var(--color-profit)", label: "Active" },
  expired: { icon: XCircle, color: "var(--color-loss)", label: "Expired" },
  rejected: { icon: XCircle, color: "var(--color-loss)", label: "Rejected" },
}

export default function BillingPage() {
  const { data: session } = useSession()
  const { data: subscriptions = [], isLoading } = useSubscriptions()
  const subs = subscriptions as Subscription[]
  const { mutateAsync: createSub, isPending } = useCreateSubscription()

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const [network, setNetwork] = useState<"trc20" | "erc20">("trc20")
  const [txHash, setTxHash] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const currentPlan = session?.user ? (session.user as { plan?: string }).plan ?? "none" : "none"

  const amount = selectedPlan
    ? (billing === "yearly" ? PLANS.find((p) => p.id === selectedPlan)?.yearly : PLANS.find((p) => p.id === selectedPlan)?.monthly) ?? 0
    : 0

  async function handleSubmit() {
    if (!selectedPlan || !txHash.trim()) return
    setError("")
    try {
      await createSub({ plan: selectedPlan, billing, amountUSDT: amount, network, txHash: txHash.trim() })
      setSuccess(true)
      setTxHash("")
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Billing"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Billing" }]}
      />

      {/* Current plan */}
      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Current Plan</p>
          <p className="mt-0.5 text-lg font-bold text-[var(--color-text-primary)] capitalize">{currentPlan === "none" ? "Free" : currentPlan}</p>
        </div>
        {currentPlan !== "none" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-profit)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-profit)]">
            <CheckCircle className="h-3.5 w-3.5" /> Active
          </span>
        )}
      </div>

      {/* Plan selector */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Choose a Plan</p>
          <div className="flex gap-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-1">
            {(["monthly", "yearly"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)}
                className={cn("rounded px-3 py-1 text-xs font-medium capitalize transition-colors", billing === b ? "bg-[var(--color-accent-primary)] text-white" : "text-[var(--color-text-secondary)]")}>
                {b} {b === "yearly" && <span className="text-[10px] opacity-80">Save 20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "rounded-[14px] border p-5 text-left transition-all",
                selectedPlan === plan.id
                  ? plan.elite ? "border-[#F5A623] bg-[#F5A623]/10" : "border-[var(--color-accent-primary)] bg-[var(--color-accent-glow)]"
                  : plan.elite ? "border-[#F5A623]/40 bg-[var(--color-bg-card)]" : plan.highlighted ? "border-[var(--color-accent-primary)]/40 bg-[var(--color-bg-card)]" : "border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]",
              )}>
              <div className="flex items-start justify-between">
                <p className="font-bold text-[var(--color-text-primary)]">{plan.name}</p>
                {plan.highlighted && <span className="rounded-full bg-[var(--color-accent-primary)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent-primary)]">POPULAR</span>}
                {plan.elite && <span className="rounded-full bg-[#F5A623]/15 px-2 py-0.5 text-[10px] font-bold text-[#F5A623]">ELITE</span>}
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                ${billing === "yearly" ? plan.yearly : plan.monthly}
                <span className="text-sm font-normal text-[var(--color-text-muted)]">/{billing === "yearly" ? "yr" : "mo"}</span>
              </p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                    <CheckCircle className="h-3.5 w-3.5 text-[var(--color-profit)] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* Payment form */}
      {selectedPlan && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Pay with USDT</p>

          <div className="flex gap-2">
            {(["trc20", "erc20"] as const).map((n) => (
              <button key={n} onClick={() => setNetwork(n)}
                className={cn("rounded-lg border px-4 py-2 text-xs font-semibold uppercase transition-colors", network === n ? "bg-[var(--color-accent-primary)] text-white border-transparent" : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]")}>
                {n === "trc20" ? "USDT TRC-20 (Tron)" : "USDT ERC-20 (Ethereum)"}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-[var(--color-bg-elevated)] p-4">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Send exactly</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">${amount} USDT</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-2 mb-1">To this address ({network.toUpperCase()})</p>
            <p className="font-mono text-xs text-[var(--color-accent-primary)] break-all">{WALLETS[network]}</p>
          </div>

          <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
            Transaction Hash (TX ID)
            <input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x..." className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none font-mono" />
          </label>

          {error && <p className="text-xs text-[var(--color-loss)] bg-[var(--color-loss)]/10 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-xs text-[var(--color-profit)] bg-[var(--color-profit)]/10 rounded-lg px-3 py-2">Submitted! Your subscription will be activated after manual verification (usually within 24 hours).</p>}

          <button onClick={handleSubmit} disabled={isPending || !txHash.trim()}
            className="rounded-lg bg-[var(--color-accent-primary)] py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
            <CreditCard className="h-4 w-4" />
            {isPending ? "Submitting…" : "Submit Payment"}
          </button>
        </div>
      )}

      {/* Subscription history */}
      {!isLoading && subs.length > 0 && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
          <div className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Payment History</p>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {subs.map((s: Subscription) => {
              const st = STATUS_STYLE[s.status] ?? STATUS_STYLE.pending
              const Icon = st.icon
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] capitalize">{s.plan} · {s.billing}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">${s.amountUSDT} USDT · {s.network.toUpperCase()} · {format(new Date(s.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: st.color }}>
                    <Icon className="h-3.5 w-3.5" /> {st.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
