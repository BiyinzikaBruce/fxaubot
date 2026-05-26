import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ inviteId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { inviteId } = await params
  const { action } = await req.json()

  const invite = await prisma.mentorInvite.findUnique({ where: { id: inviteId } })
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isMentor = invite.mentorId === session.user.id
  const isTrader = invite.traderId === session.user.id

  if (action === "accept" && isMentor) {
    const updated = await prisma.mentorInvite.update({ where: { id: inviteId }, data: { status: "active" } })
    return NextResponse.json(updated)
  }

  if (action === "revoke" && (isMentor || isTrader)) {
    const updated = await prisma.mentorInvite.update({ where: { id: inviteId }, data: { status: "revoked" } })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Not allowed" }, { status: 403 })
}
