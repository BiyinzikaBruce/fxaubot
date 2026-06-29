import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { getMt5AccountStatus, friendlyError } from "@/lib/metaapi"
import { invalidateKey } from "@/lib/cache"

export const maxDuration = 30

type Ctx = { params: Promise<{ accountId: string }> }

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { accountId } = await params
  const account = await prisma.tradingAccount.findFirst({
    where: { id: accountId, userId: session.user.id, exchange: "mt5" },
  })
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!account.metaApiAccountId) {
    return NextResponse.json({ error: "Account was never provisioned" }, { status: 409 })
  }

  try {
    const snapshot = await getMt5AccountStatus(account.metaApiAccountId)
    const connected = snapshot.state === "DEPLOYED" && snapshot.connectionStatus === "CONNECTED"

    const updated = await prisma.tradingAccount.update({
      where: { id: account.id },
      data: connected
        ? {
            connectionStatus: "connected",
            balance: snapshot.balance ?? account.balance,
            equity: snapshot.equity ?? account.equity,
            currency: snapshot.currency ?? account.currency,
            lastSyncedAt: new Date(),
            lastError: null,
          }
        : { connectionStatus: "connecting" },
      omit: { mt5Password: true },
    })
    await invalidateKey(`accounts:${session.user.id}`)
    return NextResponse.json(updated)
  } catch (err) {
    const updated = await prisma.tradingAccount.update({
      where: { id: account.id },
      data: { connectionStatus: "failed", lastError: friendlyError(err) },
      omit: { mt5Password: true },
    })
    await invalidateKey(`accounts:${session.user.id}`)
    return NextResponse.json(updated)
  }
}
