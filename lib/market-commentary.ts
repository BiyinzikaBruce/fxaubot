export type OandaPriceSummary = {
  instrument: string
  bid: number
  ask: number
  spread: number
  closeoutBid?: number
  closeoutAsk?: number
}

export type OandaCandleSummary = {
  instrument: string
  trend: "bullish" | "bearish" | "sideways"
  currentPrice: number
  high: number
  low: number
  changePercent: number
  signal: "buy" | "sell" | "wait"
  reason: string
  suggestedEntry: number
  suggestedSL: number
  suggestedTP: number
}

export function buildMarketCommentary(
  candles: OandaCandleSummary[],
  accountBalance: number,
  currency: string,
): string {
  if (!candles.length) {
    return `Good day trader. I am currently unable to retrieve live market data. Please ensure your OANDA account is connected and try again shortly.`
  }

  const lines: string[] = []
  const timeGreeting = getTimeGreeting()

  lines.push(`${timeGreeting}, trader.`)
  lines.push(`Your account balance is ${accountBalance.toLocaleString()} ${currency}.`)
  lines.push(`Here is your live market briefing.`)

  for (const c of candles) {
    const name = friendlyName(c.instrument)
    const dir = c.trend === "bullish" ? "upward trend" : c.trend === "bearish" ? "downward trend" : "sideways movement"
    const changeWord = c.changePercent >= 0 ? "up" : "down"
    const pct = Math.abs(c.changePercent).toFixed(2)

    lines.push(`${name} is showing ${dir}, ${changeWord} ${pct} percent in the last four hours.`)

    if (c.signal === "buy") {
      lines.push(
        `I see a buying opportunity on ${name}. ` +
        `Consider entering around ${c.suggestedEntry.toFixed(5)}, ` +
        `with a stop loss at ${c.suggestedSL.toFixed(5)} and take profit at ${c.suggestedTP.toFixed(5)}. ` +
        `Reason: ${c.reason}.`
      )
    } else if (c.signal === "sell") {
      lines.push(
        `I see a selling opportunity on ${name}. ` +
        `Consider entering around ${c.suggestedEntry.toFixed(5)}, ` +
        `with a stop loss at ${c.suggestedSL.toFixed(5)} and take profit at ${c.suggestedTP.toFixed(5)}. ` +
        `Reason: ${c.reason}.`
      )
    } else {
      lines.push(`${name} is in a wait zone. Hold off and watch for a clearer signal.`)
    }
  }

  lines.push(`Always manage your risk. Trade safe, trade smart.`)

  return lines.join(" ")
}

function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function friendlyName(instrument: string): string {
  const map: Record<string, string> = {
    "XAU_USD": "Gold versus the Dollar",
    "EUR_USD": "Euro Dollar",
    "GBP_USD": "Cable — Pound Dollar",
    "USD_JPY": "Dollar Yen",
    "AUD_USD": "Aussie Dollar",
    "USD_CAD": "Dollar Canada",
    "USD_CHF": "Dollar Swiss Franc",
    "NZD_USD": "New Zealand Dollar",
    "GBP_JPY": "Pound Yen",
    "EUR_GBP": "Euro Pound",
    "EUR_JPY": "Euro Yen",
  }
  return map[instrument] ?? instrument.replace("_", " versus ")
}
