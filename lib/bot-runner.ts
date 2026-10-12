import { prisma } from "@/lib/db"
import { getAdapter, type ExchangeName, type OHLCV } from "@/lib/exchanges/index"
import { evaluateSignal, type StrategyConfig } from "@/lib/indicators/index"
import { getForexBroker, isForexAccount, stopPrices, TIMEFRAME_MS, type OrderSide } from "@/lib/brokers"
import { brokerSymbolMatches, bridgeSymbolKey, hasInflightBridgeOrder, isBridgeAccount, isBridgeOnline, queueBridgeOrder } from "@/lib/bridge"
import type { BotConfig, TradingAccount } from "@prisma/client"

export type BotRunResult = {
  status: "skipped" | "signal" | "queued" | "traded" | "error"
  signal: "buy" | "sell" | "neutral"
  message: string
}

type RunOptions = {
  /** Manual test trade: skip the strategy and place this side immediately. */
  forceSide?: OrderSide
}

type BotWithAccount = BotConfig & { account: TradingAccount }

/** Keeps only candles whose period has fully closed — never trade on a forming candle. */
function closedCandles(candles: OHLCV[], timeframe: string): OHLCV[] {
  const tf = TIMEFRAME_MS[timeframe] ?? 0
  const now = Date.now()
  return candles.filter((c) => c.timestamp + tf <= now)
}

export async function runBot(botId: string, opts: RunOptions = {}): Promise<BotRunResult> {
  const bot = await prisma.botConfig.findUnique({ where: { id: botId }, include: { account: true } })
  if (!bot) return { status: "error", signal: "neutral", message: "Bot not found" }
  if (!bot.isActive && !opts.forceSide) return { status: "skipped", signal: "neutral", message: "Bot is stopped" }

  let result: BotRunResult
  try {
    result = isBridgeAccount(bot.account)
      ? await runBridgeBot(bot, opts)
      : isForexAccount(bot.account) ? await runForexBot(bot, opts) : await runCryptoBot(bot, opts)
  } catch (err) {
    result = { status: "error", signal: opts.forceSide ?? "neutral", message: err instanceof Error ? err.message : String(err) }
  }

  await prisma.botConfig.update({
    where: { id: bot.id },
    data: {
      lastRunAt: new Date(),
      // Keep the last error visible until a run actually succeeds or trades
      ...(result.status === "error" ? { lastError: result.message } : result.status !== "skipped" ? { lastError: null } : {}),
    },
  })
  return result
}

/**
 * Evaluates the strategy on the latest candle of `closed` (callers must pass closed candles only).
 * Returns null when that candle was already evaluated, so frequent runs never act twice on one signal.
 * Only BUY/SELL signals are stored (with the planned entry/SL/TP); neutral candles just advance lastCandleAt.
 */
async function evaluate(bot: BotWithAccount, closed: OHLCV[]) {
  const last = closed[closed.length - 1]
  if (!last) throw new Error("Broker returned no closed candles")
  const candleAt = new Date(last.timestamp)
  if (bot.lastCandleAt && candleAt <= bot.lastCandleAt) return null

  const { signal, values } = evaluateSignal(closed, bot.strategy as unknown as StrategyConfig)
  await prisma.botConfig.update({ where: { id: bot.id }, data: { lastCandleAt: candleAt } })
  if (signal === "neutral") return { signal, signalId: null, lastClose: last.close }

  const plan = stopPrices(signal, last.close, bot.stopLossPct, bot.takeProfitPct)
  const record = await prisma.botSignal.create({
    data: {
      botConfigId: bot.id,
      symbol: bot.symbol,
      timeframe: bot.timeframe,
      signalType: signal,
      indicatorValues: { ...values, price: last.close, stopLoss: plan.stopLoss, takeProfit: plan.takeProfit },
    },
  })
  return { signal, signalId: record.id, lastClose: last.close }
}

async function notifySignalOnly(bot: BotWithAccount, signal: OrderSide) {
  await prisma.notification.create({
    data: {
      userId: bot.userId,
      type: "signal_triggered",
      message: `Bot "${bot.name}" signalled ${signal.toUpperCase()} on ${bot.symbol} (signal-only mode, no order placed)`,
    },
  })
}

