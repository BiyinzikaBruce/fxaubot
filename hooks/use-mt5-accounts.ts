"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAccounts, type TradingAccount } from "@/hooks/use-accounts"

export function useMt5Accounts(): { data: TradingAccount[]; isLoading: boolean } {
  const query = useAccounts()
  const accounts: TradingAccount[] = query.data ?? []
  const mt5Accounts = accounts.filter((a) => a.exchange === "mt5")
  return { isLoading: query.isLoading, data: mt5Accounts }
}

export type ConnectMt5Input = {
  name: string
  broker: string
  login: string
  password: string
  server: string
  platform: "mt4" | "mt5"
  accountType: "demo" | "live"
}

export function useConnectMt5Account() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ConnectMt5Input) => {
      const res = await fetch("/api/accounts/mt5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to connect MT5 account")
      return res.json() as Promise<TradingAccount>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  })
}

export function useSyncMt5Account(
  accountId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ["mt5-sync", accountId],
    queryFn: async () => {
      const res = await fetch(`/api/accounts/mt5/${accountId}/sync`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to sync MT5 account")
      const updated = (await res.json()) as TradingAccount
      qc.setQueryData<TradingAccount[]>(["accounts"], (prev: TradingAccount[] | undefined) =>
        prev?.map((a) => (a.id === updated.id ? updated : a)),
      )
      return updated
    },
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  })
}
