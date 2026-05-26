import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"

type Params = { params: Promise<{ groupId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { groupId } = await params
  const body = await req.json() as { allocationPct?: number }

  const group = await prisma.copyTradeGroup.findUnique({ where: { id: groupId } })
  if (!group) return Response.json({ error: "Group not found" }, { status: 404 })
  if (!group.isPublic) return Response.json({ error: "Group is private" }, { status: 403 })
  if (group.masterId === session.user.id) return Response.json({ error: "Cannot follow your own group" }, { status: 400 })

  const memberCount = await prisma.copyTradeMember.count({ where: { groupId } })
  if (memberCount >= group.maxFollowers) return Response.json({ error: "Group is full" }, { status: 400 })

  const member = await prisma.copyTradeMember.upsert({
    where: { groupId_followerId: { groupId, followerId: session.user.id } },
    create: { groupId, followerId: session.user.id, allocationPct: body.allocationPct ?? 10 },
    update: { isActive: true, allocationPct: body.allocationPct ?? 10 },
  })
  return Response.json(member, { status: 201 })
}
