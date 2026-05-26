import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { invalidateTag } from "@/lib/cache"
import { z } from "zod"

type Params = { params: Promise<{ tradeId: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { tradeId } = await params
  const trade = await prisma.trade.findFirst({
    where: { id: tradeId, userId: session.user.id },
    include: {
      account: { select: { id: true, name: true, exchange: true } },
      playbook: { select: { id: true, name: true } },
    },
  })

  if (!trade) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(trade)
}

const updateSchema = z.object({
  exitPrice: z.number().positive().optional(),
  exitAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  playbookId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  fees: z.number().min(0).optional(),
})

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { tradeId } = await params
  const existing = await prisma.trade.findFirst({ where: { id: tradeId, userId } })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 422 })

  const { exitPrice, exitAt, fees, ...rest } = parsed.data

  const updatedFees = fees ?? existing.fees
  let grossPnl = existing.grossPnl
  let netPnl = existing.netPnl
  let duration = existing.duration

  if (exitPrice !== undefined) {
    grossPnl = parseFloat(
      ((exitPrice - existing.entryPrice) * existing.quantity * (existing.side === "long" ? 1 : -1)).toFixed(2),
    )
    netPnl = parseFloat((grossPnl - updatedFees).toFixed(2))
  }
  if (exitAt) {
    duration = Math.round((new Date(exitAt).getTime() - existing.entryAt.getTime()) / 1000)
  }

  const trade = await prisma.trade.update({
    where: { id: tradeId },
    data: {
      ...rest,
      ...(exitPrice !== undefined ? { exitPrice, grossPnl, netPnl } : {}),
      ...(exitAt ? { exitAt: new Date(exitAt), duration } : {}),
      ...(fees !== undefined ? { fees, netPnl: grossPnl !== null ? parseFloat((grossPnl - fees).toFixed(2)) : null } : {}),
    },
  })

  await invalidateTag(`trades:${userId}:*`)
  await invalidateTag(`analytics:*:${userId}*`)
  return Response.json(trade)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { tradeId } = await params
  const existing = await prisma.trade.findFirst({ where: { id: tradeId, userId } })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  await prisma.trade.delete({ where: { id: tradeId } })
  await invalidateTag(`trades:${userId}:*`)
  await invalidateTag(`analytics:*:${userId}*`)
  return new Response(null, { status: 204 })
}
