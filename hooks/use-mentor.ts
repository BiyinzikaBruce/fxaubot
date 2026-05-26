"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type MentorUser = { id: string; name: string; email: string; avatarUrl: string | null }

export type MentorInvite = {
  id: string
  traderId: string
  mentorId: string
  status: "pending" | "active" | "revoked"
  createdAt: string
  mentor?: MentorUser
  trader?: MentorUser
}

export function useMentorInvites() {
  return useQuery<{ sent: MentorInvite[]; received: MentorInvite[] }>({
    queryKey: ["mentor-invites"],
    queryFn: async () => {
      const res = await fetch("/api/mentor/invites")
      if (!res.ok) throw new Error("Failed to fetch invites")
      return res.json()
    },
    staleTime: 30_000,
  })
}

export function useSendInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (mentorEmail: string) => {
      const res = await fetch("/api/mentor/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorEmail }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to send invite")
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mentor-invites"] }),
  })
}

export function useUpdateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ inviteId, action }: { inviteId: string; action: "accept" | "revoke" }) => {
      const res = await fetch(`/api/mentor/invites/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error("Failed to update invite")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mentor-invites"] }),
  })
}
