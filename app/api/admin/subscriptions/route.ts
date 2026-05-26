import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(subs)
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!caller || caller.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { subId, action } = await req.json()
  const sub = await prisma.subscription.findUnique({ where: { id: subId } })
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (action === "approve") {
    const billing = sub.billing
    const months = billing === "yearly" ? 12 : 1
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + months)

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subId },
        data: { status: "active", verifiedAt: new Date(), expiresAt },
      }),
      prisma.user.update({
        where: { id: sub.userId },
        data: { plan: sub.plan, planBilling: sub.billing, planExpiresAt: expiresAt },
      }),
    ])
  } else if (action === "reject") {
    await prisma.subscription.update({ where: { id: subId }, data: { status: "rejected" } })
  }

  return NextResponse.json({ ok: true })
}
