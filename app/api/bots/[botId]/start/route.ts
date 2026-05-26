import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { invalidateTag } from "@/lib/cache"

type Params = { params: Promise<{ botId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { botId } = await params

  await prisma.botConfig.updateMany({
    where: { id: botId, userId: session.user.id },
    data: { isActive: true },
  })
  await invalidateTag(`bots:${session.user.id}`)
  return Response.json({ ok: true, isActive: true })
}
