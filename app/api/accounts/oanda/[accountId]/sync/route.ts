import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { decryptKey } from "@/lib/crypto"
import { getOandaAccountSummary, type OandaEnvironment } from "@/lib/oanda"
import { invalidateKey } from "@/lib/cache"

export const maxDuration = 30

type Ctx = { params: Promise<{ accountId: string }> }

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { accountId } = await params
  const account = await prisma.tradingAccount.findFirst({
    where: { id: accountId, userId: session.user.id, exchange: "oanda" },
  })
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!account.oandaAccessToken || !account.oandaAccountId) {
    return NextResponse.json({ error: "Account credentials missing" }, { status: 409 })
  }

  try {
    const token = decryptKey(account.oandaAccessToken)
    const env = (account.oandaEnvironment ?? "practice") as OandaEnvironment
    const summary = await getOandaAccountSummary(token, account.oandaAccountId, env)

    const updated = await prisma.tradingAccount.update({
      where: { id: account.id },
      data: {
        balance: summary.balance,
        equity: summary.equity,
        currency: summary.currency,
        connectionStatus: "connected",
        lastSyncedAt: new Date(),
        lastError: null,
      },
      omit: { mt5Password: true, oandaAccessToken: true },
    })

    await invalidateKey(`accounts:${session.user.id}`)
    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sync OANDA account."
    const updated = await prisma.tradingAccount.update({
      where: { id: account.id },
      data: { connectionStatus: "failed", lastError: message },
      omit: { mt5Password: true, oandaAccessToken: true },
    })
    await invalidateKey(`accounts:${session.user.id}`)
    return NextResponse.json(updated)
  }
}
