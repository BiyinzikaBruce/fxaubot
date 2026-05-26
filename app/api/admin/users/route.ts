import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, plan: true,
      planExpiresAt: true, createdAt: true,
      _count: { select: { trades: true, botConfigs: true } },
    },
  })
  return NextResponse.json(users)
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!caller || caller.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { userId, role, plan } = await req.json()
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { ...(role ? { role } : {}), ...(plan ? { plan } : {}) },
    select: { id: true, name: true, email: true, role: true, plan: true },
  })
  return NextResponse.json(updated)
}
