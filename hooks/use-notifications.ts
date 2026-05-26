"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type AppNotification = {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications")
      if (!res.ok) throw new Error("Failed to fetch notifications")
      return res.json()
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids ?? [] }),
      })
      if (!res.ok) throw new Error("Failed to mark read")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}
