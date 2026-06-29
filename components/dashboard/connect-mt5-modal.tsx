"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useConnectMt5Account } from "@/hooks/use-mt5-accounts"

const BROKERS = ["Exness", "IC Markets", "XM", "FBS", "Pepperstone", "Other"]

const inputCls =
  "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] w-full"
const labelCls = "flex flex-col gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"

type Props = {
  open: boolean
  onClose: () => void
}

export function ConnectMt5Modal({ open, onClose }: Props) {
  const { mutate: connect, isPending, error, reset } = useConnectMt5Account()

  const [broker, setBroker] = useState(BROKERS[0])
  const [accountType, setAccountType] = useState<"demo" | "live">("demo")
  const [name, setName] = useState("")
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [server, setServer] = useState("")

  if (!open) return null

  const valid = name.trim() && /^\d+$/.test(login) && password.trim() && server.trim()

  function handleClose() {
    reset()
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    connect(
      { name, broker, login, password, server, platform: "mt5", accountType },
      { onSuccess: handleClose },
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] font-[var(--font-display)]">
            Connect MT5 Account
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Demo / Live toggle */}
          <div className="flex rounded-lg border border-[var(--color-border-subtle)] p-1 bg-[var(--color-bg-elevated)]">
            {(["demo", "live"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAccountType(t)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-sm font-semibold capitalize transition-colors",
                  accountType === t
                    ? "bg-[var(--color-accent-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <label className={labelCls}>
            Account nickname
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Exness Live"
              className={inputCls}
            />
          </label>

          <label className={labelCls}>
            Broker
            <select value={broker} onChange={(e) => setBroker(e.target.value)} className={inputCls}>
              {BROKERS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>
              MT5 login
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value.replace(/\D/g, ""))}
                placeholder="12345678"
                inputMode="numeric"
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Investor or master"
                className={inputCls}
              />
            </label>
          </div>

          <label className={labelCls}>
            Server
            <input
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder={`e.g. ${broker}-MT5${accountType === "live" ? "Real8" : "Trial7"}`}
              className={inputCls}
            />
          </label>

          {error && (
            <p className="text-xs text-[var(--color-loss)] rounded-lg bg-[var(--color-loss-bg)] border border-[var(--color-loss-border)] px-3 py-2">
              {error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={!valid || isPending}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Connecting…" : "Connect Account"}
          </button>
          <p className="text-[11px] text-center text-[var(--color-text-muted)]">
            Your password is encrypted at rest and never shown again.
          </p>
        </form>
      </div>
    </div>
  )
}
