# FXAU — Design Style Guide

> Dark mode: SUPPORTED. Full dark/light toggle via next-themes. Dark is the default and primary experience.

---

## Visual Reference

The design is anchored to the work of **Lazarev. UI/UX Design Agency** (dribbble.com/lazarev_agency) — one of the world's most awarded product design studios. Their signature aesthetic: near-black deep navy backgrounds, glassmorphism surface cards with ultra-thin borders, electric blue-to-purple accent gradients, bold heavy sans-serif display typography, generous whitespace, and subtle motion-forward interactions. The energy is **institutional-premium** — the kind of interface that signals serious capability without shouting. Think: the cockpit of a Bloomberg Terminal redesigned by a Silicon Valley AI startup. Every surface should feel crafted, every transition intentional, every data point legible at a glance.

This aesthetic is the SOURCE OF TRUTH for every design decision in this file. When in doubt, ask: "Would Lazarev. ship this?"

---

## 1. Color Palette

### Dark Mode (Default)

```css
@theme {
  /* Backgrounds */
  --color-bg-primary: #08090E;        /* Page background — deepest dark */
  --color-bg-secondary: #0D0F16;      /* Sidebar, secondary surfaces */
  --color-bg-card: #111318;           /* Cards, panels */
  --color-bg-card-hover: #161921;     /* Card hover state */
  --color-bg-input: #0F1117;          /* Input fields */
  --color-bg-overlay: #1A1D26;        /* Modals, dropdowns, popovers */

  /* Borders */
  --color-border-subtle: rgba(255, 255, 255, 0.06);   /* Default card borders */
  --color-border-default: rgba(255, 255, 255, 0.10);  /* Input borders */
  --color-border-strong: rgba(255, 255, 255, 0.16);   /* Focused/active borders */
  --color-border-accent: rgba(79, 142, 247, 0.30);    /* Accent-tinted borders */

  /* Text */
  --color-text-primary: #F0F2F7;      /* Primary text */
  --color-text-secondary: #8B93A8;    /* Secondary/muted text */
  --color-text-tertiary: #525A6E;     /* Placeholder, disabled */
  --color-text-inverse: #08090E;      /* Text on light/accent surfaces */

  /* Brand Accents */
  --color-accent-primary: #4F8EF7;    /* Electric blue — primary actions */
  --color-accent-secondary: #7B5CF0;  /* Purple — secondary actions, gradients */
  --color-accent-gradient: linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%);
  --color-accent-glow: rgba(79, 142, 247, 0.15);      /* Glow/halo effect */

  /* Trading Semantic Colors */
  --color-profit: #00D084;            /* Green — profit, long, buy */
  --color-profit-bg: rgba(0, 208, 132, 0.10);
  --color-profit-border: rgba(0, 208, 132, 0.25);
  --color-loss: #FF4B6E;              /* Red — loss, short, sell */
  --color-loss-bg: rgba(255, 75, 110, 0.10);
  --color-loss-border: rgba(255, 75, 110, 0.25);
  --color-neutral: #F5A623;           /* Amber — neutral signals, warnings */
  --color-neutral-bg: rgba(245, 166, 35, 0.10);

  /* Status Colors */
  --color-status-active: #00D084;     /* Active bots, running */
  --color-status-pending: #F5A623;    /* Pending verification */
  --color-status-error: #FF4B6E;      /* Error, rejected */
  --color-status-inactive: #525A6E;   /* Inactive, disabled */
}
```

### Light Mode

```css
.light {
  --color-bg-primary: #F7F8FC;
  --color-bg-secondary: #EDEEF3;
  --color-bg-card: #FFFFFF;
  --color-bg-card-hover: #F0F1F7;
  --color-bg-input: #FFFFFF;
  --color-bg-overlay: #FFFFFF;

  --color-border-subtle: rgba(0, 0, 0, 0.06);
  --color-border-default: rgba(0, 0, 0, 0.10);
  --color-border-strong: rgba(0, 0, 0, 0.18);
  --color-border-accent: rgba(79, 142, 247, 0.35);

  --color-text-primary: #0D0F16;
  --color-text-secondary: #5A6178;
  --color-text-tertiary: #9BA3B8;
  --color-text-inverse: #FFFFFF;

  /* Accents and trading colors remain the same in light mode */
  --color-accent-primary: #3A7DF5;
  --color-accent-secondary: #6B4CE8;
  --color-accent-gradient: linear-gradient(135deg, #3A7DF5 0%, #6B4CE8 100%);
  --color-accent-glow: rgba(58, 125, 245, 0.12);

  --color-profit: #00B874;
  --color-profit-bg: rgba(0, 184, 116, 0.08);
  --color-profit-border: rgba(0, 184, 116, 0.20);
  --color-loss: #E83A5A;
  --color-loss-bg: rgba(232, 58, 90, 0.08);
  --color-loss-border: rgba(232, 58, 90, 0.20);
  --color-neutral: #E09610;
  --color-neutral-bg: rgba(224, 150, 16, 0.08);
}
```

