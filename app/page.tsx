"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

// ─── Data ────────────────────────────────────────────────────────────────────

const SOCIAL_PROOFS = [
  { city: "Sydney", country: "Australia", action: "Started bot automation" },
  { city: "London", country: "UK", action: "Joined copy trading" },
  { city: "Dubai", country: "UAE", action: "Upgraded to Pro" },
  { city: "New York", country: "USA", action: "Activated trading bot" },
  { city: "Singapore", country: "SG", action: "Started free trial" },
]

const TICKER_ITEMS = [
  { pair: "XAU/USD", change: "+2.31%", positive: true },
  { pair: "EUR/USD", change: "+1.42%", positive: true },
  { pair: "BTC/USD", change: "+3.87%", positive: true },
  { pair: "GBP/USD", change: "+0.65%", positive: true },
  { pair: "USD/JPY", change: "-0.43%", positive: false },
  { pair: "ETH/USD", change: "+5.21%", positive: true },
  { pair: "GBP/JPY", change: "+0.87%", positive: true },
  { pair: "USD/CAD", change: "-0.31%", positive: false },
  { pair: "AUD/USD", change: "+1.15%", positive: true },
  { pair: "NZD/USD", change: "+0.72%", positive: true },
  { pair: "SOL/USD", change: "+4.60%", positive: true },
  { pair: "USD/CHF", change: "-0.18%", positive: false },
]

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Results", href: "#results" },
  { label: "Pricing", href: "/pricing" },
  { label: "Education", href: "/learn" },
  { label: "Contact", href: "#contact" },
]

const HERO_FEATURES = ["Trading Journal", "Bot Automation", "Copy Trading", "Structured Education"]

const PLATFORM_FEATURES = [
  "Real-time push notifications on every trade",
  "One-tap bot start/stop from any device",
  "Log and review trades from your phone",
  "Works on web, iOS, and Android",
]

const TECH_CARDS = [
  {
    icon: "🤖",
    title: "Smart Entry Detection",
    desc: "Our AI scans multiple timeframes simultaneously to identify high-probability setups — no guessing, no emotions, no random signals.",
  },
  {
    icon: "⚡",
    title: "Multi-Exchange Execution",
    desc: "Connect Binance, Bybit, MT4/MT5 and more. FXAU executes across all your accounts in real time from one unified dashboard.",
  },
  {
    icon: "📡",
    title: "Copy Trading Engine",
    desc: "Mirror verified expert traders automatically. Set your risk tolerance, pick your trader, and let profits follow on autopilot.",
  },
]

const TRUST_BLOCKS = [
  {
    icon: "💎",
    title: "Transparent Pricing",
    body: "No hidden fees, no surprise charges. Your plan is clearly priced and you can cancel anytime. What you see on the pricing page is exactly what you pay — always.",
  },
  {
    icon: "⚠️",
    title: "Trading Disclaimer",
    body: "Trading forex, crypto, and CFDs involves significant risk of loss and is not suitable for all investors. Past performance does not guarantee future results. FXAU is an automation and journaling tool — not financial advice. Only risk capital you can afford to lose.",
  },
  {
    icon: "🤝",
    title: "Real Human Support",
    body: "Have a question? Our team is real traders who use the platform themselves. Reach us anytime on Telegram or by email and we'll respond within hours — 24/7.",
    link: { label: "t.me/fxausupport", href: "https://t.me/fxausupport" },
  },
]

