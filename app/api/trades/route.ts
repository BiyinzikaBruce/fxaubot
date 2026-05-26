import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { getCachedOrFetch, invalidateTag } from "@/lib/cache"
import { z } from "zod"

function buildWhere(userId: string, params: URLSearchParams) {
  const where: Record<string, unknown> = { userId }
  const accountId = params.get("accountId")
  const symbol = params.get("symbol")
  const side = params.get("side")
  const from = params.get("from")
  const to = params.get("to")
  const playbookId = params.get("playbookId")
  const tags = params.get("tags")

  if (accountId) where.accountId = accountId
  if (symbol) where.symbol = { contains: symbol, mode: "insensitive" }
  if (side) where.side = side
  if (playbookId) where.playbookId = playbookId
  if (tags) where.tags = { hasSome: tags.split(",") }
  if (from || to) {
    where.entryAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }
  return where
}

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)))
  const skip = (page - 1) * limit

  const cacheKey = `trades:${userId}:${searchParams.toString()}`

  const result = await getCachedOrFetch(
    cacheKey,
    async () => {
      const where = buildWhere(userId, searchParams)
      const [total, trades] = await Promise.all([
        prisma.trade.count({ where }),
        prisma.trade.findMany({
          where,
          orderBy: { entryAt: "desc" },
          skip,
          take: limit,
          include: { playbook: { select: { id: true, name: true } } },
        }),
      ])
      return { trades, total, page, limit, pages: Math.ceil(total / limit) }
    },
    120,
  )

  return Response.json(result)
}

const tradeSchema = z.object({
  accountId: z.string(),
  symbol: z.string().min(1),
  side: z.enum(["long", "short"]),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive().optional(),
  quantity: z.number().positive(),
  fees: z.number().min(0).optional().default(0),
  entryAt: z.string().datetime(),
  exitAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional().default([]),
  playbookId: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const body = await req.json()
  const parsed = tradeSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 422 })

  const { accountId, entryPrice, exitPrice, quantity, side, fees, entryAt, exitAt, ...rest } = parsed.data

  const account = await prisma.tradingAccount.findFirst({ where: { id: accountId, userId } })
  if (!account) return Response.json({ error: "Account not found" }, { status: 404 })

  let grossPnl: number | undefined
  let netPnl: number | undefined
  let duration: number | undefined

  if (exitPrice !== undefined) {
    grossPnl = parseFloat(((exitPrice - entryPrice) * quantity * (side === "long" ? 1 : -1)).toFixed(2))
    netPnl = parseFloat((grossPnl - (fees ?? 0)).toFixed(2))
  }
  if (exitAt) {
    duration = Math.round((new Date(exitAt).getTime() - new Date(entryAt).getTime()) / 1000)
  }

  const trade = await prisma.trade.create({
    data: {
      ...rest,
      accountId,
      userId,
      side,
      entryPrice,
      exitPrice,
      quantity,
      fees: fees ?? 0,
      grossPnl,
      netPnl,
      entryAt: new Date(entryAt),
      exitAt: exitAt ? new Date(exitAt) : undefined,
      duration,
    },
  })

  await invalidateTag(`trades:${userId}:*`)
  await invalidateTag(`analytics:*:${userId}*`)
  return Response.json(trade, { status: 201 })
}
