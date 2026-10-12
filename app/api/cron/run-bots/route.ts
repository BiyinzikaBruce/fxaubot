import { NextRequest } from "next/server"
import { runAllActiveBots } from "@/lib/bot-runner"

// MT5 runs open a MetaApi RPC connection per bot, which can take several seconds
export const maxDuration = 60
export const dynamic = "force-dynamic"

/**
 * Runs every active bot once. Call on a schedule with `Authorization: Bearer $CRON_SECRET`
 * (Vercel Cron sends this header automatically; external schedulers must set it).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 })
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = await runAllActiveBots()
  return Response.json({
    ranAt: new Date().toISOString(),
    total: results.length,
    traded: results.filter((r) => r.status === "traded").length,
    errors: results.filter((r) => r.status === "error").length,
    results,
  })
}
