import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { invalidateKey } from "@/lib/cache"
import { bridgeSymbolKey, hashBridgeKey } from "@/lib/bridge"
import { evaluateBridgeBot, recordTrade } from "@/lib/bot-runner"

export const maxDuration = 30
export const dynamic = "force-dynamic"

// Polled every ~5s by the FXAU MT5 EA (public/downloads/FXAU-Bridge.mq5).
// Request is JSON; the response is pipe-delimited text lines because MQL5 has no JSON parser:
//   OK
//   WATCH|<symbolKey>|<timeframe>                                  — send closed bars for this market
//   ORDER|<id>|<symbolKey>|<buy|sell>|<riskPct>|<slPct>|<tpPct>     — execute now
// Errors come back as a single line: ERR|<message>

const num = z.coerce.number()
const bodySchema = z.object({
  login: z.coerce.string().optional(),
  server: z.string().optional(),
  company: z.string().optional(),
  currency: z.string().optional(),
  balance: num,
  equity: num,
  positions: z.array(z.object({ symbol: z.string() }).passthrough()).default([]),
  fills: z.array(z.object({
    id: z.string(),
    ok: z.boolean(),
    ticket: z.coerce.string().optional(),
    price: num.optional(),
    volume: num.optional(),
    sl: num.optional(),
    tp: num.optional(),
    error: z.string().optional(),
  })).default([]),
  candles: z.array(z.object({
    symbol: z.string(),
    timeframe: z.string(),
    // [time (sec), open, high, low, close, tickVolume], oldest first, closed bars only
    bars: z.array(z.tuple([num, num, num, num, num, num])),
  })).default([]),
})

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } })

export async function POST(req: NextRequest) {
  const key = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  if (!key) return text("ERR|Missing connection key", 401)

  const account = await prisma.tradingAccount.findFirst({ where: { bridgeKeyHash: hashBridgeKey(key) } })
  if (!account || account.connectionMode !== "ea") return text("ERR|Invalid connection key. Copy it again from FXAU.", 401)

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return text(`ERR|Bad request: ${parsed.error.issues[0]?.message ?? "invalid body"}`, 400)
  const body = parsed.data

  await prisma.tradingAccount.update({
    where: { id: account.id },
    data: {
      balance: body.balance,
      equity: body.equity,
      currency: body.currency || account.currency,
      mt5Login: body.login || account.mt5Login,
      mt5Server: body.server || account.mt5Server,
      broker: account.broker ?? body.company,
      connectionStatus: "connected",
      bridgeLastSeenAt: new Date(),
      bridgePositions: body.positions.map((p) => p.symbol),
      lastSyncedAt: new Date(),
      lastError: null,
    },
  })
  await invalidateKey(`accounts:${account.userId}`)

  // 1. Results of orders the EA executed since its last poll
  for (const fill of body.fills) {
    const order = await prisma.bridgeOrder.findFirst({
      where: { id: fill.id, accountId: account.id, status: { in: ["pending", "sent"] } },
      include: { botConfig: { include: { account: true } } },
    })
    if (!order) continue
    if (fill.ok) {
      await prisma.bridgeOrder.update({
        where: { id: order.id },
        data: {
          status: "filled", ticket: fill.ticket, fillPrice: fill.price, volume: fill.volume,
          stopLoss: fill.sl, takeProfit: fill.tp, completedAt: new Date(),
        },
      })
      await recordTrade(order.botConfig, order.side as "buy" | "sell", {
        price: fill.price ?? 0,
        quantity: fill.volume ?? 0,
        orderId: fill.ticket ?? order.id,
        stopLoss: fill.sl,
        takeProfit: fill.tp,
      }, order.signalId)
    } else {
      const error = fill.error || "MT5 rejected the order"
      await prisma.bridgeOrder.update({ where: { id: order.id }, data: { status: "rejected", error, completedAt: new Date() } })
      await prisma.botConfig.update({ where: { id: order.botConfigId }, data: { lastError: `MT5: ${error}` } })
      await prisma.notification.create({
        data: {
          userId: account.userId,
          type: "bot_trade",
          message: `MT5 rejected ${order.side.toUpperCase()} ${order.symbol} for bot "${order.botConfig.name}": ${error}`,
        },
      })
    }
  }

  // 2. Evaluate bots on freshly closed candles
  const bots = await prisma.botConfig.findMany({ where: { accountId: account.id, isActive: true }, include: { account: true } })
  const positionSymbols = body.positions.map((p) => p.symbol)
  for (const set of body.candles) {
    const bars = set.bars.map(([t, o, h, l, c, v]) => ({ timestamp: t * 1000, open: o, high: h, low: l, close: c, volume: v }))
    if (bars.length === 0) continue
    for (const bot of bots) {
      if (bridgeSymbolKey(bot.symbol) === set.symbol && bot.timeframe === set.timeframe) {
        await evaluateBridgeBot(bot, bars, positionSymbols)
      }
    }
  }

  // 3. Markets the EA should stream, and orders to execute now
  const watch = [...new Set(bots.map((b) => `${bridgeSymbolKey(b.symbol)}|${b.timeframe}`))]
  const pending = await prisma.bridgeOrder.findMany({
    where: { accountId: account.id, status: "pending", createdAt: { gte: new Date(Date.now() - 2 * 60_000) } },
    orderBy: { createdAt: "asc" },
  })
  if (pending.length > 0) {
    await prisma.bridgeOrder.updateMany({
      where: { id: { in: pending.map((o) => o.id) }, status: "pending" },
      data: { status: "sent", sentAt: new Date() },
    })
  }

  return text([
    "OK",
    ...watch.map((w) => `WATCH|${w}`),
    ...pending.map((o) => `ORDER|${o.id}|${o.symbol}|${o.side}|${o.riskPct}|${o.stopLossPct}|${o.takeProfitPct}`),
  ].join("\n"))
}
