import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { invalidateTag } from "@/lib/cache"

type Params = { params: Promise<{ botId: string }> }

const EDITABLE = new Set([
  "name", "symbol", "timeframe", "strategy", "positionSizePct", "stopLossPct", "takeProfitPct", "autoTrade",
])

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { botId } = await params

  const bot = await prisma.botConfig.findFirst({
    where: { id: botId, userId: session.user.id },
    include: {
      account: { select: { name: true, exchange: true, balance: true } },
      signals: { where: { signalType: { not: "neutral" } }, orderBy: { triggeredAt: "desc" }, take: 50 },
    },
  })
  if (!bot) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(bot)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { botId } = await params
  const body = await req.json() as Record<string, unknown>
  const data: Record<string, unknown> = Object.fromEntries(Object.entries(body).filter(([k]) => EDITABLE.has(k)))
  // New market → the last evaluated candle no longer applies
  if ("symbol" in data || "timeframe" in data) data.lastCandleAt = null

  const bot = await prisma.botConfig.updateMany({
    where: { id: botId, userId: session.user.id },
    data: data as never,
  })
  await invalidateTag(`bots:${session.user.id}`)
  return Response.json(bot)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { botId } = await params

  await prisma.botConfig.deleteMany({ where: { id: botId, userId: session.user.id } })
  await invalidateTag(`bots:${session.user.id}`)
  return Response.json({ ok: true })
}
