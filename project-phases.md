# FXAU — Build Phases

## Phase 1 — Foundation
**Goal:** Project scaffolded, design system applied, env files created, database connected, Redis cache configured, auth working, layout shell built.

### Tasks
- [ ] Initialize Next.js 16 + shadcn/ui in ONE step: `pnpm dlx shadcn@latest init --preset b0 --template next`. **Do NOT use `--src-dir`** — requires flat root layout (`app/`, `components/`, `lib/` at project root, no `src/` wrapper). If falling back to `pnpm create next-app`, pass `--no-src-dir`.
- [ ] Confirm tsconfig has `"paths": { "@/*": ["./*"] }` (NOT `["./src/*"]`)
- [ ] Install Form shadcn fallback: `pnpm dlx shadcn@latest add https://vibekit.desishub.com/r/form.json`
- [ ] Install fonts: `Space Grotesk` (display, 600/700/800) + `DM Sans` (body, 400/500) via `next/font/google`
- [ ] Create `.env.example` (committed) and `.env.local` (gitignored) with ALL env vars:
  ```
  # Database
  DATABASE_URL=                        # Neon PostgreSQL connection string
  
  # Redis
  UPSTASH_REDIS_URL=                   # Upstash Redis REST URL
  UPSTASH_REDIS_TOKEN=                 # Upstash Redis REST token
  
  # Auth
  BETTER_AUTH_SECRET=                  # Random 32-char secret
  BETTER_AUTH_URL=                     # e.g. http://localhost:3000
  GOOGLE_CLIENT_ID=                    # Google OAuth client ID
  GOOGLE_CLIENT_SECRET=                # Google OAuth client secret
  
  # Email
  RESEND_API_KEY=                      # Resend API key
  RESEND_FROM_EMAIL=                   # e.g. noreply@fxau.io
  
  # Cloudflare R2
  R2_ACCOUNT_ID=                       # Cloudflare account ID
  R2_ACCESS_KEY_ID=                    # R2 access key
  R2_SECRET_ACCESS_KEY=                # R2 secret key
  R2_BUCKET_NAME=                      # e.g. fxau-uploads
  R2_PUBLIC_URL=                       # Public R2 bucket URL
  
  # Blockchain Verification
  TRONGRID_API_KEY=                    # Trongrid API key for TRC20 verification
  ETHERSCAN_API_KEY=                   # Etherscan API key for ERC20 verification
  
  # USDT Wallet Addresses
  USDT_TRC20_WALLET=                   # Your TRC20 USDT wallet address
  USDT_ERC20_WALLET=                   # Your ERC20 USDT wallet address
  
  # Exchange APIs (server-side only, per-user keys stored encrypted in DB)
  ENCRYPTION_SECRET=                   # 32-char key for encrypting user API keys
  
  # App
  NEXT_PUBLIC_APP_URL=                 # e.g. https://fxau.io
  ```
- [ ] Add `.env.local` to `.gitignore`
- [ ] Set up Prisma v7 with Neon PostgreSQL — create `prisma/schema.prisma` with all models from project-description.md
- [ ] Set up Upstash Redis in `lib/cache.ts` with `getCachedOrFetch()` and `invalidateTag()` wrappers. Add `@upstash/redis` to dependencies
- [ ] Apply design-style-guide.md tokens to `app/globals.css` (Tailwind v4 CSS-first `@theme` directive — no tailwind.config.ts)
- [ ] Install Space Grotesk + DM Sans via next/font. Set as CSS variables in globals.css
- [ ] Create root layout with QueryClientProvider + ThemeProvider (next-themes, defaultTheme="dark")
- [ ] Build collapsible sidebar layout with nav items:
  - Dashboard, Journal, Analytics, Bot, Signals, Copy Trading, Backtesting, Playbooks, Education, Mentor, Accounts, Billing, Settings
  - User avatar section at bottom with role badge
  - Dark/light mode toggle
  - Collapse to icon-only on mobile
