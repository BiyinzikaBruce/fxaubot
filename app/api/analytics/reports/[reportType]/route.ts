import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { getCachedOrFetch } from "@/lib/cache"
import { format, startOfWeek, startOfMonth } from "date-fns"

type Params = { params: Promise<{ reportType: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession(req)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { reportType } = await params
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get("accountId")
  const period = searchParams.get("period") ?? "daily"

  const cacheKey = `analytics:report:${userId}:${reportType}:${accountId ?? "all"}:${period}`

  const baseWhere = {
    userId,
    exitAt: { not: null as null },
    netPnl: { not: null as null },
    ...(accountId ? { accountId } : {}),
  }

  const data = await getCachedOrFetch(
    cacheKey,
    async () => {
      switch (reportType) {
        case "symbol": {
          const rows = await prisma.trade.groupBy({
            by: ["symbol"],
            where: baseWhere,
            _count: true,
            _sum: { netPnl: true, grossPnl: true },
            _avg: { netPnl: true },
            orderBy: { _sum: { netPnl: "desc" } },
          })
          const winners = await prisma.trade.groupBy({
            by: ["symbol"],
            where: { ...baseWhere, netPnl: { gt: 0 } },
            _count: true,
          })
          const winMap = Object.fromEntries(winners.map((w) => [w.symbol, w._count]))
          return rows.map((r) => ({
            symbol: r.symbol,
            trades: r._count,
            netPnl: parseFloat((r._sum.netPnl ?? 0).toFixed(2)),
            avgPnl: parseFloat((r._avg.netPnl ?? 0).toFixed(2)),
            winRate: r._count > 0 ? parseFloat(((winMap[r.symbol] ?? 0) / r._count).toFixed(4)) : 0,
          }))
        }

        case "playbook": {
          const rows = await prisma.trade.groupBy({
            by: ["playbookId"],
            where: { ...baseWhere, playbookId: { not: null } },
            _count: true,
            _sum: { netPnl: true },
            _avg: { netPnl: true },
            orderBy: { _sum: { netPnl: "desc" } },
          })
          const playbookIds = rows.map((r) => r.playbookId).filter(Boolean) as string[]
          const playbooks = await prisma.playbook.findMany({
            where: { id: { in: playbookIds } },
            select: { id: true, name: true },
          })
          const pbMap = Object.fromEntries(playbooks.map((p) => [p.id, p.name]))
          const winners = await prisma.trade.groupBy({
            by: ["playbookId"],
            where: { ...baseWhere, playbookId: { not: null }, netPnl: { gt: 0 } },
            _count: true,
          })
          const winMap = Object.fromEntries(winners.map((w) => [w.playbookId, w._count]))
          return rows.map((r) => ({
            playbookId: r.playbookId,
            playbook: pbMap[r.playbookId!] ?? "Unknown",
            trades: r._count,
            netPnl: parseFloat((r._sum.netPnl ?? 0).toFixed(2)),
            avgPnl: parseFloat((r._avg.netPnl ?? 0).toFixed(2)),
            winRate: r._count > 0 ? parseFloat(((winMap[r.playbookId!] ?? 0) / r._count).toFixed(4)) : 0,
          }))
        }

        case "tags": {
          // Fetch all closed trades with tags
          const trades = await prisma.trade.findMany({
            where: { ...baseWhere, tags: { isEmpty: false } },
            select: { tags: true, netPnl: true },
          })
          const tagMap: Record<string, { trades: number; netPnl: number; wins: number }> = {}
          for (const t of trades) {
            for (const tag of t.tags) {
              tagMap[tag] ??= { trades: 0, netPnl: 0, wins: 0 }
              tagMap[tag].trades++
              tagMap[tag].netPnl += t.netPnl ?? 0
              if ((t.netPnl ?? 0) > 0) tagMap[tag].wins++
            }
          }
          return Object.entries(tagMap)
            .map(([tag, s]) => ({
              tag,
              trades: s.trades,
              netPnl: parseFloat(s.netPnl.toFixed(2)),
              winRate: s.trades > 0 ? parseFloat((s.wins / s.trades).toFixed(4)) : 0,
            }))
            .sort((a, b) => b.netPnl - a.netPnl)
        }

        case "time": {
          const trades = await prisma.trade.findMany({
            where: baseWhere,
            select: { exitAt: true, netPnl: true },
            orderBy: { exitAt: "asc" },
          })
          const buckets: Record<string, { pnl: number; trades: number; wins: number }> = {}
          for (const t of trades) {
            if (!t.exitAt) continue
            let key: string
            if (period === "weekly") key = format(startOfWeek(t.exitAt), "yyyy-'W'II")
            else if (period === "monthly") key = format(startOfMonth(t.exitAt), "yyyy-MM")
            else key = format(t.exitAt, "yyyy-MM-dd")
            buckets[key] ??= { pnl: 0, trades: 0, wins: 0 }
            buckets[key].pnl += t.netPnl ?? 0
            buckets[key].trades++
            if ((t.netPnl ?? 0) > 0) buckets[key].wins++
          }
          return Object.entries(buckets).map(([date, s]) => ({
            date,
            netPnl: parseFloat(s.pnl.toFixed(2)),
            trades: s.trades,
            winRate: s.trades > 0 ? parseFloat((s.wins / s.trades).toFixed(4)) : 0,
          }))
        }

        case "win-loss": {
          const [all, winners, losers] = await Promise.all([
            prisma.trade.aggregate({ where: baseWhere, _count: true, _sum: { netPnl: true }, _avg: { netPnl: true } }),
            prisma.trade.aggregate({
              where: { ...baseWhere, netPnl: { gt: 0 } },
              _count: true, _sum: { netPnl: true }, _avg: { netPnl: true },
              _max: { netPnl: true },
            }),
            prisma.trade.aggregate({
              where: { ...baseWhere, netPnl: { lte: 0 } },
              _count: true, _sum: { netPnl: true }, _avg: { netPnl: true },
              _min: { netPnl: true },
            }),
          ])
          const grossProfit = winners._sum.netPnl ?? 0
          const grossLoss = Math.abs(losers._sum.netPnl ?? 0)
          return {
            total: all._count,
            wins: winners._count,
            losses: losers._count,
            winRate: all._count > 0 ? parseFloat((winners._count / all._count).toFixed(4)) : 0,
            totalNetPnl: parseFloat((all._sum.netPnl ?? 0).toFixed(2)),
            grossProfit: parseFloat(grossProfit.toFixed(2)),
            grossLoss: parseFloat(grossLoss.toFixed(2)),
            profitFactor: grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : 999,
            avgWin: parseFloat((winners._avg.netPnl ?? 0).toFixed(2)),
            avgLoss: parseFloat((losers._avg.netPnl ?? 0).toFixed(2)),
            bestTrade: parseFloat((winners._max.netPnl ?? 0).toFixed(2)),
            worstTrade: parseFloat((losers._min.netPnl ?? 0).toFixed(2)),
            expectancy: all._count > 0 ? parseFloat(((all._sum.netPnl ?? 0) / all._count).toFixed(2)) : 0,
          }
        }

        case "risk": {
          const trades = await prisma.trade.findMany({
            where: { ...baseWhere, mae: { not: null }, mfe: { not: null } },
            select: { mae: true, mfe: true, netPnl: true, symbol: true },
            take: 500,
          })
          return trades.map((t) => ({
            mae: t.mae,
            mfe: t.mfe,
            netPnl: parseFloat((t.netPnl ?? 0).toFixed(2)),
            symbol: t.symbol,
            rr: t.mae && t.mae !== 0 ? parseFloat(((t.mfe ?? 0) / t.mae).toFixed(2)) : null,
          }))
        }

        default:
          return Response.json({ error: "Unknown report type" }, { status: 400 })
      }
    },
    180,
  )

  return Response.json(data)
}
