import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { getCachedOrFetch, invalidateTag } from "@/lib/cache"

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const data = await getCachedOrFetch(
    `bots:${userId}`,
    () => prisma.botConfig.findMany({
      where: { userId },
      include: { account: { select: { name: true, exchange: true } }, _count: { select: { signals: true } } },
      orderBy: { createdAt: "desc" },
    }),
    60,
  )

  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const body = await req.json() as {
    name: string; accountId: string; exchange: string; symbol: string
    timeframe: string; strategy: unknown; positionSizePct?: number
    stopLossPct?: number; takeProfitPct?: number
  }

  const bot = await prisma.botConfig.create({
    data: {
      userId,
      name: body.name,
      accountId: body.accountId,
      exchange: body.exchange as never,
      symbol: body.symbol,
      timeframe: body.timeframe,
      strategy: body.strategy as never,
      positionSizePct: body.positionSizePct ?? 1,
      stopLossPct: body.stopLossPct ?? 2,
      takeProfitPct: body.takeProfitPct ?? 4,
    },
  })

  await invalidateTag(`bots:${userId}`)
  return Response.json(bot, { status: 201 })
}