export async function recordTrade(
  bot: BotWithAccount,
  side: OrderSide,
  fill: { price: number; quantity: number; orderId: string; stopLoss?: number; takeProfit?: number },
  signalId: string | null,
) {
  await prisma.trade.create({
    data: {
      userId: bot.userId,
      accountId: bot.accountId,
      symbol: bot.symbol,
      side: side === "buy" ? "long" : "short",
      entryPrice: fill.price,
      quantity: fill.quantity,
      fees: 0,
      entryAt: new Date(),
      isBotTrade: true,
      externalId: fill.orderId,
      tags: ["bot", bot.name],
      notes: fill.stopLoss != null ? `SL ${fill.stopLoss} · TP ${fill.takeProfit}` : null,
    },
  })
  if (signalId) await prisma.botSignal.update({ where: { id: signalId }, data: { acted: true } })

  await prisma.notification.create({
    data: {
      userId: bot.userId,
      type: "bot_trade",
      message: `Bot "${bot.name}" placed a ${side.toUpperCase()} on ${bot.symbol} at ${fill.price} (size ${fill.quantity})`,
    },
  })

  const { fireCopyTrades } = await import("@/lib/copy-trade")
  await fireCopyTrades(bot.userId, {
    symbol: bot.symbol,
    side: side === "buy" ? "long" : "short",
    entryPrice: fill.price,
    quantity: fill.quantity,
    accountId: bot.accountId,
  })
}

// ── MT5 / OANDA ──────────────────────────────────────────────────────────────

async function runForexBot(bot: BotWithAccount, opts: RunOptions): Promise<BotRunResult> {
  const broker = await getForexBroker(bot.account)
  try {
    const symbol = await broker.resolveSymbol(bot.symbol)

    let side: OrderSide
    let signalId: string | null = null
    if (opts.forceSide) {
      side = opts.forceSide
    } else {
      const candles = await broker.fetchCandles(symbol, bot.timeframe, 200)
      const evaluated = await evaluate(bot, closedCandles(candles, bot.timeframe))
      if (!evaluated) return { status: "skipped", signal: "neutral", message: "No new closed candle since last run" }
      if (evaluated.signal === "neutral") return { status: "signal", signal: "neutral", message: "No signal on latest candle" }
      side = evaluated.signal
      signalId = evaluated.signalId
      if (!bot.autoTrade) {
        await notifySignalOnly(bot, side)
        return { status: "signal", signal: side, message: `${side.toUpperCase()} signal (signal-only mode)` }
      }
    }

    // One position per symbol — SL/TP closes it; avoids stacking on repeated signals
    if (await broker.hasOpenPosition(symbol)) {
      return { status: "signal", signal: side, message: `${side.toUpperCase()} signal, but a ${symbol} position is already open` }
    }

    const balance = await broker.getBalance()
    const fill = await broker.placeRiskOrder({
      symbol,
      side,
      riskAmount: balance * (bot.positionSizePct / 100),
      stopLossPct: bot.stopLossPct,
      takeProfitPct: bot.takeProfitPct,
    })
    await recordTrade(bot, side, fill, signalId)
    return {
      status: "traded",
      signal: side,
      message: `${side.toUpperCase()} ${fill.quantity} ${symbol} @ ${fill.price} (SL ${fill.stopLoss}, TP ${fill.takeProfit})`,
    }
  } finally {
    await broker.close()
  }
}

// ── MT5 via the FXAU EA bridge ───────────────────────────────────────────────
// The EA uploads closed candles on every new bar; /api/bridge/sync calls evaluateBridgeBot
// with them. Orders are queued and executed by the EA on its next poll (~5s).

async function runBridgeBot(bot: BotWithAccount, opts: RunOptions): Promise<BotRunResult> {
  if (!isBridgeOnline(bot.account)) {
    throw new Error("Your MT5 terminal is offline. Open MT5 with the FXAU EA attached to a chart, then try again.")
  }
  if (!opts.forceSide) {
    return {
      status: "skipped",
      signal: "neutral",
      message: "MT5 EA bots evaluate automatically each time MT5 closes a new candle — nothing to run manually.",
    }
  }
  const key = bridgeSymbolKey(bot.symbol)
  if (bot.account.bridgePositions.some((s) => brokerSymbolMatches(s, key))) {
    return { status: "skipped", signal: opts.forceSide, message: `You already have an open ${bot.symbol} trade from FXAU. Close it in MT5 first.` }
  }
  if (await hasInflightBridgeOrder(bot.accountId, key)) {
    return { status: "skipped", signal: opts.forceSide, message: "An order for this symbol is already on its way to MT5." }
  }
  await queueBridgeOrder(bot, opts.forceSide, null)
  return {
    status: "queued",
    signal: opts.forceSide,
    message: `${opts.forceSide.toUpperCase()} ${bot.symbol} sent to your MT5 — it executes within a few seconds and appears in your journal.`,
  }
}

