"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type Playbook = {
  id: string
  name: string
  description: string | null
  rules: string[]
  setupCriteria: string | null
  entryConditions: string | null
  exitConditions: string | null
  riskParams: unknown
  isShared: boolean
  createdAt: string
  _count: { trades: number }
}

export function usePlaybooks() {
  return useQuery<Playbook[]>({
    queryKey: ["playbooks"],
    queryFn: async () => {
      const res = await fetch("/api/playbooks")
      if (!res.ok) throw new Error("Failed to fetch playbooks")
      return res.json()
    },
    staleTime: 30_000,
  })
}

export function useCreatePlaybook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Playbook>) => {
      const res = await fetch("/api/playbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create playbook")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playbooks"] }),
  })
}

export function useUpdatePlaybook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ playbookId, data }: { playbookId: string; data: Partial<Playbook> }) => {
      const res = await fetch(`/api/playbooks/${playbookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update playbook")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playbooks"] }),
  })
}

export function useDeletePlaybook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (playbookId: string) => {
      const res = await fetch(`/api/playbooks/${playbookId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete playbook")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playbooks"] }),
  })
}
