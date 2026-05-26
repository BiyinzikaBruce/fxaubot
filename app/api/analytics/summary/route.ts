import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { getCachedOrFetch } from "@/lib/cache"
import { format } from "date-fns"

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get("accountId")
  const cacheKey = `analytics:summary:${userId}:${accountId ?? "all"}`

  const summary = await getCachedOrFetch(
    cacheKey,
    async () => {
      const baseWhere = { userId, ...(accountId ? { accountId } : {}) }
      const closedWhere = { ...baseWhere, exitAt: { not: null }, netPnl: { not: null } }

      const [total, winners, losers, extremes, recentTrades, dailyRaw] = await Promise.all([
        prisma.trade.count({ where: closedWhere }),
        prisma.trade.aggregate({
          where: { ...closedWhere, netPnl: { gt: 0 } },
          _sum: { netPnl: true, grossPnl: true },
          _avg: { netPnl: true },
          _count: true,
        }),
        prisma.trade.aggregate({
          where: { ...closedWhere, netPnl: { lte: 0 } },
          _sum: { netPnl: true },
          _avg: { netPnl: true },
          _count: true,
        }),
        prisma.trade.findMany({
          where: closedWhere,
          orderBy: { netPnl: "desc" },
          take: 1,
          select: { netPnl: true, symbol: true },
        }).then(async (best) => {
          const worst = await prisma.trade.findMany({
            where: closedWhere,
            orderBy: { netPnl: "asc" },
            take: 1,
            select: { netPnl: true, symbol: true },
          })
          return { best: best[0] ?? null, worst: worst[0] ?? null }
        }),
        prisma.trade.findMany({
          where: closedWhere,
          orderBy: { exitAt: "desc" },
          take: 50,
          select: { netPnl: true },
        }),
        accountId
          ? prisma.$queryRaw<{ date: Date; pnl: number }[]>`
              SELECT DATE_TRUNC('day', "exitAt") as date, SUM("netPnl") as pnl
              FROM trades
              WHERE "userId" = ${userId} AND "accountId" = ${accountId}
                AND "exitAt" IS NOT NULL AND "netPnl" IS NOT NULL
              GROUP BY DATE_TRUNC('day', "exitAt") ORDER BY date ASC
            `
          : prisma.$queryRaw<{ date: Date; pnl: number }[]>`
              SELECT DATE_TRUNC('day', "exitAt") as date, SUM("netPnl") as pnl
              FROM trades
              WHERE "userId" = ${userId}
                AND "exitAt" IS NOT NULL AND "netPnl" IS NOT NULL
              GROUP BY DATE_TRUNC('day', "exitAt") ORDER BY date ASC
            `,
      ])

      const winCount = winners._count
      const lossCount = losers._count
      const grossProfit = winners._sum.netPnl ?? 0
      const grossLoss = Math.abs(losers._sum.netPnl ?? 0)
      const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 999 : 0

      // Current streak
      let streak = 0
      let streakType: "win" | "loss" = "win"
      for (const t of recentTrades) {
        const isWin = (t.netPnl ?? 0) > 0
        if (streak === 0) { streak = 1; streakType = isWin ? "win" : "loss" }
        else if ((streakType === "win") === isWin) streak++
        else break
      }

      // Equity curve with cumulative P&L
      let cumulative = 0
      const equityCurve = dailyRaw.map((row) => {
        cumulative += Number(row.pnl)
        return {
          date: format(new Date(row.date), "yyyy-MM-dd"),
          pnl: parseFloat(Number(row.pnl).toFixed(2)),
          cumulative: parseFloat(cumulative.toFixed(2)),
        }
      })

      return {
        totalTrades: total,
        winCount,
        lossCount,
        winRate: total > 0 ? parseFloat((winCount / total).toFixed(4)) : 0,
        totalNetPnl: parseFloat(((winners._sum.netPnl ?? 0) + (losers._sum.netPnl ?? 0)).toFixed(2)),
        grossProfit: parseFloat(grossProfit.toFixed(2)),
        grossLoss: parseFloat(grossLoss.toFixed(2)),
        profitFactor,
        avgWin: parseFloat((winners._avg.netPnl ?? 0).toFixed(2)),
        avgLoss: parseFloat((losers._avg.netPnl ?? 0).toFixed(2)),
        bestTrade: extremes.best,
        worstTrade: extremes.worst,
        streak,
        streakType,
        equityCurve,
      }
    },
    180,
  )

  return Response.json(summary)
}
