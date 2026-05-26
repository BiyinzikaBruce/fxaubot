"use client"

import { useQuery } from "@tanstack/react-query"

export type BotSignal = {
  id: string
  botConfigId: string
  symbol: string
  timeframe: string
  signalType: "buy" | "sell" | "neutral"
  indicatorValues: Record<string, number>
  triggeredAt: string
  acted: boolean
  botConfig: { name: string; symbol: string }
}

export function useSignals(filters?: { botId?: string; signal?: string; limit?: number }) {
  const params = new URLSearchParams()
  if (filters?.botId) params.set("botId", filters.botId)
  if (filters?.signal) params.set("signal", filters.signal)
  if (filters?.limit) params.set("limit", String(filters.limit))

  return useQuery<BotSignal[]>({
    queryKey: ["signals", filters],
    queryFn: async () => {
      const res = await fetch(`/api/signals?${params}`)
      if (!res.ok) throw new Error("Failed to fetch signals")
      return res.json()
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
