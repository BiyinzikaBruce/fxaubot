import type { ExchangeAdapter, OHLCV, OrderResult } from "./index"
import { createHmac } from "crypto"

const BASE = "https://api.bybit.com"

const TF_MAP: Record<string, string> = {
  "1m": "1", "5m": "5", "15m": "15", "30m": "30",
  "1h": "60", "4h": "240", "1d": "D", "1w": "W",
}

export class BybitAdapter implements ExchangeAdapter {
  constructor(private apiKey: string, private apiSecret: string) {}

  async fetchOHLCV(symbol: string, timeframe: string, limit = 100): Promise<OHLCV[]> {
    const interval = TF_MAP[timeframe] ?? "60"
    const sym = symbol.replace("/", "")
    const res = await fetch(`${BASE}/v5/market/kline?category=spot&symbol=${sym}&interval=${interval}&limit=${limit}`)
    if (!res.ok) throw new Error(`Bybit OHLCV error: ${res.status}`)
    const data = await res.json() as { result: { list: string[][] } }
    return data.result.list.reverse().map((c) => ({
      timestamp: parseInt(c[0]),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
    }))
  }

  private sign(params: string, timestamp: number): string {
    return createHmac("sha256", this.apiSecret)
      .update(`${timestamp}${this.apiKey}5000${params}`)
      .digest("hex")
  }

  async getBalance(currency: string): Promise<number> {
    const ts = Date.now()
    const params = `accountType=UNIFIED&coin=${currency}`
    const sig = this.sign(params, ts)
    const res = await fetch(`${BASE}/v5/account/wallet-balance?${params}`, {
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": String(ts),
        "X-BAPI-RECV-WINDOW": "5000",
        "X-BAPI-SIGN": sig,
      },
    })
    if (!res.ok) throw new Error(`Bybit balance error: ${res.status}`)
    const data = await res.json() as { result: { list: { coin: { coin: string; walletBalance: string }[] }[] } }
    const coins = data.result.list[0]?.coin ?? []
    const coin = coins.find((c) => c.coin === currency)
    return coin ? parseFloat(coin.walletBalance) : 0
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", quantity: number): Promise<OrderResult> {
    const ts = Date.now()
    const body = JSON.stringify({
      category: "spot", symbol: symbol.replace("/", ""),
      side: side === "buy" ? "Buy" : "Sell", orderType: "Market", qty: String(quantity),
    })
    const sig = this.sign(body, ts)
    const res = await fetch(`${BASE}/v5/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": String(ts),
        "X-BAPI-RECV-WINDOW": "5000",
        "X-BAPI-SIGN": sig,
      },
      body,
    })
    if (!res.ok) throw new Error(`Bybit order error: ${res.status}`)
    const data = await res.json() as { result: { orderId: string; orderStatus: string } }
    return {
      orderId: data.result.orderId,
      symbol,
      side,
      price: 0,
      quantity,
      status: data.result.orderStatus,
    }
  }
}
