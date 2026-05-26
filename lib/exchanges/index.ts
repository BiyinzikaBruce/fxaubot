export type OHLCV = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type OrderResult = {
  orderId: string
  symbol: string
  side: "buy" | "sell"
  price: number
  quantity: number
  status: string
}

export type ExchangeAdapter = {
  fetchOHLCV(symbol: string, timeframe: string, limit?: number): Promise<OHLCV[]>
  getBalance(currency: string): Promise<number>
  placeMarketOrder(symbol: string, side: "buy" | "sell", quantity: number): Promise<OrderResult>
}

export type ExchangeName = "binance" | "bybit" | "okx" | "coinbase"

export async function getAdapter(exchange: ExchangeName, apiKey: string, apiSecret: string): Promise<ExchangeAdapter> {
  switch (exchange) {
    case "binance": {
      const { BinanceAdapter } = await import("./binance")
      return new BinanceAdapter(apiKey, apiSecret)
    }
    case "bybit": {
      const { BybitAdapter } = await import("./bybit")
      return new BybitAdapter(apiKey, apiSecret)
    }
    case "okx": {
      const { OKXAdapter } = await import("./okx")
      return new OKXAdapter(apiKey, apiSecret)
    }
    case "coinbase": {
      const { CoinbaseAdapter } = await import("./coinbase")
      return new CoinbaseAdapter(apiKey, apiSecret)
    }
  }
}

export function normalizeSymbol(symbol: string, exchange: ExchangeName): string {
  const base = symbol.replace("/", "").replace("-", "")
  if (exchange === "binance") return base
  if (exchange === "bybit") return base
  if (exchange === "okx") return symbol.includes("/") ? symbol.replace("/", "-") : symbol
  if (exchange === "coinbase") return symbol.includes("/") ? symbol.replace("/", "-") : symbol
  return base
}