- [ ] Build page header component (breadcrumb + page title + action slot)
- [ ] Install JB Better Auth UI: `pnpm dlx shadcn@latest add https://better-auth-ui.desishub.com/r/auth-components.json`
- [ ] **Integrate auth files into existing routes — do NOT overwrite existing page.tsx or layout.tsx. Edit and merge.**
- [ ] Configure Better Auth with Google OAuth
- [ ] Create `middleware.ts` — protect all `/dashboard/*` and `/admin/*` and `/mentor/*` routes. Redirect unauthenticated users to `/login`
- [ ] Build custom 404, error.tsx, and loading.tsx pages (styled with design tokens)
- [ ] Build role-based access: Admin → `/admin`, Mentor → `/mentor`, Trader/Student → `/dashboard`
- [ ] Verify: login, signup, Google OAuth, protected routes all work

### Dependencies
- Neon database created, DATABASE_URL in .env.local
- Upstash Redis created, UPSTASH_REDIS_URL + UPSTASH_REDIS_TOKEN in .env.local
- Resend account created, RESEND_API_KEY in .env.local
- Google OAuth app created in Google Console
- Trongrid account created, TRONGRID_API_KEY in .env.local
- Etherscan API key created, ETHERSCAN_API_KEY in .env.local

---

## Phase 2 — Database & Seed Data
**Goal:** Full schema live, migration applied, realistic seed data for development.

### Tasks
- [ ] Finalize Prisma schema with ALL models:
  - User, TradingAccount, ExchangeConnection, Trade, BotConfig, BotSignal
  - CopyTradeGroup, CopyTradeMember, BacktestSession, Playbook
  - Course, Lesson, CourseProgress, MentorInvite
  - Subscription, Notification
- [ ] Run migration: `pnpm db:push && pnpm db:generate`
- [ ] Create `prisma/seed.ts` with realistic data:
  - 10 users (2 admins, 2 mentors, 4 traders, 2 students)
  - 3 trading accounts per trader (Binance, Bybit, manual)
  - 200+ trades with realistic P&L, symbols (BTC/USDT, ETH/USDT, EUR/USD, GBP/USD), tags, playbook assignments
  - 5 bot configs with 50+ signals each
  - 2 copy trade groups with 3 followers each
  - 10 backtest sessions with results JSON
  - 8 playbooks with strategy rules
  - 3 courses with 5 lessons each, progress records
  - 6 mentor invite relationships
  - 20 subscriptions (mix of active, pending, expired)
  - 30 notifications
- [ ] Add `"db:seed": "tsx prisma/seed.ts"` to package.json scripts
- [ ] Run seed: `pnpm db:seed`
- [ ] Verify all relations load correctly with Prisma Studio: `pnpm db:studio`

### Dependencies
- Phase 1 complete

---

## Phase 3 — Trade Journal & Analytics
**Goal:** Full trade journaling system and analytics reports built and connected to real data.

### Tasks
- [ ] Install JB Data Table: `pnpm dlx shadcn@latest add https://jb.desishub.com/r/data-table.json`
- [ ] Build API routes with Redis caching:
  - `GET /api/trades` — paginated, filtered trade list (cache by userId + filter hash, invalidate on mutation)
  - `POST /api/trades` — create trade (invalidates trade cache)
  - `GET /api/trades/[tradeId]` — trade detail
  - `PUT /api/trades/[tradeId]` — update trade
  - `DELETE /api/trades/[tradeId]` — delete trade
  - `GET /api/analytics/summary` — KPI stats (win rate, P&L, profit factor, etc.)
  - `GET /api/analytics/reports/[reportType]` — individual report data
  - `GET /api/accounts` — user's trading accounts
  - `POST /api/accounts` — add account
- [ ] Build `/dashboard` — main dashboard page:
  - Stat cards: Total P&L, Win Rate, Total Trades, Profit Factor, Best Trade, Worst Trade, Current Streak
  - Equity curve chart (Recharts LineChart)
  - Calendar heatmap (green/red daily P&L)
  - Recent trades mini-list (last 5)
  - Active bot status widget
  - Latest signals widget
