"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAccounts, type TradingAccount } from "@/hooks/use-accounts"

export function useOandaAccounts(): { data: TradingAccount[]; isLoading: boolean } {
  const query = useAccounts()
  return {
    isLoading: query.isLoading,
    data: (query.data ?? []).filter((a: TradingAccount) => a.exchange === "oanda"),
  }
}

export type ConnectOandaInput = {
  name: string
  oandaAccountId: string
  accessToken: string
  environment: "practice" | "live"
}

export function useConnectOandaAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ConnectOandaInput) => {
      const res = await fetch("/api/accounts/oanda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to connect OANDA account")
      return json as TradingAccount
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  })
}

export function useSyncOandaAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (accountId: string) => {
      const res = await fetch(`/api/accounts/oanda/${accountId}/sync`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to sync OANDA account")
      const updated = json as TradingAccount
      qc.setQueryData<TradingAccount[]>(["accounts"], (prev: TradingAccount[] | undefined) =>
        prev?.map((a: TradingAccount) => (a.id === updated.id ? updated : a)),
      )
      return updated
    },
  })
}