---

## 2. Typography

### Font Stack
```css
@theme {
  --font-display: 'Space Grotesk', sans-serif;   /* Headlines, stat numbers, nav */
  --font-body: 'DM Sans', sans-serif;            /* Body text, labels, descriptions */
  --font-mono: 'JetBrains Mono', monospace;      /* TX hashes, API keys, code, prices */
}
```

Import in `app/layout.tsx`:
```ts
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})
```

### Type Scale
```css
@theme {
  /* Display — stat numbers, hero headlines */
  --text-display-2xl: 3.5rem;    /* font-display, 700 — hero stat numbers */
  --text-display-xl: 2.5rem;     /* font-display, 700 — page hero headers */
  --text-display-lg: 2rem;       /* font-display, 700 — section headers */

  /* Headings */
  --text-heading-xl: 1.5rem;     /* font-display, 600 — card titles, page titles */
  --text-heading-lg: 1.25rem;    /* font-display, 600 — section titles */
  --text-heading-md: 1.125rem;   /* font-display, 600 — widget titles */
  --text-heading-sm: 1rem;       /* font-display, 600 — small headings */

  /* Body */
  --text-body-lg: 1rem;          /* font-body, 400 — primary body */
  --text-body-md: 0.9375rem;     /* font-body, 400 — secondary body */
  --text-body-sm: 0.875rem;      /* font-body, 400 — small text, labels */
  --text-body-xs: 0.75rem;       /* font-body, 400 — captions, timestamps */

  /* Mono */
  --text-mono-md: 0.875rem;      /* font-mono — prices, TX hashes */
  --text-mono-sm: 0.8125rem;     /* font-mono — small data values */
}
```

### Typography Rules
- Stat numbers (P&L, win rate, trade count) always use `font-display` weight 700
- Positive P&L: `color: var(--color-profit)`, Negative: `color: var(--color-loss)`
- TX hashes and API keys: always `font-mono`, truncated with ellipsis + copy button
- Navigation labels: `font-display`, weight 500
- Table headers: `font-body`, weight 500, `color: var(--color-text-secondary)`, uppercase tracking-wider

---

## 3. Spacing & Layout

```css
@theme {
  --spacing-base: 0.25rem;   /* 4px */

  /* Sidebar */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 68px;

  /* Content */
  --content-padding: 2rem;          /* 32px page padding */
  --content-padding-sm: 1.25rem;    /* 20px mobile padding */
  --content-max-width: 1400px;

  /* Cards */
  --card-padding: 1.5rem;           /* 24px */
  --card-padding-sm: 1rem;          /* 16px compact cards */
  --card-gap: 1rem;                 /* 16px between cards */
  --section-gap: 1.5rem;            /* 24px between sections */

  /* Grid */
  --grid-cols-stats: repeat(4, 1fr);     /* Stat cards row */
  --grid-cols-stats-md: repeat(2, 1fr);
  --grid-cols-stats-sm: 1fr;
}
```

---

## 4. Card & Surface Specs

### Standard Card
```css
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 14px;
  padding: var(--card-padding);
  transition: border-color 200ms ease, background 200ms ease;
}
.card:hover {
  background: var(--color-bg-card-hover);
  border-color: var(--color-border-default);
}
```

### Glassmorphism Card (hero sections, featured widgets)
```css
.card-glass {
  background: rgba(17, 19, 24, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
}
/* Light mode override */
.light .card-glass {
  background: rgba(255, 255, 255, 0.75);
}
```

