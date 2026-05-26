import type { ExchangeAdapter, OHLCV, OrderResult } from "./index"
import { createHmac } from "crypto"

const BASE = "https://www.okx.com"

const TF_MAP: Record<string, string> = {
  "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1h": "1H", "4h": "4H", "1d": "1D", "1w": "1W",
}

export class OKXAdapter implements ExchangeAdapter {
  constructor(private apiKey: string, private apiSecret: string, private passphrase = "") {}

  private sign(timestamp: string, method: string, path: string, body = ""): string {
    return createHmac("sha256", this.apiSecret)
      .update(`${timestamp}${method}${path}${body}`)
      .digest("base64")
  }

  private headers(method: string, path: string, body = "") {
    const ts = new Date().toISOString()
    return {
      "Content-Type": "application/json",
      "OK-ACCESS-KEY": this.apiKey,
      "OK-ACCESS-SIGN": this.sign(ts, method, path, body),
      "OK-ACCESS-TIMESTAMP": ts,
      "OK-ACCESS-PASSPHRASE": this.passphrase,
    }
  }

  async fetchOHLCV(symbol: string, timeframe: string, limit = 100): Promise<OHLCV[]> {
    const bar = TF_MAP[timeframe] ?? "1H"
    const instId = symbol.includes("/") ? symbol.replace("/", "-") : symbol
    const path = `/api/v5/market/candles?instId=${instId}&bar=${bar}&limit=${limit}`
    const res = await fetch(`${BASE}${path}`)
    if (!res.ok) throw new Error(`OKX OHLCV error: ${res.status}`)
    const data = await res.json() as { data: string[][] }
    return data.data.reverse().map((c) => ({
      timestamp: parseInt(c[0]),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
    }))
  }

  async getBalance(currency: string): Promise<number> {
    const path = `/api/v5/account/balance?ccy=${currency}`
    const res = await fetch(`${BASE}${path}`, { headers: this.headers("GET", path) })
    if (!res.ok) throw new Error(`OKX balance error: ${res.status}`)
    const data = await res.json() as { data: { details: { ccy: string; availBal: string }[] }[] }
    const detail = data.data[0]?.details.find((d) => d.ccy === currency)
    return detail ? parseFloat(detail.availBal) : 0
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", quantity: number): Promise<OrderResult> {
    const path = "/api/v5/trade/order"
    const instId = symbol.includes("/") ? symbol.replace("/", "-") : symbol
    const body = JSON.stringify({ instId, tdMode: "cash", side, ordType: "market", sz: String(quantity) })
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: this.headers("POST", path, body),
      body,
    })
    if (!res.ok) throw new Error(`OKX order error: ${res.status}`)
    const data = await res.json() as { data: { ordId: string; sCode: string }[] }
    return {
      orderId: data.data[0].ordId,
      symbol,
      side,
      price: 0,
      quantity,
      status: data.data[0].sCode === "0" ? "FILLED" : "FAILED",
    }
  }
}
