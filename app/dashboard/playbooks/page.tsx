"use client"

import { useState } from "react"
import { FileText, Plus, Trash2, Edit2, X, Check } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { usePlaybooks, useCreatePlaybook, useUpdatePlaybook, useDeletePlaybook, type Playbook } from "@/hooks/use-playbooks"
import { cn } from "@/lib/utils"

const inputCls = "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] w-full"
const textareaCls = inputCls + " resize-none min-h-[80px]"

type FormData = { name: string; description: string; setupCriteria: string; entryConditions: string; exitConditions: string; rules: string }

const EMPTY: FormData = { name: "", description: "", setupCriteria: "", entryConditions: "", exitConditions: "", rules: "" }

function PlaybookForm({ initial, onSave, onCancel, isPending }: {
  initial?: FormData
  onSave: (data: FormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [form, setForm] = useState<FormData>(initial ?? EMPTY)
  function upd(key: keyof FormData, val: string) { setForm((f) => ({ ...f, [key]: val })) }

  return (
    <div className="rounded-[14px] border border-[var(--color-accent-primary)]/40 bg-[var(--color-bg-card)] p-5 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Name *
          <input value={form.name} onChange={(e) => upd("name", e.target.value)} placeholder="Breakout strategy" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Description
          <input value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="Short description" className={inputCls} />
        </label>
      </div>
      {(["setupCriteria", "entryConditions", "exitConditions"] as const).map((key) => (
        <label key={key} className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {key === "setupCriteria" ? "Setup Criteria" : key === "entryConditions" ? "Entry Conditions" : "Exit Conditions"}
          <textarea value={form[key]} onChange={(e) => upd(key, e.target.value)} placeholder={`Describe ${key}…`} className={textareaCls} rows={2} />
        </label>
      ))}
      <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
        Rules (one per line)
        <textarea value={form.rules} onChange={(e) => upd("rules", e.target.value)} placeholder={"Never risk more than 2%\nAlways use stop loss"} className={textareaCls} rows={3} />
      </label>
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} disabled={isPending || !form.name}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-40">
          <Check className="h-4 w-4" /> {isPending ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-subtle)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function PlaybooksPage() {
  const { data = [], isLoading } = usePlaybooks()
  const playbooks = data as Playbook[]
  const { mutate: create, isPending: creating } = useCreatePlaybook()
  const { mutate: update, isPending: updating } = useUpdatePlaybook()
  const { mutate: del } = useDeletePlaybook()

  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  function handleCreate(form: FormData) {
    create({ ...form, rules: form.rules.split("\n").filter(Boolean) }, {
      onSuccess: () => setShowCreate(false),
    })
  }

  function handleUpdate(playbookId: string, form: FormData) {
    update({ playbookId, data: { ...form, rules: form.rules.split("\n").filter(Boolean) } }, {
      onSuccess: () => setEditId(null),
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Playbooks"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Playbooks" }]}
        actions={
          <button onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> New Playbook
          </button>
        }
      />

      {showCreate && (
        <PlaybookForm onSave={handleCreate} onCancel={() => setShowCreate(false)} isPending={creating} />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />)}
        </div>
      ) : playbooks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
          <FileText className="h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">No playbooks yet. Create one to document your strategy.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {playbooks.map((pb: Playbook) => {
            if (editId === pb.id) {
              const initial: FormData = {
                name: pb.name,
                description: pb.description ?? "",
                setupCriteria: pb.setupCriteria ?? "",
                entryConditions: pb.entryConditions ?? "",
                exitConditions: pb.exitConditions ?? "",
                rules: pb.rules.join("\n"),
              }
              return (
                <PlaybookForm key={pb.id} initial={initial}
                  onSave={(form) => handleUpdate(pb.id, form)}
                  onCancel={() => setEditId(null)}
                  isPending={updating}
                />
              )
            }

            return (
              <div key={pb.id} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)]">{pb.name}</p>
                    {pb.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{pb.description}</p>}
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{pb._count.trades} trade{pb._count.trades !== 1 ? "s" : ""} using this playbook</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditId(pb.id)}
                      className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-glow)] transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => { if (confirm(`Delete "${pb.name}"?`)) del(pb.id) }}
                      className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-loss)] hover:bg-[var(--color-loss)]/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {pb.rules.length > 0 && (
                  <div className="flex flex-col gap-1 border-t border-[var(--color-border-subtle)] pt-3">
                    <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Rules</p>
                    {pb.rules.map((rule, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                        <span className="text-[var(--color-accent-primary)] shrink-0">{i + 1}.</span> {rule}
                      </div>
                    ))}
                  </div>
                )}

                <div className={cn("grid gap-3 mt-3", [pb.setupCriteria, pb.entryConditions, pb.exitConditions].filter(Boolean).length > 1 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1")}>
                  {pb.setupCriteria && (
                    <div className="rounded-lg bg-[var(--color-bg-elevated)] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Setup</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{pb.setupCriteria}</p>
                    </div>
                  )}
                  {pb.entryConditions && (
                    <div className="rounded-lg bg-[var(--color-bg-elevated)] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Entry</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{pb.entryConditions}</p>
                    </div>
                  )}
                  {pb.exitConditions && (
                    <div className="rounded-lg bg-[var(--color-bg-elevated)] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Exit</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{pb.exitConditions}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
