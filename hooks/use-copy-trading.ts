"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type CopyTradeGroup = {
  id: string
  name: string
  isPublic: boolean
  maxFollowers: number
  createdAt: string
  master?: { id: string; name: string; avatarUrl: string | null }
  members?: { follower: { id: string; name: string; avatarUrl: string | null }; allocationPct: number; isActive: boolean }[]
  _count?: { members: number }
}

export type CopyMembership = {
  id: string
  groupId: string
  allocationPct: number
  isActive: boolean
  joinedAt: string
  group: CopyTradeGroup
}

export function useMasterGroups() {
  return useQuery<CopyTradeGroup[]>({
    queryKey: ["copy-groups", "master"],
    queryFn: async () => {
      const res = await fetch("/api/copy-trading/groups?mode=master")
      if (!res.ok) throw new Error("Failed to fetch groups")
      return res.json()
    },
    staleTime: 30_000,
  })
}

export function useFollowerMemberships() {
  return useQuery<CopyMembership[]>({
    queryKey: ["copy-groups", "follower"],
    queryFn: async () => {
      const res = await fetch("/api/copy-trading/groups?mode=follower")
      if (!res.ok) throw new Error("Failed to fetch memberships")
      return res.json()
    },
    staleTime: 30_000,
  })
}

export function usePublicGroups() {
  return useQuery<CopyTradeGroup[]>({
    queryKey: ["copy-groups", "public"],
    queryFn: async () => {
      const res = await fetch("/api/copy-trading/groups?mode=public")
      if (!res.ok) throw new Error("Failed to fetch public groups")
      return res.json()
    },
    staleTime: 60_000,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; isPublic?: boolean; maxFollowers?: number }) => {
      const res = await fetch("/api/copy-trading/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create group")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["copy-groups"] }),
  })
}

export function useJoinGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ groupId, allocationPct }: { groupId: string; allocationPct?: number }) => {
      const res = await fetch(`/api/copy-trading/groups/${groupId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocationPct }),
      })
      if (!res.ok) throw new Error("Failed to join group")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["copy-groups"] }),
  })
}

export function useLeaveGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (groupId: string) => {
      const res = await fetch(`/api/copy-trading/groups/${groupId}/leave`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to leave group")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["copy-groups"] }),
  })
}
