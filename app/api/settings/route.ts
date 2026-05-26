import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, plan: true, planExpiresAt: true, createdAt: true },
  })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.avatarUrl ? { avatarUrl: body.avatarUrl } : {}),
    },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })
  return NextResponse.json(user)
}
