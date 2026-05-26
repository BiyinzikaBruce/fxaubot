"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type Subscription = {
  id: string
  plan: string
  billing: string
  amountUSDT: number
  network: string
  txHash: string
  status: "pending" | "active" | "expired" | "rejected"
  verifiedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions")
      if (!res.ok) throw new Error("Failed to fetch subscriptions")
      return res.json()
    },
    staleTime: 60_000,
  })
}

export function useCreateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { plan: string; billing: string; amountUSDT: number; network: string; txHash: string }) => {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to submit subscription")
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  })
}
