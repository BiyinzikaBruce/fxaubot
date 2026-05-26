"use client"

import { useState } from "react"
import { format } from "date-fns"
import { UserCheck, Send, Check, X } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useMentorInvites, useSendInvite, useUpdateInvite, type MentorInvite } from "@/hooks/use-mentor"
import { cn } from "@/lib/utils"

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--color-text-muted)",
  active: "var(--color-profit)",
  revoked: "var(--color-loss)",
}

export default function MentorPage() {
  const { data, isLoading } = useMentorInvites()
  const sent = (data?.sent ?? []) as MentorInvite[]
  const received = (data?.received ?? []) as MentorInvite[]
  const { mutateAsync: sendInvite, isPending: sending } = useSendInvite()
  const { mutate: updateInvite } = useUpdateInvite()

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSend() {
    setError("")
    setSuccess("")
    try {
      await sendInvite(email)
      setEmail("")
      setSuccess("Invite sent successfully.")
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const activeMentor = sent.find((i) => i.status === "active")
  const pendingReceived = received.filter((i) => i.status === "pending")
  const activeMentees = received.filter((i) => i.status === "active")

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        title="Mentor"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mentor" }]}
      />

      {/* Active mentor */}
      {activeMentor?.mentor && (
        <div className="rounded-[14px] border border-[var(--color-profit)]/30 bg-[var(--color-profit)]/5 p-5">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Your Mentor</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--color-text-primary)]">{activeMentor.mentor.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{activeMentor.mentor.email}</p>
            </div>
            <button onClick={() => updateInvite({ inviteId: activeMentor.id, action: "revoke" })}
              className="text-xs text-[var(--color-loss)] hover:underline">
              Remove mentor
            </button>
          </div>
        </div>
      )}

      {/* Pending received invites */}
      {pendingReceived.length > 0 && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Mentorship Requests</p>
          <div className="flex flex-col gap-3">
            {pendingReceived.map((invite: MentorInvite) => (
              <div key={invite.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg-elevated)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{invite.trader?.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{invite.trader?.email} · {format(new Date(invite.createdAt), "MMM d, yyyy")}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateInvite({ inviteId: invite.id, action: "accept" })}
                    className="flex items-center gap-1 rounded-lg bg-[var(--color-profit)]/15 px-3 py-1.5 text-xs font-medium text-[var(--color-profit)] hover:bg-[var(--color-profit)]/25">
                    <Check className="h-3 w-3" /> Accept
                  </button>
                  <button onClick={() => updateInvite({ inviteId: invite.id, action: "revoke" })}
                    className="flex items-center gap-1 rounded-lg border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-loss)]">
                    <X className="h-3 w-3" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active mentees */}
      {activeMentees.length > 0 && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Your Mentees</p>
          <div className="flex flex-col gap-2">
            {activeMentees.map((invite: MentorInvite) => (
              <div key={invite.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg-elevated)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{invite.trader?.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{invite.trader?.email}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`/mentor/${invite.traderId}`}
                    className="rounded-lg border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]">
                    View Journal
                  </a>
                  <button onClick={() => updateInvite({ inviteId: invite.id, action: "revoke" })}
                    className="rounded-lg border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-loss)]">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send invite */}
      {!activeMentor && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Request a Mentor</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Enter the email address of someone who is already a mentor on the platform.</p>
          </div>
          <div className="flex gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mentor@example.com"
              className="flex-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]" />
            <button onClick={handleSend} disabled={sending || !email.trim()}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40">
              <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send"}
            </button>
          </div>
          {error && <p className="text-xs text-[var(--color-loss)]">{error}</p>}
          {success && <p className="text-xs text-[var(--color-profit)]">{success}</p>}
        </div>
      )}

      {/* Sent invites history */}
      {sent.length > 0 && (
        <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Sent Invites</p>
          <div className="flex flex-col gap-2">
            {sent.map((invite: MentorInvite) => (
              <div key={invite.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg-elevated)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{invite.mentor?.name ?? invite.mentor?.email}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{format(new Date(invite.createdAt), "MMM d, yyyy")}</p>
                </div>
                <span className="text-xs font-semibold capitalize" style={{ color: STATUS_COLOR[invite.status] }}>
                  {invite.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sent.length === 0 && received.length === 0 && !activeMentor && (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
          <UserCheck className="h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">No mentor connections yet.</p>
        </div>
      )}
    </div>
  )
}
