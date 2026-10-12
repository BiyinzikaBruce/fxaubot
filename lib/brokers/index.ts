import type { TradingAccount } from "@prisma/client"
import { decryptKey } from "@/lib/crypto"
import type { ForexBroker } from "./types"

export * from "./types"

export function isForexAccount(account: Pick<TradingAccount, "exchange">): boolean {
  return account.exchange === "mt5" || account.exchange === "oanda"
}

export async function getForexBroker(account: TradingAccount): Promise<ForexBroker> {
  if (account.exchange === "oanda") {
    if (!account.oandaAccountId || !account.oandaAccessToken) throw new Error("OANDA account is missing credentials. Reconnect it.")
    const { createOandaBroker } = await import("@/lib/oanda")
    return createOandaBroker(
      decryptKey(account.oandaAccessToken),
      account.oandaAccountId,
      account.oandaEnvironment === "live" ? "live" : "practice",
    )
  }
  if (account.exchange === "mt5") {
    if (!account.metaApiAccountId) throw new Error("MT5 account was never provisioned on MetaApi. Reconnect it.")
    const { createMt5Broker } = await import("@/lib/metaapi")
    return createMt5Broker(account.metaApiAccountId)
  }
  throw new Error(`${account.exchange} is not a forex broker account`)
}