### Accent Glow Card (active bots, premium features)
```css
.card-glow {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-accent);
  border-radius: 14px;
  box-shadow: 0 0 24px var(--color-accent-glow), inset 0 1px 0 rgba(255,255,255,0.04);
}
```

### Stat Card
```css
.card-stat {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* Stat value */
.card-stat .value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}
/* Profit stat */
.card-stat .value.profit { color: var(--color-profit); }
/* Loss stat */
.card-stat .value.loss { color: var(--color-loss); }
/* Label */
.card-stat .label {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}
```

---

## 5. Button System

### Primary Button (gradient pill)
```css
.btn-primary {
  background: var(--color-accent-gradient);
  color: #FFFFFF;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 600;
  padding: 0.625rem 1.5rem;
  border-radius: 999px;    /* Full pill */
  border: none;
  cursor: pointer;
  transition: opacity 150ms ease, transform 150ms ease, box-shadow 150ms ease;
  box-shadow: 0 4px 16px rgba(79, 142, 247, 0.25);
}
.btn-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 142, 247, 0.35);
}
.btn-primary:active { transform: translateY(0); }
```

### Secondary Button (ghost)
```css
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 500;
  padding: 0.625rem 1.5rem;
  border-radius: 999px;
  border: 1px solid var(--color-border-default);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}
.btn-secondary:hover {
  background: var(--color-bg-card-hover);
  border-color: var(--color-border-strong);
}
```

### Danger Button
```css
.btn-danger {
  background: var(--color-loss-bg);
  color: var(--color-loss);
  border: 1px solid var(--color-loss-border);
  border-radius: 999px;
  padding: 0.625rem 1.5rem;
  font-family: var(--font-display);
  font-weight: 600;
}
```

### Icon Button
```css
.btn-icon {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 10px;
  padding: 0.5rem;
  color: var(--color-text-secondary);
  transition: background 150ms, color 150ms, border-color 150ms;
}
.btn-icon:hover {
  background: var(--color-bg-card-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
}
```

---

## 6. Form & Input Specs

```css
.input {
  background: var(--color-bg-input);
  border: 1px solid var(--color-border-default);
  border-radius: 10px;
  padding: 0.625rem 0.875rem;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  transition: border-color 150ms ease, box-shadow 150ms ease;
  width: 100%;
}
.input::placeholder { color: var(--color-text-tertiary); }
.input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px var(--color-accent-glow);
}
.input-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 0.375rem;
}
.input-error {
  font-size: 0.8125rem;
  color: var(--color-loss);
  margin-top: 0.25rem;
}
```

---

## 7. Badge & Status Components

### Trade Side Badge
```css
/* LONG */
.badge-long {
  background: var(--color-profit-bg);
  color: var(--color-profit);
  border: 1px solid var(--color-profit-border);
  border-radius: 6px;
  padding: 0.2rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-display);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
/* SHORT */
.badge-short {
  background: var(--color-loss-bg);
  color: var(--color-loss);
  border: 1px solid var(--color-loss-border);
  /* same sizing as badge-long */
}
```

### Subscription Status Badge
```css
.badge-active   { background: var(--color-profit-bg); color: var(--color-profit); border: 1px solid var(--color-profit-border); }
.badge-pending  { background: var(--color-neutral-bg); color: var(--color-neutral); border: 1px solid rgba(245,166,35,0.25); }
.badge-expired  { background: rgba(82,90,110,0.15); color: var(--color-status-inactive); border: 1px solid rgba(82,90,110,0.25); }
.badge-rejected { background: var(--color-loss-bg); color: var(--color-loss); border: 1px solid var(--color-loss-border); }
/* All badges: border-radius: 6px; padding: 0.2rem 0.625rem; font-size: 0.75rem; font-weight: 600; */
```

### Bot Status Pill
```css
.bot-active   { background: var(--color-profit-bg); color: var(--color-profit); border-radius: 999px; }
.bot-inactive { background: rgba(82,90,110,0.15); color: var(--color-status-inactive); border-radius: 999px; }
/* With animated pulse dot for active state */
```

