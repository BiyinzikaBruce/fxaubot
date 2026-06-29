import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import { hashPassword } from "better-auth/crypto"
import { readFileSync } from "fs"
import { resolve } from "path"

// tsx doesn't auto-load .env.local
try {
  const content = readFileSync(resolve(".env.local"), "utf8")
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
} catch {}

// Node.js 21+ ships global WebSocket; required by Neon serverless driver
neonConfig.webSocketConstructor = WebSocket

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rf(min: number, max: number, dp = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dp))
}

function ri(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

function daysBack(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysAhead(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

// symbol → [basePrice, [qtyMin, qtyMax], pricePrecision]
const SYMBOL_DATA: Record<string, [number, [number, number], number]> = {
  "BTC/USDT": [72000, [0.001, 0.05], 2],
  "ETH/USDT": [3200, [0.05, 0.5], 2],
  "EUR/USD": [1.09, [1000, 50000], 5],
  "GBP/USD": [1.29, [1000, 50000], 5],
  "SOL/USDT": [145, [1, 50], 3],
  "BNB/USDT": [480, [0.5, 20], 2],
}
const SYMBOLS = Object.keys(SYMBOL_DATA)

const TAGS_POOL = [
  "breakout", "reversal", "trend", "scalp", "swing", "news",
  "support", "resistance", "momentum", "pullback", "fakeout",
  "continuation", "range", "divergence",
]

const NOTES_POOL = [
  "Clean breakout above daily high, volume confirmed",
  "RSI divergence on 4h, waited for confirmation",
  "Entered on retest of broken resistance",
  "Missed entry, chased — lesson learned",
  "Perfect textbook setup, executed the plan",
  "Took partial profits too early",
  "Held through drawdown, patience paid off",
  "Stopped out, market reversed immediately after",
  "Scalp on news spike, quick in and out",
  "Swing position from daily S/R zone",
  "Volume spike confirmed institutional interest",
  "Failed breakout — exited quickly, minimal loss",
]

function symbolPriceAndQty(symbol: string): [number, number] {
  const [base, [qMin, qMax], prec] = SYMBOL_DATA[symbol]
  const price = parseFloat((base * rf(0.92, 1.08, 8)).toFixed(prec))
  const qty = rf(qMin, qMax, 4)
  return [price, qty]
}

function makeTrade(
  accountId: string,
  userId: string,
  playbookIds: string[],
  dayOffset: number,
  winBias = 0.58,
) {
  const symbol = pick(SYMBOLS)
  const [entryPrice, quantity] = symbolPriceAndQty(symbol)
  const side = Math.random() > 0.5 ? "long" : "short"
  const isWin = Math.random() < winBias
  const pctMove = rf(0.003, 0.045)
  const prec = SYMBOL_DATA[symbol][2]
  const exitPrice = parseFloat(
    (
      side === "long"
        ? isWin
          ? entryPrice * (1 + pctMove)
          : entryPrice * (1 - pctMove * 0.6)
        : isWin
          ? entryPrice * (1 - pctMove)
          : entryPrice * (1 + pctMove * 0.6)
    ).toFixed(prec),
  )
  const grossPnl = parseFloat(
    ((exitPrice - entryPrice) * quantity * (side === "long" ? 1 : -1)).toFixed(2),
  )
  const fees = parseFloat((Math.abs(grossPnl) * 0.001).toFixed(2))
  const netPnl = parseFloat((grossPnl - fees).toFixed(2))
  const duration = ri(120, 259200)
  const entryAt = daysBack(dayOffset + ri(0, 3))
  const exitAt = new Date(entryAt.getTime() + duration * 1000)

  return {
    accountId,
    userId,
    symbol,
    side,
    entryPrice,
    exitPrice,
    quantity,
    grossPnl,
    netPnl,
    fees,
    mae: parseFloat((Math.abs(grossPnl) * rf(0.05, 0.5)).toFixed(2)),
    mfe: parseFloat((Math.abs(grossPnl) * rf(0.5, 2.0)).toFixed(2)),
    entryAt,
    exitAt,
    duration,
    tags: pickN(TAGS_POOL, ri(1, 3)),
    playbookId:
      Math.random() > 0.45 && playbookIds.length > 0
        ? pick(playbookIds)
        : null,
    notes: Math.random() > 0.65 ? pick(NOTES_POOL) : null,
    rating: Math.random() > 0.5 ? ri(1, 5) : null,
    isBotTrade: false,
    isReplay: false,
  }
}

function makeSignal(
  botConfigId: string,
  symbol: string,
  timeframe: string,
  dayOffset: number,
) {
  return {
    botConfigId,
    symbol,
    timeframe,
    signalType: pick(["buy", "sell", "neutral"] as const),
    indicatorValues: {
      rsi: rf(20, 80, 1),
      macd: rf(-0.005, 0.005, 6),
      signal: rf(-0.004, 0.004, 6),
      histogram: rf(-0.002, 0.002, 6),
      ema20: rf(0.98, 1.02, 4),
      ema50: rf(0.97, 1.03, 4),
      volume: ri(100_000, 5_000_000),
    },
    triggeredAt: daysBack(dayOffset + ri(0, 2)),
    acted: Math.random() > 0.3,
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding FXAU database...")

  // Clear in dependency order
  await prisma.notification.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.mentorInvite.deleteMany()
  await prisma.courseProgress.deleteMany()
  await prisma.botSignal.deleteMany()
  await prisma.trade.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.botConfig.deleteMany()
  await prisma.copyTradeMember.deleteMany()
  await prisma.copyTradeGroup.deleteMany()
  await prisma.backtestSession.deleteMany()
  await prisma.playbook.deleteMany()
  await prisma.exchangeConnection.deleteMany()
  await prisma.tradingAccount.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verification.deleteMany()
  await prisma.user.deleteMany()
  console.log("  ✓ Cleared existing data")

  // ─ Users ────────────────────────────────────────────────────────────────
  const pw = await hashPassword("Password123!")

  const userDefs = [
    { name: "Alice Chen",      email: "alice@fxau.io",    role: "admin",   plan: "ultimate" },
    { name: "Bob Smith",       email: "bob@fxau.io",      role: "admin",   plan: "ultimate" },
    { name: "Carol Rodriguez", email: "carol@fxau.io",    role: "mentor",  plan: "ultimate" },
    { name: "David Kim",       email: "david@fxau.io",    role: "mentor",  plan: "ultimate" },
    { name: "Emma Wilson",     email: "emma@fxau.io",     role: "trader",  plan: "pro"   },
    { name: "Frank Lee",       email: "frank@fxau.io",    role: "trader",  plan: "ultimate" },
    { name: "Grace Martinez",  email: "grace@fxau.io",    role: "trader",  plan: "pro"   },
    { name: "Henry Park",      email: "henry@fxau.io",    role: "trader",  plan: "none"    },
    { name: "Isabella Brown",  email: "isabella@fxau.io", role: "student", plan: "none"    },
    { name: "James Taylor",    email: "james@fxau.io",    role: "student", plan: "pro"   },
  ] as const

  const users: Awaited<ReturnType<typeof prisma.user.create>>[] = []
  for (const { name, email, role, plan } of userDefs) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: true,
        role: role as "admin" | "mentor" | "trader" | "student",
        plan: plan as "none" | "pro" | "ultimate" | "platinum",
        planBilling: plan !== "none" ? "monthly" : null,
        planExpiresAt: plan !== "none" ? daysAhead(ri(15, 90)) : null,
        passwordHash: pw,
      },
    })
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: pw,
      },
    })
    users.push(user)
  }

  const [alice, bob, carol, david, emma, frank, grace, henry, isabella, james] = users
  console.log("  ✓ Created 10 users + credential accounts")

  // ─ Trading accounts (3 per trader = 12) ─────────────────────────────────
  const traders = [emma, frank, grace, henry]
  await prisma.tradingAccount.createMany({
    data: traders.flatMap((t) => [
      { userId: t.id, name: `${t.name.split(" ")[0]}'s Binance`, exchange: "binance", balance: rf(8000, 50000), currency: "USDT", isDefault: true },
      { userId: t.id, name: `${t.name.split(" ")[0]}'s Bybit`,   exchange: "bybit",   balance: rf(3000, 20000), currency: "USDT", isDefault: false },
      { userId: t.id, name: `${t.name.split(" ")[0]}'s Manual`,  exchange: "manual",  balance: rf(500, 8000),   currency: "USDT", isDefault: false },
    ]),
  })

  const tradingAccounts = await prisma.tradingAccount.findMany({
    where: { userId: { in: traders.map((t) => t.id) } },
    orderBy: [{ userId: "asc" }, { isDefault: "desc" }],
  })
  const acctsByUser: Record<string, string[]> = {}
  for (const a of tradingAccounts) {
    acctsByUser[a.userId] ??= []
    acctsByUser[a.userId].push(a.id)
  }
  console.log("  ✓ Created 12 trading accounts")

  // ─ Exchange connections ──────────────────────────────────────────────────
  await prisma.exchangeConnection.createMany({
    data: [
      { userId: emma.id,  exchange: "binance", apiKey: "enc_emma_binance_key",  apiSecret: "enc_emma_binance_secret",  permissions: ["read", "trade"] },
      { userId: frank.id, exchange: "binance", apiKey: "enc_frank_binance_key", apiSecret: "enc_frank_binance_secret", permissions: ["read", "trade", "withdraw"] },
      { userId: frank.id, exchange: "bybit",   apiKey: "enc_frank_bybit_key",   apiSecret: "enc_frank_bybit_secret",   permissions: ["read", "trade"] },
      { userId: grace.id, exchange: "binance", apiKey: "enc_grace_binance_key", apiSecret: "enc_grace_binance_secret", permissions: ["read", "trade"] },
      { userId: henry.id, exchange: "binance", apiKey: "enc_henry_binance_key", apiSecret: "enc_henry_binance_secret", permissions: ["read"] },
    ],
  })
  console.log("  ✓ Created exchange connections")

  // ─ Playbooks (8) ────────────────────────────────────────────────────────
  await prisma.playbook.createMany({
    data: [
      {
        userId: carol.id,
        name: "Breakout Scalp",
        description: "High-momentum breakout trades on crypto pairs with volume confirmation",
        rules: ["Wait for close above key resistance", "Volume must be 1.5x average", "Enter on first pullback to broken level", "Stop below breakout candle low", "Target 2R minimum"],
        setupCriteria: "Price consolidation for at least 6 candles below resistance",
        entryConditions: "Breakout candle + volume spike + pullback entry",
        exitConditions: "2R target hit or price closes back below broken level",
        riskParams: { maxRiskPct: 1, stopMultiplier: 1, tpMultiplier: 2 },
        isShared: true,
      },
      {
        userId: carol.id,
        name: "Trend Following EMA",
        description: "Ride established trends using EMA 20/50/200 ribbon structure",
        rules: ["All EMAs aligned (20 > 50 > 200 for longs)", "Enter on 20 EMA retest only", "No counter-trend trades", "Trail stop using 20 EMA", "Minimum 10-candle trend before entry"],
        setupCriteria: "Strong trending market with EMA ribbon spread",
        entryConditions: "Price pulls back to 20 EMA with bullish rejection candle",
        exitConditions: "Trail stop hit on 20 EMA close below",
        riskParams: { maxRiskPct: 1.5, stopMultiplier: 1, tpMultiplier: 0 },
        isShared: true,
      },
      {
        userId: david.id,
        name: "Mean Reversion",
        description: "Fade extended moves using Bollinger Bands and RSI extremes",
        rules: ["RSI above 75 or below 25", "Price must touch outer Bollinger Band", "Wait for reversal candle confirmation", "Target middle Bollinger Band", "Hard stop at 1.5x band width"],
        setupCriteria: "RSI extreme + Bollinger Band touch on 1h or 4h",
        entryConditions: "Engulfing or pin bar candle at extreme",
        exitConditions: "Middle band touch or trailing stop",
        riskParams: { maxRiskPct: 0.75, stopMultiplier: 1.5, tpMultiplier: 2.5 },
        isShared: true,
      },
      {
        userId: david.id,
        name: "RSI Divergence",
        description: "Trade hidden and regular divergence between price and RSI",
        rules: ["Regular or hidden divergence on RSI 14", "Confirm on 2 timeframes", "Enter on close of divergence candle", "Stop beyond divergence high/low", "Target previous swing point"],
        setupCriteria: "Clear divergence with at least 3 swing points",
        entryConditions: "Confirmation candle closes with volume",
        exitConditions: "Previous major swing level or 3R target",
        riskParams: { maxRiskPct: 1, stopMultiplier: 1, tpMultiplier: 3 },
        isShared: false,
      },
      {
        userId: emma.id,
        name: "MACD Cross Strategy",
        description: "Trade MACD signal line crossovers with EMA 200 trend filter",
        rules: ["MACD must cross signal line", "Price above 200 EMA for longs only", "Histogram increasing after cross", "Enter at market on next candle open", "Stop 1 ATR below entry"],
        setupCriteria: "MACD cross in direction of 200 EMA trend",
        entryConditions: "MACD signal cross + trend alignment",
        exitConditions: "Opposite MACD cross or 2R target",
        riskParams: { maxRiskPct: 1, stopMultiplier: 1, tpMultiplier: 2 },
        isShared: false,
      },
      {
        userId: frank.id,
        name: "S/R Bounce",
        description: "Trade bounces from major support and resistance levels",
        rules: ["Level tested at least 3 times", "Look for rejection wicks", "Enter limit order at level", "Stop 0.3% beyond level", "Target next major S/R"],
        setupCriteria: "Price approaching well-tested S/R level",
        entryConditions: "Rejection wick or engulfing candle at level",
        exitConditions: "Next S/R level or 2.5R",
        riskParams: { maxRiskPct: 1.25, stopMultiplier: 1, tpMultiplier: 2.5 },
        isShared: true,
      },
      {
        userId: grace.id,
        name: "EMA Ribbon Trade",
        description: "Multiple EMA ribbon breakout and continuation strategy",
        rules: ["Use 8, 13, 21, 34, 55 EMA ribbon", "Trade ribbon expansion only", "Entry when price breaks above all EMAs", "Wider stop during expansion", "Scale out at Fibonacci levels"],
        setupCriteria: "Ribbon compressed for 5+ candles then expansion begins",
        entryConditions: "Price breaks and closes above 55 EMA",
        exitConditions: "Scale out 50% at 1.5R, trail rest",
        riskParams: { maxRiskPct: 1, stopMultiplier: 1.5, tpMultiplier: 3 },
        isShared: false,
      },
      {
        userId: henry.id,
        name: "Volume Spike Entry",
        description: "Enter on abnormal volume spikes signaling institutional activity",
        rules: ["Volume must be 3x the 20-period average", "Price action must confirm direction", "Enter within 2 candles of spike", "Stop at spike candle midpoint", "Partial target at 1R, trail rest"],
        setupCriteria: "Volume spike with directional price move",
        entryConditions: "High-volume candle + confirmation close",
        exitConditions: "Partial at 1R, trail with 3-candle low",
        riskParams: { maxRiskPct: 0.75, stopMultiplier: 0.5, tpMultiplier: 2 },
        isShared: false,
      },
    ],
  })

  const playbooks = await prisma.playbook.findMany({ orderBy: { createdAt: "asc" } })
  const playbookIds = playbooks.map((p) => p.id)
  console.log("  ✓ Created 8 playbooks")

  // ─ Trades (220+) ────────────────────────────────────────────────────────
  const tradeBatches = [
    { user: emma,  winBias: 0.55, count: 60 },
    { user: frank, winBias: 0.62, count: 65 },
    { user: grace, winBias: 0.53, count: 50 },
    { user: henry, winBias: 0.48, count: 45 },
  ].flatMap(({ user, winBias, count }) => {
    const accts = acctsByUser[user.id] ?? []
    return Array.from({ length: count }, (_, i) =>
      makeTrade(accts[i % accts.length], user.id, playbookIds, ri(1, 180), winBias),
    )
  })

  await prisma.trade.createMany({ data: tradeBatches as any })
  console.log(`  ✓ Created ${tradeBatches.length} trades`)

  // ─ Bot configs (5) ──────────────────────────────────────────────────────
  await prisma.botConfig.createMany({
    data: [
      { userId: emma.id,  accountId: acctsByUser[emma.id][0],  name: "Emma MACD BTC 1H",    exchange: "binance", symbol: "BTC/USDT", timeframe: "1h",  strategy: { type: "macd",       fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, trendFilter: "ema200" }, positionSizePct: 1.5, stopLossPct: 2,   takeProfitPct: 4, isActive: true  },
      { userId: frank.id, accountId: acctsByUser[frank.id][0], name: "Frank RSI ETH 15M",   exchange: "binance", symbol: "ETH/USDT", timeframe: "15m", strategy: { type: "rsi",        period: 14, overbought: 70, oversold: 30, confirmEma: 50 },               positionSizePct: 2,   stopLossPct: 1.5, takeProfitPct: 3, isActive: true  },
      { userId: frank.id, accountId: acctsByUser[frank.id][1], name: "Frank BB BTC 4H",     exchange: "bybit",   symbol: "BTC/USDT", timeframe: "4h",  strategy: { type: "bollinger",  period: 20, stdDev: 2, squeeze: true, momentumConfirm: true },           positionSizePct: 1,   stopLossPct: 3,   takeProfitPct: 6, isActive: true  },
      { userId: grace.id, accountId: acctsByUser[grace.id][0], name: "Grace EMA SOL 1H",   exchange: "binance", symbol: "SOL/USDT", timeframe: "1h",  strategy: { type: "ema_cross",  fastEma: 20, slowEma: 50, ribbonEmas: [8, 13, 21, 34, 55] },             positionSizePct: 1.5, stopLossPct: 2.5, takeProfitPct: 5, isActive: false },
      { userId: henry.id, accountId: acctsByUser[henry.id][0], name: "Henry VWAP BNB 30M", exchange: "binance", symbol: "BNB/USDT", timeframe: "30m", strategy: { type: "vwap",       volumeMultiplier: 3, confirmCandles: 2, partialTp: true },               positionSizePct: 1,   stopLossPct: 1.5, takeProfitPct: 3, isActive: false },
    ],
  })

  const botConfigs = await prisma.botConfig.findMany({ orderBy: { createdAt: "asc" } })
  console.log("  ✓ Created 5 bot configs")

  // ─ Bot signals (55 per bot = 275 total) ─────────────────────────────────
  const signalBatches = botConfigs.flatMap((bot) =>
    Array.from({ length: 55 }, () =>
      makeSignal(bot.id, bot.symbol, bot.timeframe, ri(1, 90)),
    ),
  )
  await prisma.botSignal.createMany({ data: signalBatches as any })
  console.log(`  ✓ Created ${signalBatches.length} bot signals`)

  // ─ Copy trade groups (2 groups, 3 followers each) ───────────────────────
  await prisma.copyTradeGroup.create({
    data: {
      masterId: frank.id,
      name: "Frank's Premium Signals",
      isPublic: true,
      maxFollowers: 20,
      members: {
        create: [
          { followerId: emma.id,  allocationPct: 10, isActive: true },
          { followerId: grace.id, allocationPct: 15, isActive: true },
          { followerId: henry.id, allocationPct: 8,  isActive: true },
        ],
      },
    },
  })
  await prisma.copyTradeGroup.create({
    data: {
      masterId: carol.id,
      name: "Mentor Copy Group",
      isPublic: false,
      maxFollowers: 10,
      members: {
        create: [
          { followerId: emma.id,     allocationPct: 5, isActive: true },
          { followerId: isabella.id, allocationPct: 3, isActive: true },
          { followerId: james.id,    allocationPct: 5, isActive: false },
        ],
      },
    },
  })
  console.log("  ✓ Created 2 copy trade groups with 3 followers each")

  // ─ Backtest sessions (10) ────────────────────────────────────────────────
  await prisma.backtestSession.createMany({
    data: [
      { userId: emma.id,  name: "MACD BTC 2024 Q4",           exchange: "binance", symbol: "BTC/USDT", timeframe: "1h",  startDate: new Date("2024-10-01"), endDate: new Date("2024-12-31"), strategyConfig: { type: "macd",          fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },   results: { totalTrades: 87,  winRate: 0.61, profitFactor: 1.74, netPnl: 3820.50, maxDrawdown: 0.09, sharpeRatio: 1.38 } },
      { userId: emma.id,  name: "MACD ETH 2025 Q1",           exchange: "binance", symbol: "ETH/USDT", timeframe: "4h",  startDate: new Date("2025-01-01"), endDate: new Date("2025-03-31"), strategyConfig: { type: "macd",          fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },   results: { totalTrades: 42,  winRate: 0.57, profitFactor: 1.45, netPnl: 1250.00, maxDrawdown: 0.14, sharpeRatio: 1.12 } },
      { userId: frank.id, name: "RSI Extreme BTC 2024",        exchange: "binance", symbol: "BTC/USDT", timeframe: "15m", startDate: new Date("2024-06-01"), endDate: new Date("2024-12-31"), strategyConfig: { type: "rsi",           period: 14, overbought: 75, oversold: 25 },          results: { totalTrades: 234, winRate: 0.53, profitFactor: 1.38, netPnl: 6742.00, maxDrawdown: 0.18, sharpeRatio: 1.05 } },
      { userId: frank.id, name: "BB Squeeze ETH 2025 Q1",      exchange: "bybit",   symbol: "ETH/USDT", timeframe: "4h",  startDate: new Date("2025-01-01"), endDate: new Date("2025-04-30"), strategyConfig: { type: "bollinger",     period: 20, stdDev: 2 },                           results: { totalTrades: 31,  winRate: 0.68, profitFactor: 2.10, netPnl: 5430.00, maxDrawdown: 0.07, sharpeRatio: 1.89 } },
      { userId: grace.id, name: "EMA Ribbon SOL 2024 H2",      exchange: "binance", symbol: "SOL/USDT", timeframe: "1h",  startDate: new Date("2024-07-01"), endDate: new Date("2024-12-31"), strategyConfig: { type: "ema_cross",     fastEma: 20, slowEma: 50 },                        results: { totalTrades: 118, winRate: 0.59, profitFactor: 1.62, netPnl: 2910.00, maxDrawdown: 0.11, sharpeRatio: 1.24 } },
      { userId: grace.id, name: "EMA Ribbon BNB 2025 Q1",      exchange: "binance", symbol: "BNB/USDT", timeframe: "30m", startDate: new Date("2025-01-01"), endDate: new Date("2025-03-31"), strategyConfig: { type: "ema_cross",     fastEma: 8, slowEma: 21 },                         results: { totalTrades: 167, winRate: 0.51, profitFactor: 1.18, netPnl: 890.00,  maxDrawdown: 0.16, sharpeRatio: 0.88 } },
      { userId: henry.id, name: "VWAP BNB Full Year 2024",     exchange: "binance", symbol: "BNB/USDT", timeframe: "30m", startDate: new Date("2024-01-01"), endDate: new Date("2024-12-31"), strategyConfig: { type: "vwap",          volumeMultiplier: 3, confirmCandles: 2 },           results: { totalTrades: 203, winRate: 0.48, profitFactor: 1.09, netPnl: 420.00,  maxDrawdown: 0.22, sharpeRatio: 0.71 } },
      { userId: carol.id, name: "Breakout BTC 2024 Full Year", exchange: "binance", symbol: "BTC/USDT", timeframe: "4h",  startDate: new Date("2024-01-01"), endDate: new Date("2024-12-31"), strategyConfig: { type: "breakout",      lookback: 20, volumeFilter: 1.5 },                  results: { totalTrades: 64,  winRate: 0.65, profitFactor: 2.40, netPnl: 12800.00,maxDrawdown: 0.08, sharpeRatio: 2.15 } },
      { userId: david.id, name: "RSI Divergence ETH 2025",     exchange: "binance", symbol: "ETH/USDT", timeframe: "4h",  startDate: new Date("2025-01-01"), endDate: new Date("2025-05-01"), strategyConfig: { type: "rsi_divergence", rsiPeriod: 14, swingLookback: 5 },               results: { totalTrades: 28,  winRate: 0.71, profitFactor: 2.80, netPnl: 7340.00, maxDrawdown: 0.05, sharpeRatio: 2.42 } },
      { userId: david.id, name: "Mean Reversion GBP/USD 2024", exchange: "manual",  symbol: "GBP/USD",  timeframe: "1h",  startDate: new Date("2024-01-01"), endDate: new Date("2024-12-31"), strategyConfig: { type: "mean_reversion", bbPeriod: 20, rsiPeriod: 14 },                    results: { totalTrades: 145, winRate: 0.63, profitFactor: 1.91, netPnl: 9210.00, maxDrawdown: 0.10, sharpeRatio: 1.67 } },
    ],
  })
  console.log("  ✓ Created 10 backtest sessions")

  // ─ Courses + Lessons (3 courses, 5 lessons each) ────────────────────────
  const courseDefs = [
    {
      authorId: carol.id,
      title: "Crypto Trading Fundamentals",
      description: "Master the essential concepts of cryptocurrency trading from market structure to risk management.",
      isPublished: true,
      order: 1,
      lessons: [
        { title: "Market Structure & Trends",      content: "Understanding how markets move in trends, ranges, and reversals. Identifying higher highs, higher lows, and key structural levels.", order: 1 },
        { title: "Reading Candlestick Patterns",   content: "The most important candlestick patterns for crypto traders: pin bars, engulfing patterns, inside bars, and doji candles.", order: 2 },
        { title: "Support & Resistance Zones",     content: "How to identify and draw key S/R levels. Difference between horizontal levels and dynamic support/resistance.", order: 3 },
        { title: "Risk Management Fundamentals",   content: "Position sizing, stop placement, reward-to-risk ratios. Why 1% risk per trade is the foundation of longevity.", order: 4 },
        { title: "Building Your Trading Plan",     content: "Creating a repeatable trading process: pre-market routine, trade checklists, journaling, and performance review.", order: 5 },
      ],
    },
    {
      authorId: david.id,
      title: "Advanced Price Action",
      description: "Deep dive into institutional price action, order flow, and advanced pattern recognition.",
      isPublished: true,
      order: 2,
      lessons: [
        { title: "Institutional Order Flow",       content: "How large institutions enter and exit positions. Smart money concepts: accumulation, manipulation, distribution.", order: 1 },
        { title: "Fair Value Gaps & Imbalances",   content: "Identifying and trading fair value gaps (FVGs), order blocks, and price imbalances left by institutional activity.", order: 2 },
        { title: "Liquidity Hunting",              content: "Understanding how price targets liquidity pools above swing highs and below swing lows before reversing.", order: 3 },
        { title: "Multi-Timeframe Analysis",       content: "Top-down analysis from weekly to 15-minute. Aligning trade direction across timeframes for high-probability entries.", order: 4 },
        { title: "Advanced Entry Techniques",      content: "Optimal entry points using lower timeframe precision after higher timeframe confirmation. The art of the entry.", order: 5 },
      ],
    },
    {
      authorId: carol.id,
      title: "Bot Automation Mastery",
      description: "Learn to automate your trading strategies using FXAU's bot system without any programming experience.",
      isPublished: true,
      order: 3,
      lessons: [
        { title: "Introduction to Trading Bots",   content: "What trading bots can and cannot do. Realistic expectations and common pitfalls of automated trading.", order: 1 },
        { title: "Setting Up Your First Bot",      content: "Step-by-step guide to creating a bot config in FXAU: choosing exchange, symbol, timeframe, and strategy parameters.", order: 2 },
        { title: "Backtesting Strategies",         content: "How to use FXAU's backtester to validate your strategy before risking real capital. Interpreting backtest results.", order: 3 },
        { title: "Risk Parameters & Sizing",       content: "Configuring stop loss, take profit, and position size percentages. The math behind bot risk management.", order: 4 },
        { title: "Monitoring & Optimizing",        content: "Reading bot signals, win rate analysis, and when to pause or modify your bot strategy.", order: 5 },
      ],
    },
  ]

  for (const { lessons, ...courseData } of courseDefs) {
    await prisma.course.create({ data: { ...courseData, lessons: { create: lessons } } })
  }

  const courses = await prisma.course.findMany({ orderBy: { order: "asc" } })
  const allLessons = await prisma.lesson.findMany({ orderBy: [{ courseId: "asc" }, { order: "asc" }] })
  const lessonsByCourse: Record<string, string[]> = {}
  for (const l of allLessons) {
    lessonsByCourse[l.courseId] ??= []
    lessonsByCourse[l.courseId].push(l.id)
  }
  console.log("  ✓ Created 3 courses with 5 lessons each")

  // ─ Course progress ───────────────────────────────────────────────────────
  const progressRows: {
    userId: string; courseId: string; completedLessons: string[]; completedAt: Date | null
  }[] = []

  for (const user of [emma, frank, grace, henry, isabella, james]) {
    for (const course of courses) {
      const cLessons = lessonsByCourse[course.id] ?? []
      const n = ri(0, cLessons.length)
      const completedLessons = cLessons.slice(0, n)
      progressRows.push({
        userId: user.id,
        courseId: course.id,
        completedLessons,
        completedAt: n === cLessons.length ? daysBack(ri(1, 30)) : null,
      })
    }
  }
  await prisma.courseProgress.createMany({ data: progressRows })
  console.log("  ✓ Created course progress records")

  // ─ Mentor invites (6) ───────────────────────────────────────────────────
  await prisma.mentorInvite.createMany({
    data: [
      { traderId: emma.id,  mentorId: carol.id,  status: "active"  },
      { traderId: emma.id,  mentorId: david.id,  status: "revoked" },
      { traderId: frank.id, mentorId: carol.id,  status: "active"  },
      { traderId: grace.id, mentorId: david.id,  status: "active"  },
      { traderId: henry.id, mentorId: carol.id,  status: "pending" },
      { traderId: henry.id, mentorId: david.id,  status: "pending" },
    ],
  })
  console.log("  ✓ Created 6 mentor invites")

  // ─ Subscriptions (20) ───────────────────────────────────────────────────
  const tx = (i: number) => `0x${"a1b2c3d4e5f6".repeat(5)}${i.toString(16).padStart(2, "0")}`

  await prisma.subscription.createMany({
    data: [
      { userId: emma.id,     plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(0),  status: "active",   verifiedAt: daysBack(25),  expiresAt: daysAhead(5)   },
      { userId: emma.id,     plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(1),  status: "expired",  verifiedAt: daysBack(60),  expiresAt: daysBack(30)   },
      { userId: emma.id,     plan: "ultimate", billing: "monthly", amountUSDT: 99.99,  network: "erc20", txHash: tx(2),  status: "rejected", verifiedAt: null,          expiresAt: null           },
      { userId: frank.id,    plan: "ultimate", billing: "yearly",  amountUSDT: 959.99, network: "erc20", txHash: tx(3),  status: "active",   verifiedAt: daysBack(90),  expiresAt: daysAhead(275) },
      { userId: frank.id,    plan: "ultimate", billing: "monthly", amountUSDT: 99.99,  network: "trc20", txHash: tx(4),  status: "expired",  verifiedAt: daysBack(180), expiresAt: daysBack(150)  },
      { userId: frank.id,    plan: "ultimate", billing: "yearly",  amountUSDT: 959.99, network: "trc20", txHash: tx(5),  status: "pending",  verifiedAt: null,          expiresAt: null           },
      { userId: grace.id,    plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(6),  status: "active",   verifiedAt: daysBack(10),  expiresAt: daysAhead(20)  },
      { userId: grace.id,    plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(7),  status: "expired",  verifiedAt: daysBack(210), expiresAt: daysBack(180)  },
      { userId: grace.id,    plan: "ultimate", billing: "monthly", amountUSDT: 99.99,  network: "erc20", txHash: tx(8),  status: "pending",  verifiedAt: null,          expiresAt: null           },
      { userId: henry.id,    plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(9),  status: "pending",  verifiedAt: null,          expiresAt: null           },
      { userId: henry.id,    plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(10), status: "expired",  verifiedAt: daysBack(95),  expiresAt: daysBack(65)   },
      { userId: henry.id,    plan: "ultimate", billing: "monthly", amountUSDT: 99.99,  network: "erc20", txHash: tx(11), status: "rejected", verifiedAt: null,          expiresAt: null           },
      { userId: isabella.id, plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(12), status: "pending",  verifiedAt: null,          expiresAt: null           },
      { userId: isabella.id, plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(13), status: "expired",  verifiedAt: daysBack(45),  expiresAt: daysBack(15)   },
      { userId: james.id,    plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "erc20", txHash: tx(14), status: "active",   verifiedAt: daysBack(5),   expiresAt: daysAhead(25)  },
      { userId: james.id,    plan: "pro",      billing: "monthly", amountUSDT: 49.99,  network: "trc20", txHash: tx(15), status: "expired",  verifiedAt: daysBack(65),  expiresAt: daysBack(35)   },
      { userId: carol.id,    plan: "ultimate", billing: "yearly",  amountUSDT: 959.99, network: "erc20", txHash: tx(16), status: "active",   verifiedAt: daysBack(120), expiresAt: daysAhead(245) },
      { userId: david.id,    plan: "ultimate", billing: "yearly",  amountUSDT: 959.99, network: "trc20", txHash: tx(17), status: "active",   verifiedAt: daysBack(200), expiresAt: daysAhead(165) },
      { userId: alice.id,    plan: "ultimate", billing: "yearly",  amountUSDT: 959.99, network: "erc20", txHash: tx(18), status: "active",   verifiedAt: daysBack(150), expiresAt: daysAhead(215) },
      { userId: bob.id,      plan: "ultimate", billing: "yearly",  amountUSDT: 959.99, network: "trc20", txHash: tx(19), status: "active",   verifiedAt: daysBack(100), expiresAt: daysAhead(265) },
    ],
  })
  console.log("  ✓ Created 20 subscriptions")

  // ─ Notifications (30) ───────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      // Emma (5)
      { userId: emma.id,     type: "bot_trade",               message: "Your MACD bot opened BTC/USDT long at $72,450",                                                 isRead: true  },
      { userId: emma.id,     type: "bot_trade",               message: "Your MACD bot closed BTC/USDT long at $74,820 — net +$234.80",                                  isRead: true  },
      { userId: emma.id,     type: "copy_trade_fired",        message: "Frank Lee opened ETH/USDT long — copy trade executed at $3,210",                                isRead: false },
      { userId: emma.id,     type: "subscription_expiring",   message: "Your Basic plan expires in 5 days. Renew to keep access.",                                      isRead: false },
      { userId: emma.id,     type: "mentor_feedback",         message: "Carol Rodriguez reviewed your BTC trade: \"Good entry, but hold your winners longer.\"",        isRead: true  },
      // Frank (4)
      { userId: frank.id,    type: "signal_triggered",        message: "RSI bot: ETH/USDT oversold signal on 15m (RSI 28.4)",                                          isRead: true  },
      { userId: frank.id,    type: "bot_trade",               message: "RSI bot opened ETH/USDT long at $3,145",                                                        isRead: true  },
      { userId: frank.id,    type: "bot_trade",               message: "BB bot opened BTC/USDT long at $71,200 — Bollinger squeeze breakout",                           isRead: false },
      { userId: frank.id,    type: "subscription_activated",  message: "Your Premium Yearly plan is now active. Expires in 365 days.",                                  isRead: true  },
      // Grace (4)
      { userId: grace.id,    type: "copy_trade_fired",        message: "Frank Lee opened SOL/USDT short — copy trade executed",                                         isRead: false },
      { userId: grace.id,    type: "signal_triggered",        message: "EMA bot: SOL/USDT crossover detected on 1h",                                                   isRead: true  },
      { userId: grace.id,    type: "subscription_expiring",   message: "Your Basic plan expires in 20 days.",                                                           isRead: true  },
      { userId: grace.id,    type: "mentor_feedback",         message: "David Kim left feedback on your EUR/USD trade journal",                                         isRead: false },
      // Henry (3)
      { userId: henry.id,    type: "signal_triggered",        message: "VWAP bot: BNB/USDT volume spike detected — 3.4x average",                                      isRead: false },
      { userId: henry.id,    type: "subscription_activated",  message: "Basic plan payment submitted — pending admin verification.",                                    isRead: true  },
      { userId: henry.id,    type: "bot_trade",               message: "VWAP bot paused — active subscription required for automation.",                                isRead: false },
      // Isabella (3)
      { userId: isabella.id, type: "subscription_activated",  message: "Welcome to FXAU! Your Basic plan payment is being verified.",                                   isRead: false },
      { userId: isabella.id, type: "copy_trade_fired",        message: "Carol Rodriguez opened BTC/USDT long — copy tracked (learn mode)",                             isRead: true  },
      { userId: isabella.id, type: "subscription_expiring",   message: "Your trial period ended. Upgrade to continue using premium features.",                         isRead: false },
      // James (3)
      { userId: james.id,    type: "subscription_activated",  message: "Your Basic plan is now active. Welcome to FXAU!",                                               isRead: true  },
      { userId: james.id,    type: "copy_trade_fired",        message: "Carol Rodriguez opened ETH/USDT short — copy tracked (learn mode)",                            isRead: true  },
      { userId: james.id,    type: "mentor_feedback",         message: "You completed 'Crypto Trading Fundamentals'. Well done!",                                       isRead: false },
      // Carol (3)
      { userId: carol.id,    type: "mentor_feedback",         message: "Emma Wilson requested mentorship review of 3 trades",                                           isRead: false },
      { userId: carol.id,    type: "mentor_feedback",         message: "Frank Lee requested review of weekly performance",                                              isRead: true  },
      { userId: carol.id,    type: "subscription_activated",  message: "Your Premium Yearly plan renewed successfully.",                                                 isRead: true  },
      // David (2)
      { userId: david.id,    type: "mentor_feedback",         message: "Grace Martinez submitted her weekly trade journal for review",                                  isRead: false },
      { userId: david.id,    type: "signal_triggered",        message: "RSI Divergence signal on ETH/USDT 4h — bullish hidden divergence",                             isRead: true  },
      // Alice (2)
      { userId: alice.id,    type: "subscription_activated",  message: "New pending subscription: Henry Park — Basic Monthly (29 USDT)",                               isRead: false },
      { userId: alice.id,    type: "subscription_activated",  message: "New pending subscription: Isabella Brown — Basic Monthly (29 USDT)",                           isRead: false },
      // Bob (1)
      { userId: bob.id,      type: "subscription_activated",  message: "Payment rejected: Emma Wilson — Premium Monthly (tx hash mismatch)",                           isRead: true  },
    ],
  })
  console.log("  ✓ Created 30 notifications")

  console.log("\n✅ FXAU database seeded successfully!")
  console.log("   Admins:   alice@fxau.io  |  bob@fxau.io")
  console.log("   Mentors:  carol@fxau.io  |  david@fxau.io")
  console.log("   Traders:  emma@fxau.io   |  frank@fxau.io  |  grace@fxau.io  |  henry@fxau.io")
  console.log("   Students: isabella@fxau.io  |  james@fxau.io")
  console.log("   Password for all accounts: Password123!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