- [ ] Build `/dashboard/journal` — trade journal page:
  - Data Table with columns: Date, Symbol, Side, Entry, Exit, P&L, Tags, Playbook, Rating
  - Search + global filter panel (date range, symbol, side, tags, account)
  - Daily grouping with daily P&L summary rows
  - Excel export + PDF export buttons
  - Quick-add trade FAB button
- [ ] Build `/dashboard/journal/[tradeId]` — trade detail page:
  - Full stat panel: Gross/Net P&L, MAE/MFE, Duration, Risk/Reward
  - Efficiency scale (actual vs potential P&L bar)
  - Candlestick chart with entry/exit markers (use Recharts or lightweight-charts)
  - Running P&L chart
  - Notes editor (rich text)
  - Tags + playbook assignment
  - Screenshot gallery (upload via R2)
  - Trade rating (1–5 stars)
- [ ] Build `/dashboard/journal/add` — add trade form (React Hook Form + Zod):
  - Fields: account, symbol, side, entry price, exit price, quantity, entry date/time, exit date/time, fees, SL, TP, tags, playbook, notes, rating, screenshot upload
- [ ] Build `/dashboard/analytics` — analytics overview:
  - KPI card grid
  - Equity curve (Recharts)
  - Win/Loss donut chart
  - Best performing symbols bar chart
  - Trading hours heatmap
- [ ] Build `/dashboard/analytics/reports` — full reports page:
  - Tab navigation: Time, Symbol, Risk, Playbook, Tags, Win/Loss
  - Each tab: relevant charts + data table
  - 30+ report types implemented
- [ ] Add Suspense + ErrorBoundary wrappers on every data section
- [ ] Add loading skeletons for all pages and data tables
- [ ] Add empty states for zero-trade state

### Dependencies
- Phase 2 complete (schema + seed data)

---

## Phase 4 — Bot System
**Goal:** Signal bot, auto-trading bot, and copy trading fully built.

### Tasks
- [ ] Build API routes:
  - `GET/POST /api/bots` — list and create bot configs
  - `GET/PUT/DELETE /api/bots/[botId]` — bot detail, update, delete
  - `POST /api/bots/[botId]/start` — activate bot
  - `POST /api/bots/[botId]/stop` — deactivate bot
  - `GET /api/signals` — paginated signal feed
  - `GET/POST /api/copy-trading/groups` — list and create copy groups
  - `POST /api/copy-trading/groups/[groupId]/join` — follow a master
  - `POST /api/copy-trading/groups/[groupId]/leave` — unfollow
- [ ] Build exchange connection service `lib/exchanges/`:
  - `binance.ts` — Binance REST client (OHLCV, account balance, place order)
  - `bybit.ts` — Bybit REST client
  - `okx.ts` — OKX REST client
  - `coinbase.ts` — Coinbase Advanced Trade client
  - `index.ts` — unified adapter interface
- [ ] Build indicator engine `lib/indicators/`:
  - RSI, EMA, MACD, Bollinger Bands, ATR implementations
  - Signal evaluation function: given OHLCV array + config → returns buy/sell/neutral
- [ ] Build bot runner `lib/bot-runner.ts`:
  - Polling loop (or cron) that fetches latest OHLCV, evaluates indicators, generates BotSignal records
  - If bot is in auto-trade mode: places order via exchange client, logs Trade record
- [ ] Build `/dashboard/bot` — bot overview:
  - Active bots list with status indicators (green/red pill)
  - Total bot P&L stat cards
  - Recent signals feed
  - Performance chart per bot
- [ ] Build `/dashboard/bot/create` — bot creation wizard:
  - Step 1: Exchange + account selection
  - Step 2: Symbol + timeframe
  - Step 3: Indicator strategy builder (select indicator, configure params)
  - Step 4: Position sizing, SL/TP, mode (signal-only vs auto-trade)
  - Step 5: Review + activate
- [ ] Build `/dashboard/bot/[botId]` — bot detail:
  - Live status badge, start/stop toggle
  - Performance stats: trades executed, win rate, P&L
  - Signal history table
  - Trade history table (if auto-trade mode)
  - Edit config button
