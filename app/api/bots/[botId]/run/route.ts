import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { invalidateTag } from "@/lib/cache"
import { runBot } from "@/lib/bot-runner"

export const maxDuration = 60

type Params = { params: Promise<{ botId: string }> }

const bodySchema = z.object({
  /** Omit to run the strategy now; set to place a manual test trade with the bot's sizing + SL/TP. */
  side: z.enum(["buy", "sell"]).optional(),
})

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { botId } = await params

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return Response.json({ error: "Invalid side" }, { status: 422 })

  const owned = await prisma.botConfig.findFirst({ where: { id: botId, userId: session.user.id }, select: { id: true } })
  if (!owned) return Response.json({ error: "Not found" }, { status: 404 })

  const result = await runBot(botId, { forceSide: parsed.data.side })
  await invalidateTag(`bots:${session.user.id}`)
  return Response.json(result, { status: result.status === "error" ? 400 : 200 })
}
