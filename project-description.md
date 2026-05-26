# FXAU — Project Description

## What This App Does
FXAU is a full-stack public SaaS trading platform built for crypto and forex traders. It combines automated trade journaling, deep performance analytics, multi-exchange bot trading (signals, auto-trading, and copy trading), backtesting, playbook strategy management, and a structured education hub — all in one institutional-grade platform. It solves the problem of traders needing 5+ separate tools by delivering everything in a single, beautifully designed product.

## Target Users
- **Primary user:** Crypto and forex traders (beginner to advanced) who want to journal their trades, automate strategies via bots, and systematically improve their performance
- **Secondary users:** Mentors who coach students through shared journal access; Students enrolled in FXAU courses; Admins who manage the platform, users, subscriptions, and bot activity

## Core Value Proposition
FXAU is the only trading platform that combines professional-grade journaling, multi-exchange bot automation, copy trading, and structured education in one place — purpose-built for serious crypto and forex traders.

## User Roles & Permissions
- **Admin:** Full platform access — manage all users, activate/reject USDT subscriptions, monitor bot activity, upload education content, view platform-wide analytics, manage wallet addresses
- **Mentor:** Access assigned student journals/stats (with permission), upload course content, view mentee performance dashboards, send feedback
- **Trader (Premium):** Full access — trade journal, all analytics reports, signal bot, auto-trading bot, copy trading (as master or follower), backtesting, all playbooks, trade replay, education hub
- **Trader (Basic):** Trade journal, limited analytics, signal bot (view only), backtesting, up to 3 playbooks, trade replay, 5 mentor invites, 1 trading account
- **Student:** Access education hub (courses, lessons, webinars), limited journal access, can upgrade to Trader plan

## Features — Complete List

1. **Trade Journal** — Log trades manually or import via exchange CSV/API. Each trade records: symbol, side (long/short), entry/exit price, position size, P&L (gross + net), fees, MAE/MFE, running P&L chart, tags, notes, chart screenshot attachments, playbook assignment, trade rating
2. **Analytics Dashboard** — Customizable KPI dashboard with stat cards: total P&L, win rate, average R, profit factor, best/worst trade, streak. Dark/light toggle
3. **Advanced Reports (30+)** — Date/time reports (by day, week, month, hour, session), symbol reports, side reports (long vs short), risk reports (R-multiple, position size), tag/mistake reports, playbook performance reports, win vs loss comparison, custom category reports
4. **Global Filter** — Filter any report or trade list by date range, symbol, side, tag, playbook, account, or any combination
5. **Signal Bot** — Built-in technical indicator signals (RSI, EMA crossover, MACD, Bollinger Bands, ATR). Users configure indicator parameters and receive buy/sell/neutral alerts per symbol and timeframe. Basic users view signals; Premium users act on them via auto-bot
6. **Auto-Trading Bot** — Connect Binance, Bybit, OKX, or Coinbase via API keys (read + trade permissions). Users configure bot strategies (indicator-based entry/exit rules), position size (% of balance), stop-loss, take-profit. Bot runs 24/7 and logs all executed trades automatically to the journal
7. **Copy Trading** — Premium traders can register as a "Master." Followers subscribe to a master and automatically mirror their trades proportionally. Master dashboard shows follower count, total copied volume, performance. Follower dashboard shows copied trade history and P&L
8. **Backtesting Engine** — Test any indicator-based strategy against historical OHLCV data fetched from exchange APIs. Configure symbol, timeframe, date range, position sizing, SL/TP. Results show: total trades, win rate, P&L curve, max drawdown, Sharpe ratio, trade-by-trade breakdown
9. **Playbooks** — Name and define trading strategies with written rules, setup criteria, entry/exit conditions, risk parameters. Tag live trades to a playbook. Per-playbook analytics show which strategies are performing. Share playbooks with mentors or community
10. **Trade Replay** — Step through any past trade tick by tick using stored OHLCV data. Speed control (0.5x, 1x, 2x, 5x, 10x). Add annotations. Review entry/exit decisions visually on a candlestick chart
11. **Education Hub** — Structured courses with lessons (video + text). Webinar archive. Progress tracking per student. Admins and Mentors upload and organize content. Course completion badges
12. **Mentor Mode** — Traders invite mentors via email. Mentor gets read-only access to that trader's journal, stats, and playbooks. Mentor can leave trade-specific comments/feedback. Mentee controls access and can revoke at any time
13. **USDT Payment System** — Users select Basic or Premium plan (monthly or yearly). App displays USDT wallet address (TRC20 + ERC20) and exact amount. User submits TX hash. System auto-verifies via Trongrid (TRC20) and Etherscan (ERC20) APIs. Subscription activates on confirmation. Admin can manually approve/reject from a Pending Payments queue
14. **Subscription Management** — Users view current plan, billing history, next renewal date. Upgrade/downgrade flow. Admin can extend, pause, or cancel any subscription
15. **Admin Dashboard** — Platform-wide stats: total users, active subscriptions, revenue (USDT), bot activity volume, pending payment approvals. User management table with search, filter, role assignment. Subscription queue. Bot activity logs
16. **Multi-Account Support** — Basic: 1 account. Premium: unlimited. Each account tracks its own P&L, trades, and bot connections independently
17. **Notifications** — In-app + email notifications for: bot trade executed, signal triggered, copy trade fired, subscription activated/expiring, mentor feedback received
18. **Dark/Light Mode Toggle** — Full theme switch across entire app, persisted per user preference

