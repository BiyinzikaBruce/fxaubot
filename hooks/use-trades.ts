"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type Trade = {
  id: string
  accountId: string
  userId: string
  symbol: string
  side: "long" | "short"
  entryPrice: number
  exitPrice: number | null
  quantity: number
  grossPnl: number | null
  netPnl: number | null
  fees: number
  mae: number | null
  mfe: number | null
  entryAt: string
  exitAt: string | null
  duration: number | null
  tags: string[]
  playbookId: string | null
  playbook: { id: string; name: string } | null
  notes: string | null
  rating: number | null
  isBotTrade: boolean
  isReplay: boolean
}

export type TradeFilters = {
  accountId?: string
  symbol?: string
  side?: string
  from?: string
  to?: string
  playbookId?: string
  tags?: string
  page?: number
  limit?: number
}

export type TradesResponse = {
  trades: Trade[]
  total: number
  page: number
  limit: number
  pages: number
}

function buildQuery(filters: TradeFilters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) params.set(k, String(v))
  })
  return params.toString()
}

export function useTrades(filters: TradeFilters = {}) {
  return useQuery<TradesResponse>({
    queryKey: ["trades", filters],
    queryFn: async () => {
      const res = await fetch(`/api/trades?${buildQuery(filters)}`)
      if (!res.ok) throw new Error("Failed to fetch trades")
      return res.json()
    },
  })
}

export function useTrade(tradeId: string | null) {
  return useQuery<Trade>({
    queryKey: ["trade", tradeId],
    queryFn: async () => {
      const res = await fetch(`/api/trades/${tradeId}`)
      if (!res.ok) throw new Error("Failed to fetch trade")
      return res.json()
    },
    enabled: !!tradeId,
  })
}

export function useCreateTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create trade")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"] })
      qc.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useUpdateTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ tradeId, data }: { tradeId: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/trades/${tradeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update trade")
      return res.json()
    },
    onSuccess: (_data: unknown, { tradeId }: { tradeId: string; data: Record<string, unknown> }) => {
      qc.invalidateQueries({ queryKey: ["trades"] })
      qc.invalidateQueries({ queryKey: ["trade", tradeId] })
      qc.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useDeleteTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tradeId: string) => {
      const res = await fetch(`/api/trades/${tradeId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete trade")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"] })
      qc.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}
