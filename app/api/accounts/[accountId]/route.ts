import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

type Ctx = { params: Promise<{ accountId: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { accountId } = await params
  await prisma.tradingAccount.deleteMany({ where: { id: accountId, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
