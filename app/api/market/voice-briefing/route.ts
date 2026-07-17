import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { decryptKey } from "@/lib/crypto"
import { type OandaEnvironment } from "@/lib/oanda"
import { buildMarketCommentary, type OandaCandleSummary } from "@/lib/market-commentary"

export const maxDuration = 30

const INSTRUMENTS = ["XAU_USD", "EUR_USD", "GBP_USD"]

async function fetchCandles(
  token: string,
  environment: OandaEnvironment,
  instrument: string,
): Promise<OandaCandleSummary | null> {
  const base = environment === "live"
    ? "https://api-fxtrade.oanda.com"
    : "https://api-fxpractice.oanda.com"

  const res = await fetch(
    `${base}/v3/instruments/${instrument}/candles?count=20&granularity=H4&price=M`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) return null

  const json = await res.json()
  const candles: Array<{ mid: { o: string; h: string; l: string; c: string } }> = json.candles ?? []
  if (candles.length < 5) return null

  const closes = candles.map((c) => parseFloat(c.mid.c))
  const highs = candles.map((c) => parseFloat(c.mid.h))
  const lows = candles.map((c) => parseFloat(c.mid.l))

  const current = closes[closes.length - 1]
  const open = closes[0]
  const high = Math.max(...highs)
  const low = Math.min(...lows)
  const changePercent = ((current - open) / open) * 100

  // Simple EMA-based trend: compare last 5 vs last 10 average
  const recent = closes.slice(-5)
  const older = closes.slice(-10, -5)
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

  let trend: "bullish" | "bearish" | "sideways"
  let signal: "buy" | "sell" | "wait"
  let reason: string

  const diff = ((recentAvg - olderAvg) / olderAvg) * 100

  if (diff > 0.05) {
    trend = "bullish"
    signal = "buy"
    reason = "price momentum is rising with higher recent averages"
  } else if (diff < -0.05) {
    trend = "bearish"
    signal = "sell"
    reason = "price momentum is falling with lower recent averages"
  } else {
    trend = "sideways"
    signal = "wait"
    reason = "no clear directional momentum"
  }

  const atr = (high - low) / candles.length
  const suggestedEntry = current
  const suggestedSL = signal === "buy" ? current - atr * 1.5 : current + atr * 1.5
  const suggestedTP = signal === "buy" ? current + atr * 3 : current - atr * 3

  return { instrument, trend, currentPrice: current, high, low, changePercent, signal, reason, suggestedEntry, suggestedSL, suggestedTP }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Find user's OANDA account
  const account = await prisma.tradingAccount.findFirst({
    where: { userId: session.user.id, exchange: "oanda" },
    orderBy: { createdAt: "desc" },
  })

  if (!account?.oandaAccessToken) {
    return NextResponse.json({
      commentary: "No OANDA account connected. Please connect your OANDA account in the Accounts section to receive live market briefings.",
    })
  }

  const token = decryptKey(account.oandaAccessToken)
  const env = (account.oandaEnvironment ?? "practice") as OandaEnvironment

  const results = await Promise.all(
    INSTRUMENTS.map((inst) => fetchCandles(token, env, inst))
  )
  const candles = results.filter((c): c is OandaCandleSummary => c !== null)

  const commentary = buildMarketCommentary(candles, account.balance, account.currency)

  return NextResponse.json({ commentary, candles })
}
