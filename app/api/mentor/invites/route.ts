import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [sent, received] = await Promise.all([
    prisma.mentorInvite.findMany({
      where: { traderId: session.user.id },
      include: { mentor: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mentorInvite.findMany({
      where: { mentorId: session.user.id },
      include: { trader: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return NextResponse.json({ sent, received })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { mentorEmail } = await req.json()
  if (!mentorEmail) return NextResponse.json({ error: "mentorEmail required" }, { status: 400 })

  const mentor = await prisma.user.findUnique({ where: { email: mentorEmail } })
  if (!mentor) return NextResponse.json({ error: "No user found with that email" }, { status: 404 })
  if (mentor.id === session.user.id) return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 })

  const existing = await prisma.mentorInvite.findUnique({
    where: { traderId_mentorId: { traderId: session.user.id, mentorId: mentor.id } },
  })
  if (existing) return NextResponse.json({ error: "Invite already sent" }, { status: 400 })

  const invite = await prisma.mentorInvite.create({
    data: { traderId: session.user.id, mentorId: mentor.id, status: "pending" },
    include: { mentor: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(invite, { status: 201 })
}
