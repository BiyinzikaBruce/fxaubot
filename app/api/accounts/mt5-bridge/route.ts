import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { invalidateKey } from "@/lib/cache"
import { generateBridgeKey } from "@/lib/bridge"

const schema = z.object({
  name: z.string().min(1).max(100),
  broker: z.string().min(1).max(50),
  accountType: z.enum(["demo", "live"]),
})

/** Creates an MT5 account driven by the FXAU EA. The connection key is returned once; only its hash is stored. */
export async function POST(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Name, broker and account type are required" }, { status: 422 })

  const { key, hash } = generateBridgeKey()
  const account = await prisma.tradingAccount.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      broker: parsed.data.broker,
      accountType: parsed.data.accountType,
      exchange: "mt5",
      currency: "USD",
      connectionMode: "ea",
      connectionStatus: "disconnected",
      bridgeKeyHash: hash,
    },
    omit: { mt5Password: true, oandaAccessToken: true, bridgeKeyHash: true },
  })
  await invalidateKey(`accounts:${session.user.id}`)
  return NextResponse.json({ account, key }, { status: 201 })
}
