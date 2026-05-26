import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { runBacktest } from "@/lib/backtest"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sessions = await prisma.backtestSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { exchange, symbol, timeframe, startDate, endDate, strategyConfig, initialBalance, positionSizePct, stopLossPct, takeProfitPct, name } = body

  try {
    const results = await runBacktest({ exchange, symbol, timeframe, startDate, endDate, strategyConfig, initialBalance, positionSizePct, stopLossPct, takeProfitPct })

    const record = await prisma.backtestSession.create({
      data: {
        userId: session.user.id,
        name: name || `${symbol} ${timeframe} backtest`,
        exchange,
        symbol,
        timeframe,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        strategyConfig,
        results: results as never,
      },
    })

    return NextResponse.json(record)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
