import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { searchParams } = new URL(req.url)
  const botId = searchParams.get("botId")
  const signal = searchParams.get("signal")
  const take = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200)

  const signals = await prisma.botSignal.findMany({
    where: {
      botConfig: { userId },
      ...(botId ? { botConfigId: botId } : {}),
      ...(signal ? { signalType: signal as never } : {}),
    },
    include: { botConfig: { select: { name: true, symbol: true } } },
    orderBy: { triggeredAt: "desc" },
    take,
  })

  return Response.json(signals)
}