## Data Model

- **User:** id, name, email, passwordHash, role (admin/mentor/trader/student), plan (basic/premium/none), planBilling (monthly/yearly), planExpiresAt, avatarUrl, createdAt
- **TradingAccount:** id, userId, name, exchange (binance/bybit/okx/coinbase/manual), balance, currency, isDefault, createdAt
- **ExchangeConnection:** id, userId, exchange, apiKey (encrypted), apiSecret (encrypted), permissions, isActive, createdAt
- **Trade:** id, accountId, userId, symbol, side, entryPrice, exitPrice, quantity, grossPnl, netPnl, fees, mae, mfe, entryAt, exitAt, duration, tags[], playbookId, notes, rating, screenshotUrl, isBotTrade, isReplay, createdAt
- **BotConfig:** id, userId, accountId, name, exchange, symbol, timeframe, strategy (indicator config JSON), positionSizePct, stopLossPct, takeProfitPct, isActive, createdAt
- **BotSignal:** id, botConfigId, symbol, timeframe, signalType (buy/sell/neutral), indicatorValues JSON, triggeredAt, acted (bool)
- **CopyTradeGroup:** id, masterId, name, isPublic, maxFollowers, createdAt
- **CopyTradeMember:** id, groupId, followerId, allocationPct, isActive, joinedAt
- **BacktestSession:** id, userId, name, exchange, symbol, timeframe, startDate, endDate, strategyConfig JSON, results JSON, createdAt
- **Playbook:** id, userId, name, description, rules[], setupCriteria, entryConditions, exitConditions, riskParams, isShared, createdAt
- **Course:** id, authorId, title, description, thumbnailUrl, isPublished, order, createdAt
- **Lesson:** id, courseId, title, content, videoUrl, order, createdAt
- **CourseProgress:** id, userId, courseId, completedLessons[], completedAt
- **MentorInvite:** id, traderId, mentorId, status (pending/active/revoked), createdAt
- **Subscription:** id, userId, plan, billing, amountUSDT, network (trc20/erc20), txHash, status (pending/active/expired/rejected), verifiedAt, expiresAt, createdAt
- **Notification:** id, userId, type, message, isRead, createdAt

**Relationships:**
- A User has many TradingAccounts, ExchangeConnections, Trades, BotConfigs, Playbooks, Subscriptions
- A TradingAccount has many Trades and one optional BotConfig
- A BotConfig has many BotSignals
- A CopyTradeGroup belongs to a master User and has many CopyTradeMembers (follower Users)
- A Playbook belongs to a User and has many Trades tagged to it
- A Course has many Lessons; a User has many CourseProgress records
- A MentorInvite links a Trader to a Mentor

## Pages / Screens

