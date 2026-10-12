"use client"

import { useState } from "react"
import { Check, Copy, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreateMt5Bridge } from "@/hooks/use-mt5-accounts"

const BROKERS = ["Exness", "IC Markets", "XM", "FBS", "Pepperstone", "Deriv", "Other"]

const inputCls =
  "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] w-full"
const labelCls = "flex flex-col gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className={labelCls}>
      {label}
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 font-mono text-xs text-[var(--color-text-primary)]">
          {value}
        </code>
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="rounded-lg border border-[var(--color-border-subtle)] p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors"
          title="Copy"
        >
          {copied ? <Check className="h-4 w-4 text-[var(--color-profit)]" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

/** Free MT5 connection: the user's own MT5 terminal runs the FXAU EA, which polls FXAU for orders. */
export function ConnectMt5EaPanel({ onDone }: { onDone: () => void }) {
  const { mutate: create, isPending, error, data } = useCreateMt5Bridge()
  const [name, setName] = useState("")
  const [broker, setBroker] = useState(BROKERS[0])
  const [accountType, setAccountType] = useState<"demo" | "live">("demo")
  const origin = typeof window !== "undefined" ? window.location.origin : ""

  if (data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-lg border border-[var(--color-profit)]/30 bg-[var(--color-profit)]/10 px-3 py-2 text-xs text-[var(--color-profit)]">
          Connection created. Copy the key now — it is shown only once.
        </p>
        <CopyField label="Connection key" value={data.key} />
        <CopyField label="FXAU URL" value={origin} />
        <ol className="flex list-decimal flex-col gap-1.5 pl-4 text-xs text-[var(--color-text-secondary)]">
          <li>
            <a href="/downloads/FXAU-Bridge.mq5" download className="inline-flex items-center gap-1 font-medium text-[var(--color-accent-primary)] hover:underline">
              <Download className="h-3 w-3" /> Download FXAU-Bridge.mq5
            </a>
            . In MT5: <b>File → Open Data Folder → MQL5 → Experts</b>, paste it there, then right-click <b>Expert Advisors → Refresh</b> in the Navigator.
          </li>
          <li>
            <b>Tools → Options → Expert Advisors</b>: tick <b>Allow WebRequest for listed URL</b> and add the FXAU URL above.
          </li>
          <li>Turn on the <b>Algo Trading</b> button in the MT5 toolbar.</li>
          <li>Drag <b>FXAU-Bridge</b> onto any chart, paste the connection key in <b>Inputs</b>, check the FXAU URL, click OK.</li>
          <li>The chart shows <b>FXAU Bridge | CONNECTED</b> and this account turns green here.</li>
        </ol>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Keep MT5 open — bots can only trade while the EA is running.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg bg-[var(--color-accent-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (name.trim()) create({ name: name.trim(), broker, accountType }) }}
      className="flex flex-col gap-4"
    >
      <p className="text-xs text-[var(--color-text-muted)]">
        Free. Your MT5 app on your computer runs the FXAU EA and places the trades. Your broker password never leaves your computer.
      </p>
      <div className="flex rounded-lg border border-[var(--color-border-subtle)] p-1 bg-[var(--color-bg-elevated)]">
        {(["demo", "live"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setAccountType(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-semibold capitalize transition-colors",
              accountType === t ? "bg-[var(--color-accent-primary)] text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <label className={labelCls}>
        Account nickname
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Exness Demo" className={inputCls} />
      </label>
      <label className={labelCls}>
        Broker
        <select value={broker} onChange={(e) => setBroker(e.target.value)} className={inputCls}>
          {BROKERS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>
      {error && (
        <p className="text-xs text-[var(--color-loss)] rounded-lg bg-[var(--color-loss-bg)] border border-[var(--color-loss-border)] px-3 py-2">
          {error.message}
        </p>
      )}
      <button
        type="submit"
        disabled={!name.trim() || isPending}
        className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Creating…" : "Create connection key"}
      </button>
    </form>
  )
}
