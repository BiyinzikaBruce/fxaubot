import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"

type Params = { params: Promise<{ groupId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { groupId } = await params

  await prisma.copyTradeMember.updateMany({
    where: { groupId, followerId: session.user.id },
    data: { isActive: false },
  })
  return Response.json({ ok: true })
}