1. `/` — Landing page: hero with platform preview, feature highlights (journal, bot, copy trading, education), pricing section, testimonials, CTA
2. `/login` — Auth: email/password login + Google OAuth
3. `/register` — Auth: signup with role selection (Trader or Student)
4. `/pricing` — Public pricing page: Basic vs Premium, monthly/yearly toggle, USDT payment info, feature comparison table
5. `/dashboard` — Main trader dashboard: P&L stat cards, equity curve chart, recent trades, active bot status, signal feed, quick-add trade button
6. `/dashboard/journal` — Trade journal: filterable/searchable table of all trades, date grouping, daily P&L summary rows
7. `/dashboard/journal/[tradeId]` — Trade detail: full stats (P&L, MAE/MFE, Zella Scale-equivalent), candlestick chart with entry/exit markers, notes, tags, playbook, screenshots
8. `/dashboard/journal/add` — Add trade form: manual trade entry with all fields
9. `/dashboard/analytics` — Analytics overview: KPI cards + equity curve + calendar heatmap
10. `/dashboard/analytics/reports` — 30+ reports: tabbed by category (time, symbol, risk, playbook, tags), each renders charts + data tables
11. `/dashboard/bot` — Bot overview: active bots list, recent signals feed, total bot P&L, status indicators
12. `/dashboard/bot/create` — Create/configure a new bot: exchange, symbol, timeframe, indicator strategy builder, position sizing, SL/TP
13. `/dashboard/bot/[botId]` — Bot detail: live status, trade history, performance stats, start/stop controls
14. `/dashboard/signals` — Signal feed: all triggered signals across all bots with symbol, type, timeframe, indicator values
15. `/dashboard/copy-trading` — Copy trading hub: tabs for "As Master" and "As Follower." Master view: manage group, follower list, performance. Follower view: browse masters, subscribe, copied trade history
16. `/dashboard/backtesting` — Backtesting list: all past sessions with summary stats
17. `/dashboard/backtesting/new` — New backtest: configure strategy, symbol, date range, run simulation, view results
18. `/dashboard/backtesting/[sessionId]` — Backtest result detail: P&L curve, trade list, performance metrics
19. `/dashboard/playbooks` — Playbooks list: cards per strategy with win rate badge
20. `/dashboard/playbooks/[playbookId]` — Playbook detail: rules, performance analytics, tagged trades list
21. `/dashboard/replay/[tradeId]` — Trade replay: candlestick chart with tick-by-tick playback, speed control, annotation tools
22. `/dashboard/education` — Education hub: course grid with progress indicators
23. `/dashboard/education/[courseId]` — Course page: lesson list, video player, progress tracking
24. `/dashboard/mentor` — Mentor mode: list of mentees (for mentors) or mentor invites (for traders)
25. `/dashboard/accounts` — Trading accounts: list, add new, connect exchange API
26. `/dashboard/billing` — Billing: current plan, payment history, upgrade/downgrade, submit new USDT payment (wallet address + TX hash form)
27. `/dashboard/settings` — User settings: profile, notification preferences, theme toggle, API key management
28. `/admin` — Admin overview: platform stats, revenue, user growth charts
29. `/admin/users` — User management table: search, filter by role/plan, edit roles, suspend
30. `/admin/payments` — Pending payments queue: review TX hash submissions, verify on-chain, approve/reject
31. `/admin/bots` — Bot activity monitor: all active bots across platform, signal volume, error logs
32. `/admin/education` — Content management: create/edit courses and lessons
33. `/mentor/[menteeId]` — Mentor view of a specific mentee's journal and stats

## Integrations
- **Auth:** Better Auth + Google OAuth
- **Email:** Resend (welcome email, subscription confirmed, bot alert digest, mentor feedback notification, plan expiry reminder)
- **Payments:** USDT crypto payments — TRC20 via Trongrid API, ERC20 via Etherscan API (no Stripe)
- **File uploads:** Cloudflare R2 (trade chart screenshots, course videos/thumbnails, lesson attachments)
- **Exchange APIs:** Binance REST + WebSocket, Bybit REST + WebSocket, OKX REST + WebSocket, Coinbase Advanced Trade API
- **Dark mode:** Yes — full dark/light toggle with next-themes

## JB Components to Install
- JB Better Auth UI: `pnpm dlx shadcn@latest add https://better-auth-ui.desishub.com/r/auth-components.json`
- JB Data Table: `pnpm dlx shadcn@latest add https://jb.desishub.com/r/data-table.json`
- JB File Storage UI: `pnpm dlx shadcn@latest add https://file-storage.desishub.com/r/file-storage.json`

## Out of Scope (v1)
- Mobile app (iOS/Android)
- Live Level II DOM / orderflow institutional data feeds (like DeepCharts)
- Options trading charts and greeks tracking
- Social feed / community forum
- Stripe or fiat payment processing
- AI/ML-powered signal generation (signals use built-in technical indicators only)
- White-label or multi-tenant academy management
