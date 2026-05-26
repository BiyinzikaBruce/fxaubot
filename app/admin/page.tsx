"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Users, CreditCard, CheckCircle, XCircle, Shield } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

type AdminUser = {
  id: string; name: string; email: string; role: string; plan: string
  planExpiresAt: string | null; createdAt: string
  _count: { trades: number; botConfigs: number }
}

type AdminSub = {
  id: string; plan: string; billing: string; amountUSDT: number; network: string
  txHash: string; status: string; createdAt: string
  user: { id: string; name: string; email: string }
}

function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users")
      if (!res.ok) throw new Error("Unauthorized")
      return res.json()
    },
  })
}

function useAdminSubs() {
  return useQuery<AdminSub[]>({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/subscriptions")
      if (!res.ok) throw new Error("Unauthorized")
      return res.json()
    },
  })
}

function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { userId: string; role?: string; plan?: string }) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  })
}

function useUpdateSub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ subId, action }: { subId: string; action: "approve" | "reject" }) => {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subId, action }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subs"] })
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

const TABS = ["Users", "Subscriptions"] as const
type Tab = (typeof TABS)[number]

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--color-text-muted)",
  active: "var(--color-profit)",
  expired: "var(--color-loss)",
  rejected: "var(--color-loss)",
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("Users")
  const usersQuery = useAdminUsers()
  const subsQuery = useAdminSubs()
  const users = (usersQuery.data ?? []) as AdminUser[]
  const subs = (subsQuery.data ?? []) as AdminSub[]
  const { mutate: updateUser } = useUpdateUser()
  const { mutate: updateSub, isPending: subPending } = useUpdateSub()

  if (usersQuery.error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <Shield className="h-12 w-12 text-[var(--color-loss)]" />
        <p className="text-[var(--color-text-secondary)]">Admin access required.</p>
      </div>
    )
  }

  const pendingSubs = subs.filter((s) => s.status === "pending")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-[var(--color-accent-primary)]" />
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Admin Panel</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ["Total Users", users.length],
          ["Active Plans", users.filter((u) => u.plan !== "none").length],
          ["Pending Payments", pendingSubs.length],
          ["Revenue (USDT)", `$${subs.filter((s) => s.status === "active").reduce((a, s) => a + s.amountUSDT, 0).toLocaleString()}`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
            <p className="text-xs text-[var(--color-text-muted)]">{label as string}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">{value as string | number}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors relative", tab === t ? "bg-[var(--color-accent-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]")}>
            {t}
            {t === "Subscriptions" && pendingSubs.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-loss)] text-white text-[10px] flex items-center justify-center font-bold">
                {pendingSubs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "Users" && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)]">
                {["User", "Role", "Plan", "Trades", "Bots", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">Loading…</td></tr>
              ) : users.map((u: AdminUser) => (
                <tr key={u.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-text-primary)]">{u.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => updateUser({ userId: u.id, role: e.target.value })}
                      className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none capitalize">
                      {["admin", "mentor", "trader", "student"].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-[10px] font-bold capitalize", u.plan !== "none" ? "bg-[var(--color-profit)]/15 text-[var(--color-profit)]" : "bg-[var(--color-border-subtle)] text-[var(--color-text-muted)]")}>
                      {u.plan === "none" ? "free" : u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{u._count.trades}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{u._count.botConfigs}</td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    <a href={`/mentor/${u.id}`} className="text-xs text-[var(--color-accent-primary)] hover:underline">View Journal</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Subscriptions" && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)]">
                {["User", "Plan", "Amount", "Network", "TX Hash", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subsQuery.isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-muted)]">Loading…</td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No subscriptions yet</td></tr>
              ) : subs.map((s: AdminSub) => (
                <tr key={s.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-text-primary)]">{s.user.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{s.user.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{s.plan} · {s.billing}</td>
                  <td className="px-4 py-3 font-mono text-xs">${s.amountUSDT}</td>
                  <td className="px-4 py-3 text-xs uppercase text-[var(--color-text-muted)]">{s.network}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] block max-w-[120px] truncate" title={s.txHash}>{s.txHash}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold capitalize" style={{ color: STATUS_COLOR[s.status] }}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{format(new Date(s.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    {s.status === "pending" && (
                      <div className="flex gap-1.5">
                        <button onClick={() => updateSub({ subId: s.id, action: "approve" })} disabled={subPending}
                          className="flex items-center gap-1 rounded-lg bg-[var(--color-profit)]/15 px-2.5 py-1 text-xs font-medium text-[var(--color-profit)] hover:bg-[var(--color-profit)]/25 disabled:opacity-40">
                          <CheckCircle className="h-3 w-3" /> Approve
                        </button>
                        <button onClick={() => updateSub({ subId: s.id, action: "reject" })} disabled={subPending}
                          className="flex items-center gap-1 rounded-lg bg-[var(--color-loss)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-loss)] hover:bg-[var(--color-loss)]/20 disabled:opacity-40">
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
