import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { getCachedOrFetch, invalidateKey } from "@/lib/cache"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const accounts = await getCachedOrFetch(
    `accounts:${userId}`,
    () =>
      prisma.tradingAccount.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        omit: { mt5Password: true },
      }),
    300,
  )

  return Response.json(accounts)
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  exchange: z.enum(["binance", "bybit", "okx", "coinbase", "manual"]),
  balance: z.number().min(0).optional().default(0),
  currency: z.string().optional().default("USDT"),
  isDefault: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 422 })

  const account = await prisma.tradingAccount.create({
    data: { ...parsed.data, userId },
  })

  await invalidateKey(`accounts:${userId}`)
  return Response.json(account, { status: 201 })
}
