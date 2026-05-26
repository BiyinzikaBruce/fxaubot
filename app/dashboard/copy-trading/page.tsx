"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Users, Plus, LogOut, UserCheck } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import {
  useMasterGroups, useFollowerMemberships, usePublicGroups,
  useCreateGroup, useJoinGroup, useLeaveGroup,
  type CopyTradeGroup, type CopyMembership,
} from "@/hooks/use-copy-trading"
import { cn } from "@/lib/utils"

const TABS = ["As Master", "As Follower", "Browse"] as const
type Tab = (typeof TABS)[number]

function MasterTab() {
  const masterQuery = useMasterGroups()
  const groups = (masterQuery.data ?? []) as CopyTradeGroup[]
  const isLoading = masterQuery.isLoading
  const { mutate: createGroup, isPending } = useCreateGroup()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [maxFollowers, setMaxFollowers] = useState(10)

  function handleCreate() {
    if (!name) return
    createGroup({ name, isPublic, maxFollowers }, { onSuccess: () => { setShowForm(false); setName("") } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Create Group
        </button>
      </div>

      {showForm && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5 flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name"
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]" />
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <span className="text-[var(--color-text-secondary)]">Public (discoverable)</span>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-[var(--color-text-muted)] text-xs">Max followers:</span>
              <input type="number" value={maxFollowers} onChange={(e) => setMaxFollowers(+e.target.value)} min={1} max={100}
                className="w-16 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1 text-sm text-[var(--color-text-primary)] focus:outline-none" />
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
        <div className="h-40 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
          <Users className="h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">No groups yet. Create one to let others follow your trades.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <div key={g.id} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">{g.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{g._count?.members ?? 0} / {g.maxFollowers} followers · {g.isPublic ? "Public" : "Private"}</p>
                </div>
                <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-[10px] font-bold", g.isPublic ? "bg-[var(--color-profit)]/15 text-[var(--color-profit)]" : "bg-[var(--color-border-subtle)] text-[var(--color-text-muted)]")}>
                  {g.isPublic ? "Public" : "Private"}
                </span>
              </div>
              {g.members && g.members.length > 0 && (
                <div className="mt-3 border-t border-[var(--color-border-subtle)] pt-3">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">Followers</p>
                  <div className="flex flex-wrap gap-2">
                    {g.members.map((m) => (
                      <span key={m.follower.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-subtle)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
                        {m.follower.name} <span className="text-[var(--color-text-muted)]">{m.allocationPct}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FollowerTab() {
  const followerQuery = useFollowerMemberships()
  const memberships = (followerQuery.data ?? []) as CopyMembership[]
  const isLoading = followerQuery.isLoading
  const { mutate: leave } = useLeaveGroup()

  if (isLoading) return <div className="h-40 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />

  if (memberships.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
        <UserCheck className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)]">You are not following anyone. Browse public groups to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {memberships.map((m: CopyMembership) => (
        <div key={m.id} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--color-text-primary)]">{m.group.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Master: {m.group.master?.name} · {m.allocationPct}% allocation · Joined {format(new Date(m.joinedAt), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", m.isActive ? "bg-[var(--color-profit)]" : "bg-[var(--color-border-subtle)]")} />
            <button onClick={() => { if (confirm("Leave this group?")) leave(m.groupId) }}
              className="flex items-center gap-1 rounded-lg border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-loss)] hover:border-[var(--color-loss)] transition-colors">
              <LogOut className="h-3 w-3" /> Leave
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function BrowseTab() {
  const browseQuery = usePublicGroups()
  const groups = (browseQuery.data ?? []) as CopyTradeGroup[]
  const isLoading = browseQuery.isLoading
  const { mutate: join, isPending } = useJoinGroup()
  const [allocations, setAllocations] = useState<Record<string, number>>({})

  if (isLoading) return <div className="h-40 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />

  return (
    <div className="flex flex-col gap-3">
      {groups.length === 0 ? (
        <div className="py-16 text-center text-sm text-[var(--color-text-muted)] rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">No public groups available</div>
      ) : (
        groups.map((g: CopyTradeGroup) => (
          <div key={g.id} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">{g.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">by {g.master?.name} · {g._count?.members ?? 0} / {g.maxFollowers} followers</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="number" min={1} max={100} placeholder="10"
                  value={allocations[g.id] ?? ""}
                  onChange={(e) => setAllocations((a) => ({ ...a, [g.id]: +e.target.value }))}
                  className="w-16 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none"
                />
                <span className="text-xs text-[var(--color-text-muted)]">%</span>
                <button
                  onClick={() => join({ groupId: g.id, allocationPct: allocations[g.id] ?? 10 })}
                  disabled={isPending || (g._count?.members ?? 0) >= g.maxFollowers}
                  className="rounded-lg bg-[var(--color-accent-primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  Follow
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function CopyTradingPage() {
  const [tab, setTab] = useState<Tab>("As Master")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Copy Trading"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Copy Trading" }]}
      />

      <div className="flex gap-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", tab === t ? "bg-[var(--color-accent-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]")}>
            {t}
          </button>
        ))}
      </div>

      {tab === "As Master" && <MasterTab />}
      {tab === "As Follower" && <FollowerTab />}
      {tab === "Browse" && <BrowseTab />}
    </div>
  )
}
