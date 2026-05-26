import { prisma } from "@/lib/db"

type TradeInput = {
  symbol: string
  side: "long" | "short"
  entryPrice: number
  quantity: number
  accountId: string
}

export async function fireCopyTrades(masterId: string, trade: TradeInput): Promise<void> {
  const groups = await prisma.copyTradeGroup.findMany({
    where: { masterId },
    include: { members: { where: { isActive: true } } },
  })

  for (const group of groups) {
    for (const member of group.members) {
      // Scale quantity by follower's allocation percentage
      const scaledQty = parseFloat((trade.quantity * (member.allocationPct / 100)).toFixed(6))
      if (scaledQty <= 0) continue

      // Find follower's default trading account
      const followerAccount = await prisma.tradingAccount.findFirst({
        where: { userId: member.followerId, isDefault: true },
      })
      if (!followerAccount) continue

      await prisma.trade.create({
        data: {
          userId: member.followerId,
          accountId: followerAccount.id,
          symbol: trade.symbol,
          side: trade.side,
          entryPrice: trade.entryPrice,
          quantity: scaledQty,
          fees: 0,
          entryAt: new Date(),
          isBotTrade: true,
          tags: ["copy-trade"],
        },
      })

      await prisma.notification.create({
        data: {
          userId: member.followerId,
          type: "copy_trade_fired",
          message: `Copy trade fired: ${trade.side.toUpperCase()} ${trade.symbol} at $${trade.entryPrice.toFixed(2)} (${member.allocationPct}% allocation)`,
        },
      })
    }
  }
}
