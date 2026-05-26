import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("mode") // "master" | "follower" | "public"

  if (mode === "master") {
    const groups = await prisma.copyTradeGroup.findMany({
      where: { masterId: userId },
      include: { members: { include: { follower: { select: { id: true, name: true, avatarUrl: true } } } }, _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    })
    return Response.json(groups)
  }

  if (mode === "follower") {
    const memberships = await prisma.copyTradeMember.findMany({
      where: { followerId: userId },
      include: { group: { include: { master: { select: { id: true, name: true, avatarUrl: true } } } } },
    })
    return Response.json(memberships)
  }

  // Public groups
  const groups = await prisma.copyTradeGroup.findMany({
    where: { isPublic: true },
    include: {
      master: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return Response.json(groups)
}

export async function POST(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json() as { name: string; isPublic?: boolean; maxFollowers?: number }
  const group = await prisma.copyTradeGroup.create({
    data: {
      masterId: session.user.id,
      name: body.name,
      isPublic: body.isPublic ?? false,
      maxFollowers: body.maxFollowers ?? 10,
    },
  })
  return Response.json(group, { status: 201 })
}