export async function evaluateBridgeBot(
  bot: BotWithAccount,
  closedBars: OHLCV[],
  openPositionSymbols: string[],
): Promise<BotRunResult> {
  let result: BotRunResult
  try {
    const evaluated = await evaluate(bot, closedBars)
    if (!evaluated) {
      result = { status: "skipped", signal: "neutral", message: "Candle already evaluated" }
    } else if (evaluated.signal === "neutral") {
      result = { status: "signal", signal: "neutral", message: "No signal on latest candle" }
    } else if (!bot.autoTrade) {
      await notifySignalOnly(bot, evaluated.signal)
      result = { status: "signal", signal: evaluated.signal, message: "Signal-only mode" }
    } else {
      const key = bridgeSymbolKey(bot.symbol)
      if (openPositionSymbols.some((s) => brokerSymbolMatches(s, key)) || await hasInflightBridgeOrder(bot.accountId, key)) {
        result = { status: "signal", signal: evaluated.signal, message: `Position already open on ${bot.symbol}` }
      } else {
        await queueBridgeOrder(bot, evaluated.signal, evaluated.signalId)
        result = { status: "queued", signal: evaluated.signal, message: `${evaluated.signal.toUpperCase()} queued for MT5` }
      }
    }
  } catch (err) {
    result = { status: "error", signal: "neutral", message: err instanceof Error ? err.message : String(err) }
  }
  if (result.status !== "skipped") {
    await prisma.botConfig.update({
      where: { id: bot.id },
      data: { lastRunAt: new Date(), lastError: result.status === "error" ? result.message : null },
    })
  }
  return result
}

// ── Crypto exchanges ─────────────────────────────────────────────────────────

async function runCryptoBot(bot: BotWithAccount, opts: RunOptions): Promise<BotRunResult> {
  const conn = await prisma.exchangeConnection.findFirst({
    where: { userId: bot.userId, exchange: bot.exchange, isActive: true },
  })
  if (!conn) throw new Error(`No active ${bot.exchange} API key connection. Add one in Settings.`)

  const { decryptKey } = await import("@/lib/crypto")
  const adapter = await getAdapter(bot.exchange as ExchangeName, decryptKey(conn.apiKey), decryptKey(conn.apiSecret))
  const candles = await adapter.fetchOHLCV(bot.symbol, bot.timeframe, 100)

  let side: OrderSide
  let signalId: string | null = null
  if (opts.forceSide) {
    side = opts.forceSide
  } else {
    const evaluated = await evaluate(bot, closedCandles(candles, bot.timeframe))
    if (!evaluated) return { status: "skipped", signal: "neutral", message: "No new closed candle since last run" }
    if (evaluated.signal === "neutral") return { status: "signal", signal: "neutral", message: "No signal on latest candle" }
    side = evaluated.signal
    signalId = evaluated.signalId
    if (!bot.autoTrade) {
      await notifySignalOnly(bot, side)
      return { status: "signal", signal: side, message: `${side.toUpperCase()} signal (signal-only mode)` }
    }
  }

  const lastClose = candles[candles.length - 1].close
  const balance = await adapter.getBalance("USDT")
  const quantity = parseFloat(((balance * (bot.positionSizePct / 100)) / lastClose).toFixed(6))
  const order = await adapter.placeMarketOrder(bot.symbol, side, quantity)
  await recordTrade(bot, side, { price: order.price || lastClose, quantity, orderId: order.orderId }, signalId)
  return { status: "traded", signal: side, message: `${side.toUpperCase()} ${quantity} ${bot.symbol} @ ${order.price || lastClose}` }
}

export async function runAllActiveBots(): Promise<Array<{ botId: string } & BotRunResult>> {
  // EA-bridge bots are driven by candle uploads from MT5, not by the scheduler
  const activeBots = await prisma.botConfig.findMany({
    where: { isActive: true, NOT: { account: { connectionMode: "ea" } } },
    select: { id: true },
  })
  const settled = await Promise.allSettled(activeBots.map((b) => runBot(b.id)))
  return settled.map((s, i) => ({
    botId: activeBots[i].id,
    ...(s.status === "fulfilled"
      ? s.value
      : { status: "error" as const, signal: "neutral" as const, message: String(s.reason) }),
  }))
}