- [ ] Build `/dashboard/signals` — signals feed page:
  - Real-time-style feed of all signals across all user bots
  - Filter by symbol, bot, signal type
  - Signal cards with indicator values, timestamp, action taken
- [ ] Build `/dashboard/copy-trading` — copy trading page:
  - Tab: "As Master" — create/manage group, set max followers, view follower list + performance
  - Tab: "As Follower" — browse available master traders, subscribe with allocation %, view copied trade history
- [ ] Build copy trade execution service `lib/copy-trade.ts`:
  - When master places a trade, fire proportional trades for all active followers
  - Log each CopyTradeMember trade to their journal automatically
- [ ] Add Suspense + ErrorBoundary + skeletons on all bot pages

### Dependencies
- Phase 3 complete
- Exchange API keys available for testing (testnet/sandbox recommended)

---

## Phase 5 — Backtesting & Replay
**Goal:** Backtesting engine and trade replay fully functional.

### Tasks
- [ ] Build API routes:
  - `GET/POST /api/backtesting` — list sessions, create new session
  - `POST /api/backtesting/run` — execute backtest simulation (returns results JSON)
  - `GET /api/backtesting/[sessionId]` — session detail + results
  - `GET /api/replay/[tradeId]` — fetch OHLCV data for trade's symbol/timeframe window
- [ ] Build backtesting engine `lib/backtester.ts`:
  - Accept: symbol, exchange, timeframe, date range, strategy config, position sizing, SL/TP
  - Fetch historical OHLCV from exchange API
  - Simulate bar-by-bar: evaluate indicator signals, open/close positions, track P&L
  - Return: results object with trades array, equity curve, metrics (win rate, drawdown, Sharpe)
- [ ] Build `/dashboard/backtesting` — sessions list:
  - Cards per session: name, symbol, date range, win rate badge, total P&L
  - New session button
- [ ] Build `/dashboard/backtesting/new` — backtest configuration:
  - Exchange + symbol + timeframe selector
  - Date range picker
  - Strategy builder (reuse indicator config component from bot)
  - Position sizing + SL/TP
  - Run backtest button with loading state (shows progress)
- [ ] Build `/dashboard/backtesting/[sessionId]` — results page:
  - Summary stats: total trades, win rate, profit factor, max drawdown, Sharpe ratio
  - Equity curve chart (Recharts)
  - Trade-by-trade breakdown table
  - Monthly returns heatmap
- [ ] Build `/dashboard/replay/[tradeId]` — trade replay page:
  - Candlestick chart (lightweight-charts or Recharts)
  - Playback controls: play/pause, speed selector (0.5x/1x/2x/5x/10x), step forward/back
  - Entry/exit markers overlaid on chart
  - Current bar timestamp display
  - Annotation tool (draw notes on chart)
  - Side panel: trade stats during replay

### Dependencies
- Phase 4 complete (indicator engine reused in backtester)

---

## Phase 6 — Playbooks & Education
**Goal:** Playbook strategy system and education hub complete.

### Tasks
- [ ] Install JB File Storage UI: `pnpm dlx shadcn@latest add https://file-storage.desishub.com/r/file-storage.json`
- [ ] Build API routes:
  - `GET/POST /api/playbooks` — list and create playbooks
  - `GET/PUT/DELETE /api/playbooks/[playbookId]` — playbook CRUD
  - `GET /api/playbooks/[playbookId]/analytics` — per-playbook performance stats
  - `GET/POST /api/courses` — list and create courses
  - `GET /api/courses/[courseId]` — course + lessons
  - `POST /api/courses/[courseId]/progress` — update lesson progress
  - `GET/POST /api/mentor/invites` — mentor invite management
- [ ] Build `/dashboard/playbooks` — playbooks list:
  - Strategy cards: name, setup criteria preview, win rate badge, trade count
  - Create new playbook button
- [ ] Build `/dashboard/playbooks/[playbookId]` — playbook detail:
  - Strategy rules display (formatted)
  - Performance analytics: trades using this playbook, win rate, avg P&L, best/worst
  - Tagged trades table
  - Share toggle (make public for mentor access)
  - Edit rules form
