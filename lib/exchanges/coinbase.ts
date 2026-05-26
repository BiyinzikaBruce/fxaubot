import type { ExchangeAdapter, OHLCV, OrderResult } from "./index"
import { createHmac } from "crypto"

const BASE = "https://api.coinbase.com"

const TF_MAP: Record<string, string> = {
  "1m": "ONE_MINUTE", "5m": "FIVE_MINUTE", "15m": "FIFTEEN_MINUTE",
  "30m": "THIRTY_MINUTE", "1h": "ONE_HOUR", "4h": "FOUR_HOUR", "1d": "ONE_DAY",
}

export class CoinbaseAdapter implements ExchangeAdapter {
  constructor(private apiKey: string, private apiSecret: string) {}

  private sign(method: string, path: string, body: string): { sig: string; ts: string } {
    const ts = Math.floor(Date.now() / 1000).toString()
    const msg = `${ts}${method}${path}${body}`
    const sig = createHmac("sha256", this.apiSecret).update(msg).digest("hex")
    return { sig, ts }
  }

  private authHeaders(method: string, path: string, body = "") {
    const { sig, ts } = this.sign(method, path, body)
    return {
      "Content-Type": "application/json",
      "CB-ACCESS-KEY": this.apiKey,
      "CB-ACCESS-SIGN": sig,
      "CB-ACCESS-TIMESTAMP": ts,
    }
  }

  async fetchOHLCV(symbol: string, timeframe: string, limit = 100): Promise<OHLCV[]> {
    const gran = TF_MAP[timeframe] ?? "ONE_HOUR"
    const productId = symbol.includes("/") ? symbol.replace("/", "-") : symbol
    const end = Math.floor(Date.now() / 1000)
    const start = end - limit * 3600
    const path = `/api/v3/brokerage/products/${productId}/candles?start=${start}&end=${end}&granularity=${gran}`
    const res = await fetch(`${BASE}${path}`)
    if (!res.ok) throw new Error(`Coinbase OHLCV error: ${res.status}`)
    const data = await res.json() as { candles: { start: string; open: string; high: string; low: string; close: string; volume: string }[] }
    return data.candles.reverse().map((c) => ({
      timestamp: parseInt(c.start) * 1000,
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume),
    }))
  }

  async getBalance(currency: string): Promise<number> {
    const path = "/api/v3/brokerage/accounts"
    const res = await fetch(`${BASE}${path}`, { headers: this.authHeaders("GET", path) })
    if (!res.ok) throw new Error(`Coinbase balance error: ${res.status}`)
    const data = await res.json() as { accounts: { currency: string; available_balance: { value: string } }[] }
    const acct = data.accounts.find((a) => a.currency === currency)
    return acct ? parseFloat(acct.available_balance.value) : 0
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", quantity: number): Promise<OrderResult> {
    const path = "/api/v3/brokerage/orders"
    const productId = symbol.includes("/") ? symbol.replace("/", "-") : symbol
    const body = JSON.stringify({
      client_order_id: `fxau-${Date.now()}`,
      product_id: productId,
      side: side === "buy" ? "BUY" : "SELL",
      order_configuration: { market_market_ioc: { base_size: String(quantity) } },
    })
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: this.authHeaders("POST", path, body),
      body,
    })
    if (!res.ok) throw new Error(`Coinbase order error: ${res.status}`)
    const data = await res.json() as { order_id: string; status: string }
    return {
      orderId: data.order_id,
      symbol,
      side,
      price: 0,
      quantity,
      status: data.status,
    }
  }
}
