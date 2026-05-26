"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type TradingAccount = {
  id: string
  name: string
  exchange: string
  balance: number
  currency: string
  isDefault: boolean
  createdAt: string
}

export function useAccounts() {
  return useQuery<TradingAccount[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await fetch("/api/accounts")
      if (!res.ok) throw new Error("Failed to fetch accounts")
      return res.json()
    },
    staleTime: 300_000,
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create account")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (accountId: string) => {
      const res = await fetch(`/api/accounts/${accountId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete account")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  })
}
