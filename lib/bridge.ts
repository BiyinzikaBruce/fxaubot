import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/db"
import type { OHLCV } from "@/lib/exchanges/index"
import type { OrderSide } from "@/lib/brokers/types"
import type { BotConfig, TradingAccount } from "@prisma/client"

/** EA counts as online if it polled within this window (it polls every ~5s). */
export const BRIDGE_ONLINE_MS = 30_000
/** Pending orders the EA hasn't picked up by then are dropped — never execute a stale signal. */
const PENDING_TTL_MS = 2 * 60_000

export function isBridgeAccount(account: Pick<TradingAccount, "exchange" | "connectionMode">): boolean {
  return account.exchange === "mt5" && account.connectionMode === "ea"
}

export function isBridgeOnline(account: Pick<TradingAccount, "bridgeLastSeenAt">): boolean {
  return !!account.bridgeLastSeenAt && Date.now() - account.bridgeLastSeenAt.getTime() < BRIDGE_ONLINE_MS
}

export function generateBridgeKey(): { key: string; hash: string } {
  const key = `fxau_${randomBytes(24).toString("base64url")}`
  return { key, hash: hashBridgeKey(key) }
}

export function hashBridgeKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

/** "XAU/USD", "xauusd", "EUR_USD" → "XAUUSD" — the EA resolves this to the broker's symbol. */
export function bridgeSymbolKey(symbol: string): string {
  return symbol.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

/** Broker symbols carry suffixes ("XAUUSDm", "EURUSD.a"), so match on prefix. */
export function brokerSymbolMatches(brokerSymbol: string, key: string): boolean {
  return bridgeSymbolKey(brokerSymbol).startsWith(key)
}

export async function queueBridgeOrder(
  bot: BotConfig & { account: TradingAccount },
  side: OrderSide,
  signalId: string | null,
) {
  await prisma.bridgeOrder.updateMany({
    where: { accountId: bot.accountId, status: "pending", createdAt: { lt: new Date(Date.now() - PENDING_TTL_MS) } },
    data: { status: "expired", completedAt: new Date(), error: "MT5 EA did not pick up the order in time" },
  })
  return prisma.bridgeOrder.create({
    data: {
      accountId: bot.accountId,
      botConfigId: bot.id,
      signalId,
      symbol: bridgeSymbolKey(bot.symbol),
      side,
      riskPct: bot.positionSizePct,
      stopLossPct: bot.stopLossPct,
      takeProfitPct: bot.takeProfitPct,
    },
  })
}

/** True if this account already has an order in flight for the symbol. */
export async function hasInflightBridgeOrder(accountId: string, symbolKey: string): Promise<boolean> {
  const count = await prisma.bridgeOrder.count({
    where: {
      accountId,
      symbol: symbolKey,
      OR: [
        { status: "pending", createdAt: { gte: new Date(Date.now() - PENDING_TTL_MS) } },
        { status: "sent", sentAt: { gte: new Date(Date.now() - PENDING_TTL_MS) } },
      ],
    },
  })
  return count > 0
}

export type BridgeCandleSet = { symbol: string; timeframe: string; bars: OHLCV[] }
