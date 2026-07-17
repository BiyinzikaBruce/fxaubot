import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { encryptKey } from "@/lib/crypto"
import { validateOandaCredentials } from "@/lib/oanda"
import { invalidateKey } from "@/lib/cache"

export const maxDuration = 30

const connectSchema = z.object({
  name: z.string().min(1).max(100),
  oandaAccountId: z.string().min(1).max(50),
  accessToken: z.string().min(1).max(500),
  environment: z.enum(["practice", "live"]),
})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = connectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  const { name, oandaAccountId, accessToken, environment } = parsed.data

  try {
    const summary = await validateOandaCredentials(accessToken, oandaAccountId, environment)

    const account = await prisma.tradingAccount.create({
      data: {
        userId: session.user.id,
        name,
        exchange: "oanda",
        balance: summary.balance,
        equity: summary.equity,
        currency: summary.currency,
        oandaAccountId: summary.id,
        oandaAccessToken: encryptKey(accessToken),
        oandaEnvironment: environment,
        connectionStatus: "connected",
        lastSyncedAt: new Date(),
      },
      omit: { mt5Password: true, oandaAccessToken: true },
    })

    await invalidateKey(`accounts:${session.user.id}`)
    return NextResponse.json(account, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect OANDA account."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
