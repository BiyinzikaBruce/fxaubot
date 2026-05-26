# Claude Code — FXAU Build Prompt

Read the following files in order before doing anything:
1. `master_prompt.md` — Your tech stack rules, Prisma v7 patterns, and coding standards. Follow EXACTLY.
2. `design-style-guide.md` — The visual design system for FXAU. Apply to every component you build. The Lazarev. agency aesthetic is the SOURCE OF TRUTH.
3. `jb-components.md` — The JB component reference. Use these components before writing from scratch.
4. `project-description.md` — What we are building. Every decision must align with this.
5. `project-phases.md` — The build plan. Work through phases in order.

## Core Rules
- Work through ONE phase at a time. Complete ALL tasks in a phase before moving to the next.
- After completing each phase, stop and confirm with me before proceeding.
- Follow design-style-guide.md tokens exactly — colors, typography, spacing, radius, glassmorphism specs.
- Dark mode is the DEFAULT. Use `next-themes` with `defaultTheme="dark"`. Apply `.dark` class variants everywhere.
- Use Prisma v7 patterns (NOT v6). See master_prompt.md for the exact setup.
- Use React Query for ALL client data fetching + Redis (`getCachedOrFetch` + `invalidateTag` from `lib/cache.ts`) for API-layer caching. Never `useEffect` for data fetching.
- Use React Hook Form + Zod for ALL forms. Every form wrapped in Suspense + ErrorBoundary.
- Use API Routes (Route Handlers) for all server-side logic.
- Use Framer Motion for animation. Animate only `transform` and `opacity`.
- Use `@react-pdf/renderer` for PDF generation (trade reports export). Never jsPDF.
- Use `xlsx` for Excel export (trade journal export).
- **Performance budget:** `next/dynamic` for heavy imports (charts, editors, replay), Suspense boundaries on every data-fetching section, ErrorBoundary on major page blocks, `aspect-ratio` on all images.
- **Before building auth, file uploads, data tables, or forms from scratch — check jb-components.md and install the relevant component first.**

## FXAU-Specific Rules

### Design
- Fonts: `Space Grotesk` (display/headings, 600/700) + `DM Sans` (body, 400/500) + `JetBrains Mono` (prices, hashes, API keys)
- All stat numbers: `font-display`, weight 700
- Profit values: `color: var(--color-profit)` (#00D084)
- Loss values: `color: var(--color-loss)` (#FF4B6E)
- Cards: 14px border radius, `1px solid var(--color-border-subtle)` border, no heavy box shadows
- Primary buttons: full pill (border-radius: 999px), gradient background
- TX hashes and API keys: always `font-mono`, truncated + copy button

### Payments (USDT — NO Stripe)
- No Stripe anywhere in the codebase
- Payment flow: user selects plan → sees USDT wallet address + amount → submits TX hash → system verifies on blockchain
- TRC20 verification: Trongrid API (`TRONGRID_API_KEY` env var)
- ERC20 verification: Etherscan API (`ETHERSCAN_API_KEY` env var)
- Wallet addresses from env: `USDT_TRC20_WALLET` and `USDT_ERC20_WALLET`
- Subscription activation only after ≥ 10 blockchain confirmations OR admin manual approval
- Admin payment queue at `/admin/payments`

### Exchange Connections
- User API keys MUST be encrypted at rest using `ENCRYPTION_SECRET` env var (AES-256)
- Never log or expose decrypted API keys
- Exchange adapter in `lib/exchanges/` with unified interface for Binance, Bybit, OKX, Coinbase
- Use exchange sandbox/testnet during development

### Bot System
- Indicator engine in `lib/indicators/` — RSI, EMA, MACD, Bollinger Bands, ATR
- Bot runner in `lib/bot-runner.ts` — polling-based signal evaluation
- Bot auto-trades are Premium-only — gate with `lib/plan-gate.ts`
- All bot trades auto-logged as Trade records with `isBotTrade: true`

### Copy Trading
- Copy trade execution in `lib/copy-trade.ts`
- When master trade fires → proportional trades for all active followers
- Each follower trade logged to their own journal automatically

### Role-Based Access
- Admin: `/admin/*` — full platform access
- Mentor: `/mentor/*` + read-only access to assigned mentee journals
- Trader (Premium): all `/dashboard/*` features
- Trader (Basic): `/dashboard/*` with Premium features returning 403 + upgrade prompt
- Student: `/dashboard/education/*` only (journal + analytics locked behind Trader plan)
- Middleware at `middleware.ts` enforces all route protection

### Pricing
- Basic: $39/mo or $29/mo billed yearly ($348/yr)
- Premium: $59/mo or $44/mo billed yearly ($528/yr)
- Bot access (auto-trading + copy trading): FREE but Premium plan only

## Start
Begin with **Phase 1 — Foundation** from `project-phases.md`. Read every task in the phase and execute them in order. Do not skip any task. After Phase 1 is fully complete, stop and show me what was built before proceeding.
