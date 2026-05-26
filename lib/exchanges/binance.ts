import type { ExchangeAdapter, OHLCV, OrderResult } from "./index"
import { createHmac } from "crypto"

const BASE = "https://api.binance.com"

const TF_MAP: Record<string, string> = {
  "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1h": "1h", "4h": "4h", "1d": "1d", "1w": "1w",
}

export class BinanceAdapter implements ExchangeAdapter {
  constructor(private apiKey: string, private apiSecret: string) {}

  async fetchOHLCV(symbol: string, timeframe: string, limit = 100): Promise<OHLCV[]> {
    const interval = TF_MAP[timeframe] ?? "1h"
    const sym = symbol.replace("/", "")
    const res = await fetch(`${BASE}/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`)
    if (!res.ok) throw new Error(`Binance OHLCV error: ${res.status}`)
    const data = await res.json() as [number, string, string, string, string, string][]
    return data.map((c) => ({
      timestamp: c[0],
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
    }))
  }

  async getBalance(currency: string): Promise<number> {
    const timestamp = Date.now()
    const query = `timestamp=${timestamp}`
    const sig = createHmac("sha256", this.apiSecret).update(query).digest("hex")
    const res = await fetch(`${BASE}/api/v3/account?${query}&signature=${sig}`, {
      headers: { "X-MBX-APIKEY": this.apiKey },
    })
    if (!res.ok) throw new Error(`Binance balance error: ${res.status}`)
    const data = await res.json() as { balances: { asset: string; free: string }[] }
    const bal = data.balances.find((b) => b.asset === currency)
    return bal ? parseFloat(bal.free) : 0
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", quantity: number): Promise<OrderResult> {
    const sym = symbol.replace("/", "")
    const timestamp = Date.now()
    const params = `symbol=${sym}&side=${side.toUpperCase()}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`
    const sig = createHmac("sha256", this.apiSecret).update(params).digest("hex")
    const res = await fetch(`${BASE}/api/v3/order?${params}&signature=${sig}`, {
      method: "POST",
      headers: { "X-MBX-APIKEY": this.apiKey },
    })
    if (!res.ok) throw new Error(`Binance order error: ${res.status}`)
    const data = await res.json() as { orderId: number; status: string; price: string; executedQty: string }
    return {
      orderId: String(data.orderId),
      symbol,
      side,
      price: parseFloat(data.price),
      quantity: parseFloat(data.executedQty),
      status: data.status,
    }
  }
}
