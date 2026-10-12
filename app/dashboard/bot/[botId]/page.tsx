"use client"

import { use, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { AlertTriangle, ArrowDownRight, ArrowLeft, ArrowUpRight, Play, RefreshCw, Square } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useBot, useRunBot, useStartBot, useStopBot, type BotRunResult, type BotSignalEntry } from "@/hooks/use-bots"
import { cn } from "@/lib/utils"
import { fmtPrice, marketName, signalPlan } from "@/lib/signal-text"

type Props = { params: Promise<{ botId: string }> }

const SIGNAL_BG: Record<string, string> = {
  buy: "var(--color-profit)",
  sell: "var(--color-loss)",
}

export default function BotDetailPage({ params }: Props) {
  const { botId } = use(params)
  const { data: bot, isLoading } = useBot(botId)
  const { mutate: start, isPending: starting } = useStartBot()
  const { mutate: stop, isPending: stopping } = useStopBot()
  const { mutate: run, isPending: running, variables: runVars } = useRunBot()
  const [lastResult, setLastResult] = useState<BotRunResult | null>(null)

  function runBot(side?: "buy" | "sell") {
    if (side && !confirm(`Place a real ${side.toUpperCase()} order on ${bot?.symbol} now, using this bot's risk %, stop loss and take profit?`)) return
    setLastResult(null)
    run({ botId, side }, {
      onSuccess: setLastResult,
      onError: (err: Error) => setLastResult({ status: "error", signal: side ?? "neutral", message: err.message }),
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-[var(--color-bg-card)]" />
        <div className="h-48 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-[var(--color-text-secondary)]">Bot not found</p>
        <Link href="/dashboard/bot" className="text-sm text-[var(--color-accent-primary)] hover:underline">Back to Bots</Link>
      </div>
    )
  }

  const botSignals: BotSignalEntry[] = bot.signals as BotSignalEntry[]
  const buySignals = botSignals.filter((s) => s.signalType === "buy").length
  const sellSignals = botSignals.filter((s) => s.signalType === "sell").length
  const actedSignals = botSignals.filter((s) => s.acted).length
  const latest = botSignals[0]
  const latestPlan = latest ? signalPlan(latest) : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={bot.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bot", href: "/dashboard/bot" },
          { label: bot.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/bot"
              className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <button
              onClick={() => bot.isActive ? stop(botId) : start(botId)}
              disabled={starting || stopping}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                bot.isActive
                  ? "bg-[var(--color-loss)]/10 text-[var(--color-loss)] hover:bg-[var(--color-loss)]/20"
                  : "bg-[var(--color-profit)]/10 text-[var(--color-profit)] hover:bg-[var(--color-profit)]/20"
              )}
            >
              {bot.isActive ? <><Square className="h-4 w-4" /> Stop</> : <><Play className="h-4 w-4" /> Start</>}
            </button>
          </div>
        }
      />

      {/* Status + config */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        {[
          ["Status", bot.isActive ? "Active" : "Stopped"],
          ["Symbol", bot.symbol],
          ["Timeframe", bot.timeframe],
          ["Exchange", bot.account.exchange],
          [["mt5", "oanda"].includes(bot.account.exchange) ? "Risk / Trade" : "Position Size", `${bot.positionSizePct}%`],
          ["Stop Loss", `${bot.stopLossPct}%`],
          ["Take Profit", `${bot.takeProfitPct}%`],
          ["Total Signals", bot.signals.length],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
            <span className={cn("text-base font-semibold", label === "Status" && (bot.isActive ? "text-[var(--color-profit)]" : "text-[var(--color-text-muted)]"))}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Latest signal: the one thing a trader needs to see */}
      {latest && latestPlan ? (
        <div
          className="flex flex-col gap-3 rounded-[14px] border p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: SIGNAL_BG[latest.signalType], background: `color-mix(in srgb, ${SIGNAL_BG[latest.signalType]} 8%, transparent)` }}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white" style={{ background: SIGNAL_BG[latest.signalType] }}>
              {latestPlan.action === "BUY" ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Latest signal · {format(new Date(latest.triggeredAt), "MMM d, HH:mm")}</p>
              <p className="text-2xl font-bold" style={{ color: SIGNAL_BG[latest.signalType] }}>
                {latestPlan.action} {marketName(bot.symbol)}{" "}
                {latestPlan.price !== undefined && <span className="text-[var(--color-text-primary)]">at {fmtPrice(latestPlan.price)}</span>}
              </p>
              {latestPlan.stopLoss !== undefined && (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Stop loss <b>{fmtPrice(latestPlan.stopLoss)}</b> · Take profit <b>{fmtPrice(latestPlan.takeProfit)}</b>
                </p>
              )}
            </div>
          </div>
          <span className={cn("self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-center",
            latest.acted ? "bg-[var(--color-profit)]/15 text-[var(--color-profit)]" : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]")}>
            {latest.acted ? "Trade placed" : bot.autoTrade ? "Not traded" : "Signal only"}
          </span>
        </div>
      ) : (
        <div className="rounded-[14px] border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
          <p className="text-base font-semibold text-[var(--color-text-primary)]">Waiting for the next BUY or SELL signal</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            The bot checks {marketName(bot.symbol)} at the close of every {bot.timeframe} candle{bot.isActive ? "" : " once you press Start"}.
            {bot.lastRunAt && ` Last checked ${format(new Date(bot.lastRunAt), "HH:mm")}.`}
          </p>
        </div>
      )}

      {/* Execution */}
      <div className="flex flex-col gap-4 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Execution</h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {bot.autoTrade ? "Auto-trade: places orders on signals" : "Signal-only: never places orders"}
              {" · "}Last run {bot.lastRunAt ? format(new Date(bot.lastRunAt), "MMM d HH:mm:ss") : "never"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => runBot()} disabled={running}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-subtle)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-50 transition-colors">
              <RefreshCw className={cn("h-3.5 w-3.5", running && !runVars?.side && "animate-spin")} /> Run strategy now
            </button>
            <button onClick={() => runBot("buy")} disabled={running}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-profit)]/10 px-3 py-2 text-xs font-medium text-[var(--color-profit)] hover:bg-[var(--color-profit)]/20 disabled:opacity-50 transition-colors">
              <ArrowUpRight className="h-3.5 w-3.5" /> {running && runVars?.side === "buy" ? "Placing…" : "Test BUY"}
            </button>
            <button onClick={() => runBot("sell")} disabled={running}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-loss)]/10 px-3 py-2 text-xs font-medium text-[var(--color-loss)] hover:bg-[var(--color-loss)]/20 disabled:opacity-50 transition-colors">
              <ArrowDownRight className="h-3.5 w-3.5" /> {running && runVars?.side === "sell" ? "Placing…" : "Test SELL"}
            </button>
          </div>
        </div>
        {lastResult && (
          <p className={cn("rounded-lg px-3 py-2 text-xs",
            lastResult.status === "traded" || lastResult.status === "queued" ? "bg-[var(--color-profit)]/10 text-[var(--color-profit)]"
              : lastResult.status === "error" ? "bg-[var(--color-loss)]/10 text-[var(--color-loss)]"
              : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]")}>
            {lastResult.message}
          </p>
        )}
        {!lastResult && bot.lastError && (
          <p className="flex items-start gap-2 rounded-lg bg-[var(--color-loss)]/10 px-3 py-2 text-xs text-[var(--color-loss)]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Last run failed: {bot.lastError}
          </p>
        )}
      </div>

      {/* Signal summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Buy Signals", buySignals, "var(--color-profit)"],
          ["Sell Signals", sellSignals, "var(--color-loss)"],
          ["Traded", actedSignals, "var(--color-accent-primary)"],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-5">
            <p className="text-xs text-[var(--color-text-muted)]">{label as string}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: color as string }}>{value as number}</p>
          </div>
        ))}
      </div>

      {/* Signal history: BUY/SELL only, in plain language */}
      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Buy &amp; Sell Signals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)]">
                {["Time", "Signal", "Entry", "Stop Loss", "Take Profit", "Traded"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {botSignals.map((s) => {
                const plan = signalPlan(s)
                if (!plan) return null
                return (
                  <tr key={s.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50">
                    <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{format(new Date(s.triggeredAt), "MMM d HH:mm")}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 items-center rounded-full px-3 text-xs font-bold text-white" style={{ background: SIGNAL_BG[s.signalType] }}>
                        {plan.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[var(--color-text-primary)]">{fmtPrice(plan.price)}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--color-loss)]">{fmtPrice(plan.stopLoss)}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--color-profit)]">{fmtPrice(plan.takeProfit)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium", s.acted ? "text-[var(--color-profit)]" : "text-[var(--color-text-muted)]")}>
                        {s.acted ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {botSignals.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">No buy or sell signals yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