- [ ] Build `/dashboard/education` — education hub:
  - Course grid with thumbnail, title, lesson count, progress bar
  - Filter by category (beginner, advanced, strategy, psychology)
- [ ] Build `/dashboard/education/[courseId]` — course page:
  - Lesson list sidebar with completion checkmarks
  - Video player (embed or R2 hosted)
  - Rich text lesson content
  - Progress auto-saved on lesson completion
  - Course completion badge
- [ ] Build `/dashboard/mentor` — mentor mode:
  - For Traders: invite mentor form, active mentors list, revoke access button
  - For Mentors: mentees list, click through to `/mentor/[menteeId]`
- [ ] Build `/mentor/[menteeId]` — mentor view of mentee:
  - Read-only journal table
  - Read-only analytics dashboard
  - Playbooks list
  - Comment/feedback panel per trade
- [ ] Admin: `/admin/education` — course + lesson CMS (create, edit, reorder, publish/unpublish)

### Dependencies
- Phase 3 complete (journal + analytics reused in mentor view)

---

## Phase 7 — USDT Payments & Subscriptions
**Goal:** Full USDT payment flow, blockchain verification, and subscription gating working.

### Tasks
- [ ] Build API routes:
  - `POST /api/payments/submit` — user submits TX hash + network + plan
  - `POST /api/payments/verify/[subscriptionId]` — trigger blockchain verification
  - `GET /api/payments/status/[subscriptionId]` — check subscription status
  - `GET /api/admin/payments` — pending payments queue
  - `POST /api/admin/payments/[subscriptionId]/approve` — manual approve
  - `POST /api/admin/payments/[subscriptionId]/reject` — manual reject
- [ ] Build blockchain verification service `lib/payments/`:
  - `trc20.ts` — query Trongrid API: verify TX hash, confirm recipient wallet, amount, and confirmations ≥ 10
  - `erc20.ts` — query Etherscan API: same verification for ERC20 USDT contract
  - `verify.ts` — unified verifier: detect network, call correct verifier, return status
- [ ] Build subscription activation service `lib/subscriptions.ts`:
  - On verification success: update User.plan, User.planBilling, User.planExpiresAt
  - Send confirmation email via Resend
  - Create Notification record
- [ ] Build `/dashboard/billing` — billing page:
  - Current plan display with expiry date
  - Plan comparison (Basic vs Premium) with feature list
  - Monthly/yearly toggle
  - "Upgrade" flow:
    - Step 1: Select plan + billing cycle
    - Step 2: Show wallet address (TRC20 + ERC20 tabs) + exact USDT amount + QR code
    - Step 3: TX hash submission form with network selector
    - Step 4: Pending confirmation screen (auto-polls verification status)
  - Payment history table
- [ ] Build `/admin/payments` — payment queue:
  - Table of pending submissions: user, plan, amount, network, TX hash, submitted at
  - "Verify on-chain" button per row (triggers verification API)
  - Manual approve / reject buttons
  - Status badges: pending / verified / approved / rejected
- [ ] Build plan gating middleware:
  - `lib/plan-gate.ts` — helper that checks user plan for feature access
  - Apply to: bot auto-trading routes (Premium only), copy trading (Premium only), unlimited accounts (Premium only)
  - Return 403 with upgrade prompt for Basic users hitting Premium features
- [ ] Build subscription expiry cron job (Vercel cron or background job):
  - Daily: check all active subscriptions for expiry
  - Send 7-day warning email
  - Downgrade expired Premium users to Basic
- [ ] Build `/pricing` public page:
  - Pricing cards: Basic vs Premium, monthly/yearly toggle
  - Feature comparison table
  - USDT payment explainer section
  - "Get Started" CTA → register → billing

### Dependencies
- Phase 1 complete (auth + user model)
- Trongrid + Etherscan API keys configured
- USDT wallet addresses configured in env

---

