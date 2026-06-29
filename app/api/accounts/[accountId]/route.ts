import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { removeMt5Account } from "@/lib/metaapi"

export const maxDuration = 30

type Ctx = { params: Promise<{ accountId: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { accountId } = await params
  const account = await prisma.tradingAccount.findFirst({
    where: { id: accountId, userId: session.user.id },
  })
  if (!account) return NextResponse.json({ ok: true })

  if (account.metaApiAccountId) {
    try {
      await removeMt5Account(account.metaApiAccountId)
    } catch {
      // best-effort cleanup — don't block local deletion on MetaApi-side failures
    }
  }

  await prisma.tradingAccount.deleteMany({ where: { id: accountId, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
