"use client"

import { useState } from "react"
import { X, ExternalLink, Eye, EyeOff } from "lucide-react"
import { useConnectOandaAccount, type ConnectOandaInput } from "@/hooks/use-oanda-accounts"

interface Props {
  onClose: () => void
}

const inputCls =
  "w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors"

export function ConnectOandaModal({ onClose }: Props) {
  const { mutate: connect, isPending, error } = useConnectOandaAccount()
  const [showToken, setShowToken] = useState(false)

  const [form, setForm] = useState<ConnectOandaInput>({
    name: "",
    oandaAccountId: "",
    accessToken: "",
    environment: "practice",
  })

  function set(key: keyof ConnectOandaInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    connect(form, { onSuccess: onClose })
  }

  const canSubmit = form.name && form.oandaAccountId && form.accessToken && !isPending

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)" }}>
              O
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text-primary)]">Connect OANDA Account</p>
              <p className="text-xs text-[var(--color-text-muted)]">Practice or live forex account</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">

          {/* Account label */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Account label</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="My OANDA Practice"
              className={inputCls}
              required
            />
          </div>

          {/* Environment toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Environment</label>
            <div className="grid grid-cols-2 gap-2">
              {(["practice", "live"] as const).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => set("environment", env)}
                  className="flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold capitalize transition-all"
                  style={{
                    borderColor: form.environment === env ? "var(--color-accent-primary)" : "var(--color-border-subtle)",
                    background: form.environment === env ? "rgba(79,142,247,0.1)" : "var(--color-bg-elevated)",
                    color: form.environment === env ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
                  }}
                >
                  <span className={`h-2 w-2 rounded-full ${env === "live" ? "bg-green-400" : "bg-yellow-400"}`} />
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* OANDA Account ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">OANDA Account ID</label>
            <input
              value={form.oandaAccountId}
              onChange={(e) => set("oandaAccountId", e.target.value)}
              placeholder="001-001-1234567-001"
              className={inputCls}
              required
            />
            <p className="text-xs text-[var(--color-text-muted)]">Found in My Account → Manage API Access on OANDA</p>
          </div>

          {/* API Access Token */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">API Access Token</label>
            <div className="relative">
              <input
                value={form.accessToken}
                onChange={(e) => set("accessToken", e.target.value)}
                type={showToken ? "text" : "password"}
                placeholder="Your OANDA API token"
                className={`${inputCls} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* How to get API token hint */}
          <a
            href="https://www.oanda.com/demo-account/user/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[var(--color-accent-primary)] hover:underline w-fit"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Generate your OANDA API token →
          </a>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {(error as Error).message}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--color-border-subtle)] py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit}
              className="flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
              style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)" }}>
              {isPending ? "Connecting…" : "Connect Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
