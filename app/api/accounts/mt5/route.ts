import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { encryptKey } from "@/lib/crypto"
import { provisionMt5Account, friendlyError } from "@/lib/metaapi"
import { invalidateKey } from "@/lib/cache"

export const maxDuration = 30

const connectSchema = z.object({
  name: z.string().min(1).max(100),
  broker: z.string().min(1).max(100),
  login: z.string().regex(/^\d+$/, "Login must be numeric"),
  password: z.string().min(1).max(200),
  server: z.string().min(1).max(100),
  platform: z.enum(["mt4", "mt5"]).default("mt5"),
  accountType: z.enum(["demo", "live"]),
})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = connectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  const { name, broker, login, password, server, platform, accountType } = parsed.data

  const account = await prisma.tradingAccount.create({
    data: {
      userId: session.user.id,
      name,
      exchange: "mt5",
      broker,
      mt5Login: login,
      mt5Password: encryptKey(password),
      mt5Server: server,
      mt5Platform: platform,
      accountType,
      connectionStatus: "connecting",
      currency: "USD",
    },
  })

  try {
    const metaApiAccountId = await provisionMt5Account({ name, login, password, server, platform })
    const updated = await prisma.tradingAccount.update({
      where: { id: account.id },
      data: { metaApiAccountId },
      omit: { mt5Password: true },
    })
    await invalidateKey(`accounts:${session.user.id}`)
    return NextResponse.json(updated, { status: 201 })
  } catch (err) {
    const updated = await prisma.tradingAccount.update({
      where: { id: account.id },
      data: { connectionStatus: "failed", lastError: friendlyError(err) },
      omit: { mt5Password: true },
    })
    await invalidateKey(`accounts:${session.user.id}`)
    return NextResponse.json(updated, { status: 201 })
  }
}