const FAQS: { q: string; a: string }[] = [
  { q: "Which markets does FXAU support?", a: "FXAU supports forex (XAUUSD, EURUSD, GBPUSD, and more), crypto (BTC, ETH, SOL, etc.), and CFDs. Connect MT4, MT5, Binance, Bybit, or any major exchange via API." },
  { q: "Does it work on MetaTrader?", a: "Yes. FXAU integrates with both MT4 and MT5 via our bridge connector. Setup takes under 5 minutes and our onboarding wizard walks you through every step." },
  { q: "How do I get started?", a: "Create a free account, connect your broker or exchange API, configure your bot settings, and press activate. The onboarding wizard guides you step by step with no technical knowledge required." },
  { q: "What happens right after I sign up?", a: "You get instant access to the full dashboard. Start your trading journal, launch your first bot, or browse copy traders immediately — no waiting period." },
  { q: "Can I try FXAU for free?", a: "Yes. The free plan includes the trading journal and one active bot. Upgrade anytime for unlimited bots, copy trading access, full education library, and priority support." },
  { q: "Is the AI just sending random signals?", a: "No. FXAU automation is rules-based and data-driven. Your bot follows the exact strategy you configure. The AI-assisted entry detection is an optional enhancement layer — not a black box." },
  { q: "Which broker should I use?", a: "FXAU works with any MT4/MT5 broker or exchange with API access. For best results we recommend brokers with tight spreads and fast execution. Contact us on Telegram for a personal recommendation." },
  { q: "Are profits guaranteed?", a: "No — and any platform that claims that is lying. Trading involves real risk. FXAU gives you better tools, automation, and insights — your results depend on your strategy and market conditions." },
  { q: "How do I contact support?", a: "Join our Telegram community at t.me/fxausupport or email us at support@fxau.io. Our team responds within hours, every day of the week." },
]

const RECENT_TRADES = [
  { pair: "XAUUSD", side: "BUY", pnl: "+$284", pct: "+1.8%" },
  { pair: "EURUSD", side: "SELL", pnl: "+$127", pct: "+0.9%" },
  { pair: "BTCUSD", side: "BUY", pnl: "+$512", pct: "+3.2%" },
]

const CHART_PATH = "M0,80 C20,75 35,60 55,55 C75,50 85,65 105,55 C125,45 135,30 155,25 C175,20 185,35 205,28 C225,21 235,10 255,8 L255,100 L0,100 Z"
const CHART_LINE = "M0,80 C20,75 35,60 55,55 C75,50 85,65 105,55 C125,45 135,30 155,25 C175,20 185,35 205,28 C225,21 235,10 255,8"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const grad = "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)"
const gradText: React.CSSProperties = {
  background: grad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}