### Plan Badge
```css
.badge-basic   { background: rgba(79,142,247,0.12); color: #4F8EF7; border: 1px solid rgba(79,142,247,0.25); border-radius: 6px; }
.badge-premium { background: linear-gradient(135deg, rgba(79,142,247,0.15), rgba(123,92,240,0.15)); color: #9B7EF8; border: 1px solid rgba(123,92,240,0.30); border-radius: 6px; }
```

---

## 8. Navigation & Sidebar

```css
/* Sidebar container */
.sidebar {
  width: var(--sidebar-width);
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-subtle);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
}

/* Logo area */
.sidebar-logo {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border-subtle);
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
  background: var(--color-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Nav item */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  margin: 0.125rem 0.75rem;
  border-radius: 10px;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.nav-item:hover {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
}
.nav-item.active {
  background: var(--color-accent-glow);
  color: var(--color-accent-primary);
  border: 1px solid var(--color-border-accent);
}

/* Nav section labels */
.nav-section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 1rem 1.75rem 0.375rem;
}
```

---

## 9. Data Tables

```css
.table-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 14px;
  overflow: hidden;
}
.table-header-cell {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.875rem 1rem;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-subtle);
}
.table-row {
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background 120ms ease;
}
.table-row:hover { background: var(--color-bg-card-hover); }
.table-cell {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  padding: 0.875rem 1rem;
}
/* P&L cell */
.table-cell.profit { color: var(--color-profit); font-family: var(--font-display); font-weight: 600; }
.table-cell.loss   { color: var(--color-loss);   font-family: var(--font-display); font-weight: 600; }
/* Price/symbol cells */
.table-cell.mono   { font-family: var(--font-mono); font-size: 0.875rem; }
```

---

## 10. Chart Styling

All Recharts components use these colors:

```ts
// lib/chart-config.ts
export const chartColors = {
  profit:    '#00D084',
  loss:      '#FF4B6E',
  neutral:   '#F5A623',
  primary:   '#4F8EF7',
  secondary: '#7B5CF0',
  grid:      'rgba(255,255,255,0.05)',  // dark mode
  gridLight: 'rgba(0,0,0,0.06)',         // light mode
  text:      '#8B93A8',
}

// Equity curve line: stroke="#4F8EF7", fill gradient from #4F8EF7 to transparent
// Candlestick up: #00D084, down: #FF4B6E
// Volume bars: profit volume #00D084 at 40% opacity, loss volume #FF4B6E at 40%
// Tooltip: background var(--color-bg-overlay), border var(--color-border-default)
```

---

## 11. Animation & Motion

Using **Framer Motion** (default). GSAP only if complex scroll marketing animations are needed.

```ts
// Shared animation variants — lib/animations.ts

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
}

export const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { duration: 0.2 } }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
}
```

**Rules:**
- Page load: stagger stat cards with `staggerChildren: 0.06`
- Sidebar nav items: stagger on initial mount
- Charts: fade in on mount (not on every data update)
- Modals/sheets: slide up from bottom on mobile, scale+fade on desktop
- Bot status change: pulse animation on status dot
- P&L numbers: animate count-up on dashboard load (Framer Motion `useSpring`)
- Only animate `transform` and `opacity` — never `width`, `height`, or layout properties

---

## 12. Skeleton Loading States

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-card) 0%,
    var(--color-bg-card-hover) 50%,
    var(--color-bg-card) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Every page must have a skeleton spec:**
- Dashboard: 4 stat card skeletons (same size as real cards) + chart area skeleton + table skeleton
- Journal: table skeleton with 8 row skeletons
- Bot page: 2 card skeletons + signal feed skeletons
- Analytics: KPI skeleton + chart skeleton (300px height placeholder)

---

## 13. Responsive Rules

- **Breakpoints:** sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1400px
- **Sidebar:** Full sidebar ≥ 1024px. Icon-only (68px) at 768–1023px. Hidden drawer (sheet) < 768px
- **Stat card grid:** 4 cols ≥ 1280px → 2 cols ≥ 768px → 1 col mobile
- **Tables:** Horizontal scroll on mobile, min-width: 700px
- **Charts:** `width: 100%`, height fixed (300px default, 400px for main equity curve)
- **Forms:** Single column on mobile, 2-col grid on ≥ 768px

---

## 14. Landing Page Guidance

The `/` landing page follows Lazarev's "cinematic reveal" approach:

