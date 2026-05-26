"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { StrategyConfig } from "@/lib/indicators/index"

export type BotConfig = {
  id: string
  name: string
  exchange: string
  symbol: string
  timeframe: string
  strategy: StrategyConfig
  positionSizePct: number
  stopLossPct: number
  takeProfitPct: number
  isActive: boolean
  createdAt: string
  account: { name: string; exchange: string }
  _count: { signals: number }
}

export type BotSignalEntry = {
  id: string
  signalType: string
  indicatorValues: Record<string, number>
  triggeredAt: string
  acted: boolean
}

export type BotDetail = {
  id: string
  name: string
  exchange: string
  symbol: string
  timeframe: string
  strategy: StrategyConfig
  positionSizePct: number
  stopLossPct: number
  takeProfitPct: number
  isActive: boolean
  createdAt: string
  account: { name: string; exchange: string; balance: number }
  _count: { signals: number }
  signals: BotSignalEntry[]
}

export function useBots() {
  return useQuery<BotConfig[]>({
    queryKey: ["bots"],
    queryFn: async () => {
      const res = await fetch("/api/bots")
      if (!res.ok) throw new Error("Failed to fetch bots")
      return res.json()
    },
    staleTime: 30_000,
  })
}

export function useBot(botId: string) {
  return useQuery<BotDetail>({
    queryKey: ["bot", botId],
    queryFn: async (): Promise<BotDetail> => {
      const res = await fetch(`/api/bots/${botId}`)
      if (!res.ok) throw new Error("Failed to fetch bot")
      return res.json() as Promise<BotDetail>
    },
    staleTime: 15_000,
  })
}

export function useCreateBot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<BotConfig>) => {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create bot")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] }),
  })
}

export function useUpdateBot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ botId, data }: { botId: string; data: Partial<BotConfig> }) => {
      const res = await fetch(`/api/bots/${botId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update bot")
      return res.json()
    },
    onSuccess: (_: unknown, { botId }: { botId: string; data: Partial<BotConfig> }) => {
      qc.invalidateQueries({ queryKey: ["bots"] })
      qc.invalidateQueries({ queryKey: ["bot", botId] })
    },
  })
}

export function useDeleteBot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (botId: string) => {
      const res = await fetch(`/api/bots/${botId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete bot")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] }),
  })
}

export function useStartBot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (botId: string) => {
      const res = await fetch(`/api/bots/${botId}/start`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to start bot")
      return res.json()
    },
    onSuccess: (_: unknown, botId: string) => {
      qc.invalidateQueries({ queryKey: ["bots"] })
      qc.invalidateQueries({ queryKey: ["bot", botId] })
    },
  })
}

export function useStopBot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (botId: string) => {
      const res = await fetch(`/api/bots/${botId}/stop`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to stop bot")
      return res.json()
    },
    onSuccess: (_: unknown, botId: string) => {
      qc.invalidateQueries({ queryKey: ["bots"] })
      qc.invalidateQueries({ queryKey: ["bot", botId] })
    },
  })
}