const container: React.CSSProperties = { maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }
const sectionPad: React.CSSProperties = { padding: "6rem 2rem" }

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [proofIndex, setProofIndex] = useState(0)
  const [proofVisible, setProofVisible] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setProofVisible(false)
      setTimeout(() => {
        setProofIndex((i) => (i + 1) % SOCIAL_PROOFS.length)
        setProofVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const proof = SOCIAL_PROOFS[proofIndex]
  const allTickers = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div style={{ background: "#08090E", color: "#F0F2F7", fontFamily: "var(--font-dm-sans, sans-serif)", overflowX: "hidden" }}>

      {/* ══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,9,14,0.88)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 2rem", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>FX</div>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space-grotesk, sans-serif)", ...gradText }}>FXAU</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href} style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F0F2F7")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8B93A8")}
            >{l.label}</Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign In</Link>
          <Link href="/register" style={{ padding: "8px 22px", borderRadius: 999, background: grad, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(79,142,247,0.3)", letterSpacing: "0.02em" }}>GET STARTED</Link>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", ...sectionPad, maxWidth: 1280, margin: "0 auto", gap: "4rem" }}>
        {/* Left */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* Live badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.35)", background: "rgba(79,142,247,0.08)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#4F8EF7", alignSelf: "flex-start" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4F8EF7", boxShadow: "0 0 6px #4F8EF7", animation: "livePulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
            AI-POWERED TRADING PLATFORM
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "var(--font-space-grotesk, sans-serif)", fontSize: "clamp(2.6rem,6vw,4.2rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em", margin: 0 }}>
            The Future of<br />
            <span style={gradText}>Automated Trading</span>
          </h1>

          {/* Sub */}
          <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 480, margin: 0 }}>
            FXAU executes precision trades across every market using advanced AI automation. Journal, automate, copy, and learn — all in one platform. Always on.
          </p>

          {/* Feature checks */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px" }}>
            {HERO_FEATURES.map(f => (
              <span key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#8B93A8", fontWeight: 500 }}>
                <span style={{ color: "#4F8EF7", fontWeight: 800 }}>✓</span> {f}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 30px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", textDecoration: "none", boxShadow: "0 6px 24px rgba(79,142,247,0.35)" }}>
              🚀 GET STARTED FREE
            </Link>
            <Link href="#results" style={{ display: "inline-flex", alignItems: "center", padding: "13px 28px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", color: "#F0F2F7", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", textDecoration: "none" }}>
              VIEW RESULTS
            </Link>
            <a href="https://t.me/fxaubot" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.3)", color: "#4F8EF7", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", textDecoration: "none", background: "rgba(79,142,247,0.07)" }}>
              ✈️ JOIN TELEGRAM
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 12, background: "#111318", border: "1px solid rgba(255,255,255,0.08)", alignSelf: "flex-start", opacity: proofVisible ? 1 : 0, transform: proofVisible ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.4s, transform 0.4s" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>📈</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F2F7" }}>{proof.action} — {proof.city}</div>
              <div style={{ fontSize: 11, color: "#525A6E", marginTop: 1 }}>{proof.country} · just now</div>
            </div>
          </div>
        </div>

        {/* Right: Dashboard mockup */}
        <div style={{ flex: "1 1 440px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 440, borderRadius: 20, border: "1px solid rgba(79,142,247,0.2)", background: "linear-gradient(145deg,#111318,#0D0F16)", boxShadow: "0 0 60px rgba(79,142,247,0.12), 0 24px 64px rgba(0,0,0,0.6)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: "#525A6E", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>LIVE PORTFOLIO</div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-space-grotesk,sans-serif)" }}>
                  $24,861 <span style={{ fontSize: 14, fontWeight: 600, color: "#00D084" }}>+18.4%</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 6px #00D084" }} />
                <span style={{ fontSize: 12, color: "#00D084", fontWeight: 700 }}>LIVE</span>
              </div>
            </div>
            {/* Chart */}
            <div style={{ padding: "1rem 1.5rem 0" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: "0.5rem" }}>
                {["1D", "1W", "1M", "ALL"].map((t, i) => (
                  <span key={t} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: i === 1 ? "rgba(79,142,247,0.15)" : "transparent", color: i === 1 ? "#4F8EF7" : "#525A6E", border: i === 1 ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent" }}>{t}</span>
                ))}
              </div>
            </div>
            <svg viewBox="0 0 255 100" style={{ width: "100%", height: 110, display: "block" }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F8EF7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4F8EF7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={CHART_PATH} fill="url(#cg)" />
              <path d={CHART_LINE} fill="none" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" />
              <circle cx="255" cy="8" r="4" fill="#4F8EF7" />
              <circle cx="255" cy="8" r="8" fill="rgba(79,142,247,0.25)" />
            </svg>
            {/* Trades */}
            <div style={{ padding: "1rem 1.5rem 1.25rem" }}>
              <div style={{ fontSize: 11, color: "#525A6E", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "0.75rem" }}>RECENT TRADES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {RECENT_TRADES.map(t => (
                  <div key={t.pair} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(79,142,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#4F8EF7" }}>{t.pair.slice(0, 2)}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.pair}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.side === "BUY" ? "#4F8EF7" : "#7B5CF0", letterSpacing: "0.04em" }}>{t.side}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#00D084" }}>{t.pnl}</div>
                      <div style={{ fontSize: 10, color: "#00D084", opacity: 0.7 }}>{t.pct}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Bot bar */}
            <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8, background: "rgba(79,142,247,0.05)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 5px #00D084" }} />
              <span style={{ fontSize: 12, color: "#8B93A8" }}>3 bots active · next trade in <span style={{ color: "#4F8EF7" }}>~2m</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PERFORMANCE TICKER ════════════════════════════════════════════════ */}
      <div id="results" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0D0F16", overflow: "hidden", padding: "1rem 0" }}>
        <div style={{ display: "flex", animation: "ticker 28s linear infinite", width: "max-content" }}>
          {allTickers.map((item, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 2rem", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#F0F2F7", letterSpacing: "0.02em" }}>{item.pair}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: item.positive ? "#00D084" : "#FF4B6E" }}>{item.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PLATFORM SECTION ═════════════════════════════════════════════════ */}
      <section id="features" style={{ ...sectionPad }}>
        <div style={{ ...container, display: "flex", alignItems: "center", gap: "5rem" }}>
          {/* Left: Phone mockup */}
          <div style={{ flex: "1 1 380px", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 260 }}>
              {/* Phone frame */}
              <div style={{ width: 260, borderRadius: 36, border: "2px solid rgba(79,142,247,0.25)", background: "linear-gradient(160deg,#111318,#0D0F16)", boxShadow: "0 0 50px rgba(79,142,247,0.1), 0 30px 80px rgba(0,0,0,0.7)", overflow: "hidden", padding: "1.5rem 1rem" }}>
                {/* Status bar */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", padding: "0 4px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#525A6E" }}>9:41</span>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <div style={{ width: 14, height: 8, borderRadius: 2, border: "1px solid #525A6E", position: "relative" }}>
                      <div style={{ position: "absolute", left: 1, top: 1, bottom: 1, width: "80%", borderRadius: 1, background: "#00D084" }} />
                    </div>
                  </div>
                </div>
                {/* App header */}
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-space-grotesk,sans-serif)", marginBottom: "0.75rem", ...gradText }}>FXAU Mobile</div>
                {/* Mini chart */}
                <svg viewBox="0 0 220 60" style={{ width: "100%", height: 60, display: "block", marginBottom: "0.75rem" }}>
                  <defs>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F8EF7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#4F8EF7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,50 C30,45 50,35 75,30 C100,25 115,38 140,28 C165,18 185,10 220,5 L220,60 L0,60 Z" fill="url(#mg)" />
                  <path d="M0,50 C30,45 50,35 75,30 C100,25 115,38 140,28 C165,18 185,10 220,5" fill="none" stroke="#4F8EF7" strokeWidth="2" />
                </svg>
                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "0.75rem" }}>
                  {[{ label: "Today P&L", val: "+$284", color: "#00D084" }, { label: "Win Rate", val: "73%", color: "#4F8EF7" }].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 10, color: "#525A6E", marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                {/* Bot toggle */}
                <div style={{ background: "rgba(79,142,247,0.08)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#4F8EF7" }}>AUTO TRADE</div>
                    <div style={{ fontSize: 10, color: "#525A6E", marginTop: 2 }}>3 bots running</div>
                  </div>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: grad, position: "relative" }}>
                    <div style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#fff" }} />
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div style={{ position: "absolute", inset: "-20px", borderRadius: 50, background: "radial-gradient(ellipse at 50% 50%, rgba(79,142,247,0.08) 0%, transparent 70%)", zIndex: -1 }} />
            </div>
          </div>

          {/* Right: Text */}
          <div style={{ flex: "1 1 460px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7" }}>MOBILE & WEB PLATFORM</div>
            <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0 }}>
              Trade from<br /><span style={gradText}>your pocket</span>
            </h2>
            <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, margin: 0 }}>
              The FXAU platform runs natively on web, iOS, and Android — keeping your bots, journal, and copy trades in sync wherever you are. No desktop required.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PLATFORM_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: "#4F8EF7", fontSize: 11, fontWeight: 800 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 15, color: "#8B93A8", lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/register" style={{ alignSelf: "flex-start", padding: "12px 28px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 18px rgba(79,142,247,0.3)", letterSpacing: "0.04em", marginTop: "0.5rem" }}>
              START FREE TRIAL
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TECHNOLOGY SECTION ════════════════════════════════════════════════ */}
      <section style={{ ...sectionPad, background: "#0D0F16" }}>
        <div style={container}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "1rem" }}>CORE TECHNOLOGY</div>
            <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              Not random signals.<br /><span style={gradText}>Real AI analysis.</span>
            </h2>
            <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 520, margin: "0 auto" }}>
              The FXAU engine doesn&apos;t guess. It uses rules-based automation layered with AI-powered market analysis to detect genuine high-probability opportunities.
            </p>
          </div>
          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {TECH_CARDS.map(card => (
              <div key={card.title} style={{ padding: "2rem", borderRadius: 16, background: "#111318", border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(79,142,247,0.3)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)" }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: "1.25rem" }}>{card.icon}</div>
                <h3 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: 18, fontWeight: 700, marginBottom: "0.75rem", color: "#F0F2F7" }}>{card.title}</h3>
                <p style={{ color: "#8B93A8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST / BUY WITH CONFIDENCE ══════════════════════════════════════ */}
      <section style={{ ...sectionPad }}>
        <div style={container}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "1rem" }}>TRANSPARENCY FIRST</div>
            <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              Trade with <span style={gradText}>confidence</span>
            </h2>
            <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 500, margin: "0 auto" }}>
              We keep things transparent. Here is exactly what you get, what to expect, and how we protect you.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {TRUST_BLOCKS.map(block => (
              <div key={block.title} style={{ padding: "2rem", borderRadius: 16, background: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 28, marginBottom: "1rem" }}>{block.icon}</div>
                <h3 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: 18, fontWeight: 700, marginBottom: "0.75rem", color: "#F0F2F7" }}>{block.title}</h3>
                <p style={{ color: "#8B93A8", fontSize: 14, lineHeight: 1.75, margin: 0 }}>{block.body}</p>
                {block.link && (
                  <a href={block.link.href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "1rem", color: "#4F8EF7", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    ✈️ {block.link.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
      <section style={{ ...sectionPad, background: "#0D0F16" }}>
        <div style={{ ...container, maxWidth: 720 }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "1rem" }}>FAQ</div>
            <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2rem,4vw,2.6rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0 }}>
              Common <span style={gradText}>questions</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderRadius: 14, border: `1px solid ${openFaq === i ? "rgba(79,142,247,0.3)" : "rgba(255,255,255,0.07)"}`, background: "#111318", overflow: "hidden", transition: "border-color 0.2s" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", textAlign: "left", padding: "1.1rem 1.5rem", background: "transparent", border: "none", color: "#F0F2F7", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: "#4F8EF7", fontSize: 20, fontWeight: 300, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 1.5rem 1.25rem", color: "#8B93A8", fontSize: 14, lineHeight: 1.75 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RISK WARNING ════════════════════════════════════════════════════== */}
      <div style={{ background: "rgba(255,75,110,0.06)", borderTop: "1px solid rgba(255,75,110,0.15)", borderBottom: "1px solid rgba(255,75,110,0.15)", padding: "1.25rem 2rem" }}>
        <div style={{ ...container, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <p style={{ color: "#8B93A8", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: "#F0F2F7" }}>Risk Warning:</strong> Trading is risky and profits are not guaranteed. FXAU is designed to assist with automation, journaling, and education — not to guarantee returns. Only trade with money you can afford to lose. Please read our full disclaimer before using the platform.
          </p>
        </div>
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer id="contact" style={{ background: "#08090E", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "4rem 2rem 2rem" }}>
        <div style={{ ...container }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
            {/* Brand col */}
            <div>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: "1rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>FX</div>
                <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space-grotesk,sans-serif)", ...gradText }}>FXAU</span>
              </Link>
              <p style={{ color: "#525A6E", fontSize: 13, lineHeight: 1.75, maxWidth: 260, marginBottom: "1.5rem" }}>
                Professional trading journal, multi-exchange bot automation, copy trading, and structured education — all in one platform.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "TG", href: "https://t.me/fxaubot" },
                  { label: "IG", href: "#" },
                  { label: "TW", href: "#" },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B93A8", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#525A6E", marginBottom: "1rem" }}>PLATFORM</div>
              {["Trading Journal", "Bot Automation", "Copy Trading", "Education", "Analytics"].map(l => (
                <div key={l} style={{ marginBottom: "0.6rem" }}>
                  <Link href="/dashboard" style={{ color: "#8B93A8", fontSize: 14, textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#525A6E", marginBottom: "1rem" }}>COMPANY</div>
              {["About", "Pricing", "Blog", "Careers", "Contact"].map(l => (
                <div key={l} style={{ marginBottom: "0.6rem" }}>
                  <Link href="#" style={{ color: "#8B93A8", fontSize: 14, textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#525A6E", marginBottom: "1rem" }}>LEGAL</div>
              {["Terms of Service", "Privacy Policy", "Risk Disclosure", "Refund Policy"].map(l => (
                <div key={l} style={{ marginBottom: "0.6rem" }}>
                  <Link href="#" style={{ color: "#8B93A8", fontSize: 14, textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#525A6E", fontSize: 12 }}>© {new Date().getFullYear()} FXAU. All rights reserved.</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 5px #00D084" }} />
              <span style={{ color: "#525A6E", fontSize: 12 }}>24/7 AI Support active</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ══ FIXED: 24/7 SUPPORT ════════════════════════════════════════════== */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "#111318", border: "1px solid rgba(79,142,247,0.25)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 40, cursor: "pointer" }}>
        <span style={{ fontSize: 14 }}>💬</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8EF7", letterSpacing: "0.04em" }}>24/7 AI SUPPORT</span>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 5px #00D084" }} />
      </div>

      {/* ══ KEYFRAMES ══════════════════════════════════════════════════════== */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