## Phase 8 — Admin Dashboard & Notifications
**Goal:** Full admin control panel and notification system live.

### Tasks
- [ ] Build `/admin` — admin overview:
  - Platform stats: total users, active subscriptions, monthly revenue (USDT), total trades journaled, active bots
  - User growth chart (Recharts)
  - Revenue chart (USDT by month)
  - Recent signups table
  - Pending payments alert widget
- [ ] Build `/admin/users` — user management:
  - Data Table: name, email, role, plan, joined, last active
  - Search + filter by role/plan/status
  - Edit role dropdown inline
  - Suspend / activate user actions
  - Click to view user's journal (admin read access)
- [ ] Build `/admin/bots` — bot activity monitor:
  - All active bots across platform
  - Signal volume chart
  - Error log table (failed order attempts)
  - Bot health status per exchange
- [ ] Build notification system:
  - `lib/notifications.ts` — createNotification() helper used across all services
  - Notification types: BOT_TRADE, SIGNAL_TRIGGERED, COPY_TRADE_FIRED, SUBSCRIPTION_ACTIVATED, SUBSCRIPTION_EXPIRING, MENTOR_FEEDBACK
  - In-app notification bell (header) — unread count badge, dropdown list
  - Mark as read / mark all read
  - Link each notification to relevant page
- [ ] Wire email notifications via Resend:
  - Welcome email on signup
  - Subscription confirmed email (with plan details)
  - Subscription expiring in 7 days email
  - Bot trade executed digest (daily summary, not per-trade)
  - Mentor left feedback email
- [ ] Build `/dashboard/settings`:
  - Profile section: name, avatar upload (R2), email
  - Notification preferences: toggle each notification type on/off
  - Theme preference: dark/light toggle (persisted to DB)
  - API key management: list connected exchanges, add/remove connections
  - Account danger zone: delete account

### Dependencies
- All previous phases complete

---

## Phase 9 — Polish & Deploy
**Goal:** Production-ready, deployed, and live.

### Tasks
- [ ] Test all CRUD operations end-to-end (journal, bot, copy trading, backtesting, billing)
- [ ] Test auth flows: signup, login, Google OAuth, protected routes, role gating
- [ ] Test USDT payment flow end-to-end (submit TX, verify, activate, expiry)
- [ ] Test bot signal generation with real exchange data (use small amounts on testnet)
- [ ] Test copy trading flow: master trade → follower auto-execution
- [ ] Verify responsive design: sidebar collapses correctly on mobile, tables scroll, charts resize
- [ ] Run Lighthouse audit — target: Performance ≥ 85, Accessibility ≥ 90
- [ ] **Run pre-deploy code review:** paste prompt from `pre-deploy-review.md` into Claude Code. Address every Critical issue. Save report to `pre-deploy-review-report.md`
- [ ] Bundle analysis: `pnpm build` — check for heavy chunks, add next/dynamic splits where needed
- [ ] Set all environment variables in Vercel dashboard
- [ ] Deploy to Vercel
- [ ] Configure Cloudflare DNS + custom domain (fxau.io or equivalent)
- [ ] Verify Resend sending domain (add DNS records)
- [ ] Verify R2 bucket CORS policy for file uploads
- [ ] Run production smoke test: register → subscribe → connect exchange → create bot → journal trade

### Production Checklist
- [ ] All env vars set in Vercel (double-check ENCRYPTION_SECRET, wallet addresses, API keys)
- [ ] Database migrations applied to production Neon DB
- [ ] Redis cache connected and working (test a cached route)
- [ ] Auth flows work on production URL (update BETTER_AUTH_URL + Google OAuth redirect URIs)
- [ ] Custom domain live with SSL
- [ ] Emails land in inbox (test welcome + subscription emails)
- [ ] File uploads work (test R2 upload from production)
- [ ] Bot signal generation working (test with 1 active bot)
- [ ] USDT payment verification working (test with small TRC20 transfer)
- [ ] Admin dashboard accessible at /admin (admin role user)
- [ ] 404 and error pages styled correctly
- [ ] Dark/light toggle persists across sessions
