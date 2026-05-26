import { prisma } from "@/lib/db"
import { getAdapter } from "@/lib/exchanges/index"
import { evaluateSignal, type StrategyConfig } from "@/lib/indicators/index"
import type { Exchange } from "@prisma/client"

export async function runBot(botId: string): Promise<{ signal: string; acted: boolean }> {
  const bot = await prisma.botConfig.findUnique({
    where: { id: botId },
    include: { account: true },
  })
  if (!bot || !bot.isActive) return { signal: "neutral", acted: false }

  // Find exchange connection for this user + exchange
  const conn = await prisma.exchangeConnection.findFirst({
    where: { userId: bot.userId, exchange: bot.exchange, isActive: true },
  })
  if (!conn) return { signal: "neutral", acted: false }

  // Decrypt API keys
  const { decryptKey } = await import("@/lib/crypto")
  const apiKey = decryptKey(conn.apiKey)
  const apiSecret = decryptKey(conn.apiSecret)

  const adapter = await getAdapter(bot.exchange as "binance" | "bybit" | "okx" | "coinbase", apiKey, apiSecret)

  const candles = await adapter.fetchOHLCV(bot.symbol, bot.timeframe, 100)
  const strategy = bot.strategy as unknown as StrategyConfig
  const { signal, values } = evaluateSignal(candles, strategy)

  // Record signal
  await prisma.botSignal.create({
    data: {
      botConfigId: bot.id,
      symbol: bot.symbol,
      timeframe: bot.timeframe,
      signalType: signal as "buy" | "sell" | "neutral",
      indicatorValues: values,
    },
  })

  if (signal === "neutral") return { signal, acted: false }

  // Auto-trade mode: place order
  const balance = await adapter.getBalance("USDT")
  const positionSize = balance * (bot.positionSizePct / 100)
  const lastCandle = candles[candles.length - 1]
  const quantity = parseFloat((positionSize / lastCandle.close).toFixed(6))

  try {
    const order = await adapter.placeMarketOrder(bot.symbol, signal as "buy" | "sell", quantity)

    // Log as trade
    const now = new Date()
    await prisma.trade.create({
      data: {
        userId: bot.userId,
        accountId: bot.accountId,
        symbol: bot.symbol,
        side: signal === "buy" ? "long" : "short",
        entryPrice: lastCandle.close,
        quantity,
        fees: 0,
        entryAt: now,
        isBotTrade: true,
        tags: ["bot", bot.name],
      },
    })

    // Mark signal as acted
    await prisma.botSignal.updateMany({
      where: { botConfigId: bot.id, acted: false },
      data: { acted: true },
    })

    // Notify
    await prisma.notification.create({
      data: {
        userId: bot.userId,
        type: "bot_trade",
        message: `Bot "${bot.name}" placed a ${signal.toUpperCase()} order for ${bot.symbol} at $${lastCandle.close.toFixed(2)}`,
      },
    })

    // Trigger copy trades for any groups this user masters
    const { fireCopyTrades } = await import("@/lib/copy-trade")
    await fireCopyTrades(bot.userId, {
      symbol: bot.symbol,
      side: signal === "buy" ? "long" : "short",
      entryPrice: lastCandle.close,
      quantity,
      accountId: bot.accountId,
    })

    return { signal, acted: true }
  } catch {
    return { signal, acted: false }
  }
}

export async function runAllActiveBots(): Promise<void> {
  const activeBots = await prisma.botConfig.findMany({ where: { isActive: true } })
  await Promise.allSettled(activeBots.map((b) => runBot(b.id)))
}
