"use client"

import { useQuery } from "@tanstack/react-query"

export type AnalyticsSummary = {
  totalTrades: number
  winCount: number
  lossCount: number
  winRate: number
  totalNetPnl: number
  grossProfit: number
  grossLoss: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  bestTrade: { netPnl: number; symbol: string } | null
  worstTrade: { netPnl: number; symbol: string } | null
  streak: number
  streakType: "win" | "loss"
  equityCurve: { date: string; pnl: number; cumulative: number }[]
}

export function useAnalyticsSummary(accountId?: string) {
  const params = accountId ? `?accountId=${accountId}` : ""
  return useQuery<AnalyticsSummary>({
    queryKey: ["analytics", "summary", accountId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/summary${params}`)
      if (!res.ok) throw new Error("Failed to fetch analytics")
      return res.json()
    },
    staleTime: 60_000,
  })
}

export function useReport(reportType: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString()
  return useQuery({
    queryKey: ["analytics", "report", reportType, params],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/reports/${reportType}${qs ? `?${qs}` : ""}`)
      if (!res.ok) throw new Error("Failed to fetch report")
      return res.json()
    },
    staleTime: 60_000,
  })
}