**Hero section:**
- Full-width dark background (`--color-bg-primary`)
- Large gradient headline: "Trade Smarter. Automate Everything." in `font-display` 700, 3.5rem+
- Subtitle in `font-body`, `--color-text-secondary`
- Two CTAs: primary pill gradient button "Get Started" + ghost "See How It Works"
- Hero product screenshot (dashboard mockup) below — slightly tilted with perspective transform, subtle glow border
- Floating stat badges (animated): "20,000+ Trades Journaled", "99.9% Uptime", "4 Exchanges"

**Features strip:** Horizontal scrolling icon + label strip (Journal, Analytics, Bot, Copy Trade, Backtesting, Replay, Education, Mentor) — mirrors TradeZella's feature carousel

**Feature sections:** Alternating left/right layout — screenshot left + text right, then text left + screenshot right. Each with a subtle background grid pattern

**Pricing section:** Monthly/yearly toggle. Two pricing cards (Basic / Premium). Premium card has gradient border + "Most Popular" badge. USDT accepted badge with TRC20/ERC20 logos

**Social proof:** Animated counter stats ("20K+ Trades", "500+ Traders", "4 Exchanges")

**Footer:** Dark, minimal. Logo, nav links, social icons, legal links

---

## 15. Email Template Notes

All emails use Resend + React Email. Style rules:

- Background: `#0D0F16` (dark) — emails are dark-themed to match app
- Card container: `#111318`, `border: 1px solid rgba(255,255,255,0.08)`, `border-radius: 12px`
- Heading: Space Grotesk equivalent (use system sans as fallback), weight 700
- Body text: `#8B93A8`
- CTA button: gradient background simulation (solid `#4F8EF7` as fallback), pill shape, `padding: 12px 28px`
- Profit values: `color: #00D084`
- Loss values: `color: #FF4B6E`

**Email types:**
- Welcome: FXAU logo + "Welcome to FXAU" headline + 3 quick-start steps + CTA "Go to Dashboard"
- Subscription Confirmed: Plan name, amount paid, expiry date, USDT network used, CTA "Start Trading"
- Subscription Expiring (7 days): Warning card with expiry date, renewal instructions, CTA "Renew Now"
- Bot Trade Digest (daily): Table of yesterday's bot trades — symbol, side, P&L. Total bot P&L for the day
- Mentor Feedback: Mentee name, trade details, mentor comment preview, CTA "View Feedback"

---

## 16. Component-Specific Notes

### USDT Payment Widget (`/dashboard/billing`)
- Wallet address in `font-mono` with full address + one-click copy button
- QR code displayed below address (use `qrcode.react` library)
- Network tabs: TRC20 / ERC20 — each shows own address
- Amount to send: bold, `font-display` 700, in `--color-accent-primary`
- Warning banner: "Only send USDT. Do not send other tokens. Minimum 10 confirmations required." in amber
- TX hash input: `font-mono` input field, full width
- Pending status: animated spinner + "Verifying on blockchain..." message
- Confirmed status: green checkmark animation + "Subscription activated!" 

### Bot Configuration Wizard
- Multi-step with animated step indicator (connected dots)
- Strategy builder: visual indicator selector cards (RSI card, EMA card, MACD card) — not dropdowns
- Each indicator card shows: icon, name, description, parameter inputs inline on selection
- Live preview panel on the right: shows what the signal would look like based on current config

### Trade Journal Table
- P&L column: right-aligned, `font-display` 700, profit/loss color
- Side column: LONG/SHORT badge
- Symbol column: `font-mono`, with exchange logo favicon
- Tags: pill badges in `--color-accent-primary` tint
- Row hover: subtle left accent border appears (`border-left: 3px solid var(--color-accent-primary)`)

### Signal Feed
- Real-time-style list — new signals slide in from top
- Each signal card: symbol logo + signal type (BUY/SELL/NEUTRAL badge) + timeframe + indicator name + timestamp
- BUY: left accent `--color-profit`, SELL: `--color-loss`, NEUTRAL: `--color-neutral`

### Copy Trading Master Card
- Trader avatar + name + verified badge
- Stats row: Win Rate, Total Followers, Monthly Return, Max Drawdown
- "Follow" button: gradient pill primary
- Performance sparkline (mini Recharts line chart, last 30 days)
