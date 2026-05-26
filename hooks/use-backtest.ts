"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { BacktestResults } from "@/lib/backtest"

export type BacktestSession = {
  id: string
  name: string
  exchange: string
  symbol: string
  timeframe: string
  startDate: string
  endDate: string
  strategyConfig: unknown
  results: BacktestResults | null
  createdAt: string
}

export type RunBacktestInput = {
  name?: string
  exchange: string
  symbol: string
  timeframe: string
  startDate: string
  endDate: string
  strategyConfig: unknown
  initialBalance: number
  positionSizePct: number
  stopLossPct: number
  takeProfitPct: number
}

export function useBacktestSessions() {
  return useQuery<BacktestSession[]>({
    queryKey: ["backtest-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/backtest")
      if (!res.ok) throw new Error("Failed to fetch backtest sessions")
      return res.json()
    },
    staleTime: 30_000,
  })
}

export function useRunBacktest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: RunBacktestInput): Promise<BacktestSession> => {
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Backtest failed")
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backtest-sessions"] }),
  })
}

export function useDeleteBacktest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/backtest/${sessionId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backtest-sessions"] }),
  })
}
