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

const ALL_FEATURES = [
  {
    icon: "📓",
    title: "Automated Journaling",
    desc: "Connect your broker once and every trade is logged automatically — entries, exits, P&L, screenshots, and more.",
    color: "#4F8EF7",
  },
  {
    icon: "🔬",
    title: "Backtesting",
    desc: "Test your strategy against years of historical data before risking a single dollar in live markets.",
    color: "#7B5CF0",
  },
  {
    icon: "▶️",
    title: "Trade Replay",
    desc: "Replay any past trade tick-by-tick to understand exactly what happened and refine your decision-making.",
    color: "#4F8EF7",
  },
  {
    icon: "🧠",
    title: "AI Insights",
    desc: "Get personalised AI analysis of your trading patterns — mistakes, strengths, and actionable improvements.",
    color: "#7B5CF0",
  },
  {
    icon: "👥",
    title: "Community",
    desc: "Join thousands of traders sharing setups, playbooks, and performance reports inside the FXAU community.",
    color: "#4F8EF7",
  },
  {
    icon: "🏆",
    title: "Prop Firm Sync",
    desc: "Automatically sync your prop firm account, track your challenge phase, and stay within all firm rules.",
    color: "#7B5CF0",
  },
  {
    icon: "📊",
    title: "Reports",
    desc: "50+ detailed performance reports — by session, pair, day of week, setup type, and much more.",
    color: "#4F8EF7",
  },
  {
    icon: "📐",
    title: "Strategy Tracking",
    desc: "Build playbooks for every setup, track how each strategy performs over time, and double down on what works.",
    color: "#7B5CF0",
  },
]

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Results", href: "#results" },
  { label: "Pricing", href: "/pricing" },
  { label: "Education", href: "/learn" },
  { label: "Contact", href: "#contact" },
]

const HERO_FEATURES = ["Trading Journal", "Bot Automation", "Copy Trading", "Backtesting", "Trade Replays", "Community", "Structured Education"]

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
  const [pnl, setPnl] = useState(0)
  const [chartKey, setChartKey] = useState(0)
  const [journalKey, setJournalKey] = useState(0)
  const [scene, setScene] = useState(0)
  const [sceneProgress, setSceneProgress] = useState(0)

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

  useEffect(() => {
    const TARGET = 24861
    const DURATION = 2600
    const animate = () => {
      setPnl(0)
      const t0 = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - t0) / DURATION, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setPnl(Math.floor(eased * TARGET))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    animate()
    const loop = setInterval(() => {
      setChartKey((k) => k + 1)
      setJournalKey((k) => k + 1)
      animate()
    }, 8000)
    return () => clearInterval(loop)
  }, [])

  useEffect(() => {
    const SCENE_DURATION = 4000
    const SCENES = 3
    let progress = 0
    const tick = setInterval(() => {
      progress += 100 / (SCENE_DURATION / 50)
      if (progress >= 100) {
        progress = 0
        setScene((s) => (s + 1) % SCENES)
      }
      setSceneProgress(progress)
    }, 50)
    return () => clearInterval(tick)
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
            FXAU executes precision trades across every market using advanced AI automation. Journal, automate, copy, Backtesting and learn — all in one platform. Always on.
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

        {/* Right: Multi-scene product demo */}
        <div style={{ flex: "1 1 480px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 480, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(79,142,247,0.22)", background: "#0D0F16", boxShadow: "0 0 80px rgba(79,142,247,0.14), 0 32px 80px rgba(0,0,0,0.7)" }}>

            {/* Browser chrome */}
            <div style={{ padding: "0.65rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8, background: "#08090E" }}>
              <div style={{ display: "flex", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
              </div>
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "3px 16px", fontSize: 11, color: "#525A6E" }}>
                  {scene === 0 ? "fxau.app/dashboard/journal" : scene === 1 ? "fxau.app/dashboard/analytics" : "fxau.app/dashboard/bot"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 5px #00D084", animation: "livePulse 1.5s ease-in-out infinite" }} />
                <span style={{ fontSize: 10, color: "#00D084", fontWeight: 700 }}>LIVE</span>
              </div>
            </div>

            {/* Scene content */}
            <div style={{ height: 340, overflow: "hidden", position: "relative" }}>

              {/* ── SCENE 0: Trading Journal ── */}
              <div style={{ position: "absolute", inset: 0, opacity: scene === 0 ? 1 : 0, transition: "opacity 0.5s ease", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "0.6rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "1.5rem" }}>
                  {[{ l: "Total P&L", v: `$${pnl.toLocaleString()}`, c: "#00D084" }, { l: "Win Rate", v: "73%", c: "#4F8EF7" }, { l: "Trades", v: "48", c: "#F0F2F7" }].map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: 9, color: "#525A6E", fontWeight: 600 }}>{s.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "var(--font-space-grotesk,sans-serif)" }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "0.4rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "80px 46px 1fr 58px 44px", gap: 4 }}>
                  {["Symbol", "Side", "Notes", "P&L", "R"].map(h => <span key={h} style={{ fontSize: 9, color: "#525A6E", fontWeight: 700, letterSpacing: "0.05em" }}>{h}</span>)}
                </div>
                {[
                  { sym: "XAUUSD", side: "LONG",  note: "London breakout retest",   pnl: "+$341", r: "+2.1R", win: true },
                  { sym: "BTCUSD", side: "LONG",  note: "Support bounce tight SL",  pnl: "+$512", r: "+3.2R", win: true },
                  { sym: "GBPUSD", side: "SHORT", note: "Resistance rejection",      pnl: "-$89",  r: "-0.6R", win: false },
                  { sym: "EURUSD", side: "SHORT", note: "News candle fade",          pnl: "+$127", r: "+0.9R", win: true },
                  { sym: "XAUUSD", side: "LONG",  note: "Asian session breakout",   pnl: "+$284", r: "+1.8R", win: true },
                ].map((row, i) => (
                  <div key={row.sym + i} style={{ display: "grid", gridTemplateColumns: "80px 46px 1fr 58px 44px", padding: "0.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center", background: i === 0 ? "rgba(79,142,247,0.05)" : "transparent", opacity: 0, animation: scene === 0 ? `slideInRow 0.35s ease ${i * 0.15}s forwards` : "none" }}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{row.sym}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: row.side === "LONG" ? "#4F8EF7" : "#7B5CF0" }}>{row.side}</span>
                    <span style={{ fontSize: 10, color: "#525A6E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.note}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: row.win ? "#00D084" : "#FF4B6E" }}>{row.pnl}</span>
                    <span style={{ fontSize: 10, color: row.win ? "#00D084" : "#FF4B6E" }}>{row.r}</span>
                  </div>
                ))}
              </div>

              {/* ── SCENE 1: Chart Analysis ── */}
              <div style={{ position: "absolute", inset: 0, opacity: scene === 1 ? 1 : 0, transition: "opacity 0.5s ease", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "0.6rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>XAUUSD</span>
                    <span style={{ padding: "2px 7px", borderRadius: 4, background: "rgba(79,142,247,0.12)", color: "#4F8EF7", fontSize: 10, fontWeight: 700 }}>LONG</span>
                    <span style={{ padding: "2px 7px", borderRadius: 4, background: "rgba(0,208,132,0.1)", color: "#00D084", fontSize: 10, fontWeight: 700 }}>WIN</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#00D084" }}>+$1,247</span>
                </div>
                <div style={{ padding: "0.4rem 0.85rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6 }}>
                  {["1m", "5m", "15m", "1H", "4H"].map((t, i) => (
                    <span key={t} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: i === 3 ? "rgba(79,142,247,0.15)" : "transparent", color: i === 3 ? "#4F8EF7" : "#525A6E" }}>{t}</span>
                  ))}
                </div>
                <svg key={`sc1-${scene}`} viewBox="0 0 440 200" style={{ flex: 1, width: "100%", display: "block" }}>
                  {[50, 100, 150].map(y => <line key={y} x1="0" y1={y} x2="440" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                  <line x1="0" y1="138" x2="440" y2="138" stroke="rgba(79,142,247,0.45)" strokeWidth="1" strokeDasharray="5,4" />
                  <text x="8" y="133" fill="#4F8EF7" fontSize="9" fontWeight="700">ENTRY 2312</text>
                  <line x1="0" y1="55" x2="440" y2="55" stroke="rgba(0,208,132,0.45)" strokeWidth="1" strokeDasharray="5,4" />
                  <text x="8" y="50" fill="#00D084" fontSize="9" fontWeight="700">EXIT 2321</text>
                  <line x1="0" y1="172" x2="440" y2="172" stroke="rgba(255,75,110,0.35)" strokeWidth="1" strokeDasharray="3,5" />
                  <text x="8" y="168" fill="#FF4B6E" fontSize="8">SL 2308</text>
                  {[
                    [20,160,168,155,175],[42,168,162,158,174],[64,162,170,157,176],[86,170,175,165,180],
                    [108,175,168,163,180],[130,168,174,162,178],[152,174,155,148,178],[174,155,142,138,158],
                    [196,142,130,126,146],[218,130,118,114,134],[240,118,105,102,122],[262,105,95,92,110],
                    [284,95,80,76,98],[306,80,68,65,84],[328,68,72,64,76],[350,72,58,55,75],
                    [372,58,48,44,62],[394,48,40,37,52],[416,40,34,30,44],
                  ].map(([x, open, close, high, low], i) => {
                    const bull = close < open; const col = bull ? "#00D084" : "#FF4B6E"
                    return <g key={i}><line x1={x+6} y1={high} x2={x+6} y2={low} stroke={col} strokeWidth="1.5" /><rect x={x} y={Math.min(open,close)} width="12" height={Math.max(Math.abs(open-close),2)} fill={col} fillOpacity={bull?1:0.7} rx="1" /></g>
                  })}
                  <polygon points="160,148 168,138 176,148" fill="#4F8EF7" opacity="0.9" />
                  <polygon points="404,65 412,55 420,65" fill="#00D084" opacity="0.9" />
                </svg>
              </div>

              {/* ── SCENE 2: Bot Dashboard ── */}
              <div style={{ position: "absolute", inset: 0, opacity: scene === 2 ? 1 : 0, transition: "opacity 0.5s ease", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F0F2F7" }}>Active Bots</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 5px #00D084" }} />
                    <span style={{ fontSize: 11, color: "#00D084", fontWeight: 700 }}>3 Running</span>
                  </div>
                </div>
                {[
                  { name: "XAUUSD Scalper", pair: "XAU/USD", trades: 12, pnl: "+$841", status: "IN TRADE", color: "#4F8EF7" },
                  { name: "EUR Trend Bot", pair: "EUR/USD", trades: 8, pnl: "+$312", status: "WAITING", color: "#00D084" },
                  { name: "BTC Breakout", pair: "BTC/USD", trades: 5, pnl: "+$627", status: "IN TRADE", color: "#4F8EF7" },
                ].map((bot, i) => (
                  <div key={bot.name} style={{ padding: "0.85rem 1rem", borderRadius: 12, background: "#111318", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0, animation: scene === 2 ? `slideInRow 0.35s ease ${i * 0.15}s forwards` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{bot.name}</div>
                        <div style={{ fontSize: 11, color: "#525A6E" }}>{bot.pair} · {bot.trades} trades</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#00D084" }}>{bot.pnl}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: bot.color, letterSpacing: "0.06em" }}>{bot.status}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "0.75rem 1rem", borderRadius: 10, background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.18)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#8B93A8" }}>Combined P&L today</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#00D084" }}>+$1,780</span>
                </div>
              </div>
            </div>

            {/* Video player controls */}
            <div style={{ padding: "0.6rem 1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#08090E" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
                <span style={{ fontSize: 14, color: "#4F8EF7", cursor: "pointer" }}>▶</span>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#4F8EF7,#7B5CF0)", width: `${(scene * 100 / 3) + sceneProgress / 3}%`, transition: "width 0.05s linear" }} />
                </div>
                <span style={{ fontSize: 10, color: "#525A6E", fontFamily: "var(--font-mono,monospace)", whiteSpace: "nowrap" }}>
                  0:{String(Math.floor((scene * 4) + (sceneProgress / 100 * 4))).padStart(2, "0")} / 0:12
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["Journal", "Analytics", "Bot Manager"].map((label, i) => (
                  <div key={label} onClick={() => setScene(i)} style={{ padding: "3px 9px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", background: scene === i ? "rgba(79,142,247,0.18)" : "rgba(255,255,255,0.04)", color: scene === i ? "#4F8EF7" : "#525A6E", border: `1px solid ${scene === i ? "rgba(79,142,247,0.35)" : "transparent"}`, transition: "all 0.2s" }}>
                    {label}
                  </div>
                ))}
              </div>
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

      {/* ══ ALL FEATURES ═════════════════════════════════════════════════════ */}
      <section id="features" style={{ ...sectionPad, background: "#0D0F16" }}>
        <div style={container}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "1rem" }}>EVERYTHING YOU NEED</div>
            <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              One platform. <span style={gradText}>Every edge.</span>
            </h2>
            <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 500, margin: "0 auto" }}>
              Everything a serious trader needs — journaling, automation, analysis, and community — built into one seamless platform.
            </p>
          </div>

          {/* 4 × 2 feature grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
            {ALL_FEATURES.map((f, i) => (
              <div
                key={f.title}
                style={{
                  padding: "1.75rem 1.5rem",
                  borderRadius: 16,
                  background: "#111318",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.9rem",
                  transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = `rgba(${i % 2 === 0 ? "79,142,247" : "123,92,240"},0.4)`
                  el.style.transform = "translateY(-5px)"
                  el.style.boxShadow = `0 12px 40px rgba(${i % 2 === 0 ? "79,142,247" : "123,92,240"},0.1)`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = "rgba(255,255,255,0.07)"
                  el.style.transform = "translateY(0)"
                  el.style.boxShadow = "none"
                }}
              >
                {/* Icon badge */}
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: `rgba(${i % 2 === 0 ? "79,142,247" : "123,92,240"},0.1)`,
                  border: `1px solid rgba(${i % 2 === 0 ? "79,142,247" : "123,92,240"},0.2)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: 15, fontWeight: 700, color: "#F0F2F7", margin: "0 0 0.5rem" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "#8B93A8", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
                {/* Bottom accent line */}
                <div style={{ height: 2, borderRadius: 1, background: `linear-gradient(90deg, rgba(${i % 2 === 0 ? "79,142,247" : "123,92,240"},0.5), transparent)`, marginTop: "auto" }} />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: "center", marginTop: "3rem", display: "flex", justifyContent: "center", gap: 12 }}>
            <Link href="/register" style={{ padding: "13px 32px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 6px 24px rgba(79,142,247,0.3)", letterSpacing: "0.04em" }}>
              Start Free — No Credit Card
            </Link>
            <Link href="/pricing" style={{ padding: "13px 28px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", color: "#F0F2F7", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ══ PLATFORM SECTION ═════════════════════════════════════════════════ */}
      <section style={{ ...sectionPad }}>
        <div style={{ ...container, display: "flex", alignItems: "center", gap: "5rem" }}>
          {/* Left: Big animated phone — live portfolio */}
          <div style={{ flex: "0 0 340px", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
            <div style={{ position: "relative", width: 340 }}>
              {/* Glow */}
              <div style={{ position: "absolute", inset: "-40px", borderRadius: 80, background: "radial-gradient(ellipse at 50% 40%, rgba(79,142,247,0.13) 0%, transparent 70%)", zIndex: -1 }} />

              {/* Phone shell */}
              <div style={{ width: 340, borderRadius: 50, border: "2px solid rgba(79,142,247,0.3)", background: "linear-gradient(160deg,#131620,#0A0B10)", boxShadow: "0 0 70px rgba(79,142,247,0.15), 0 50px 120px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.07)", overflow: "hidden" }}>

                {/* Dynamic island */}
                <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 6px" }}>
                  <div style={{ width: 110, height: 30, borderRadius: 15, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1c1c1c", border: "1.5px solid #2a2a2a" }} />
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2a2a2a" }} />
                  </div>
                </div>

                <div style={{ padding: "0 1.35rem 1.75rem" }}>
                  {/* Status bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#F0F2F7" }}>9:41</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
                        {[7, 10, 13, 16].map((h, i) => (
                          <div key={i} style={{ width: 3, height: h, borderRadius: 1.5, background: i < 3 ? "#F0F2F7" : "rgba(255,255,255,0.25)" }} />
                        ))}
                      </div>
                      <div style={{ width: 24, height: 12, borderRadius: 3, border: "1.5px solid rgba(255,255,255,0.4)", position: "relative", marginLeft: 2 }}>
                        <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, width: "78%", borderRadius: 1, background: "#00D084" }} />
                        <div style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 3, height: 6, borderRadius: "0 1px 1px 0", background: "rgba(255,255,255,0.3)" }} />
                      </div>
                    </div>
                  </div>

                  {/* App header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>FX</div>
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-space-grotesk,sans-serif)", ...gradText }}>FXAU</span>
                    </div>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🔔</div>
                      <div style={{ position: "absolute", top: -3, right: -3, width: 10, height: 10, borderRadius: "50%", background: "#FF4B6E", border: "1.5px solid #0A0B10", animation: "livePulse 2s ease-in-out infinite" }} />
                    </div>
                  </div>

                  {/* Portfolio value — animated counter */}
                  <div style={{ marginBottom: "1.1rem" }}>
                    <div style={{ fontSize: 10, color: "#525A6E", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>TOTAL PORTFOLIO VALUE</div>
                    <div style={{ fontSize: 34, fontWeight: 900, fontFamily: "var(--font-space-grotesk,sans-serif)", color: "#F0F2F7", lineHeight: 1, letterSpacing: "-0.02em" }}>
                      ${pnl.toLocaleString()}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#00D084", display: "flex", alignItems: "center", gap: 3 }}>▲ +18.4%</span>
                      <span style={{ fontSize: 11, color: "#525A6E" }}>this month</span>
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 5px #00D084", animation: "livePulse 1.5s ease-in-out infinite" }} />
                        <span style={{ fontSize: 10, color: "#00D084", fontWeight: 700 }}>LIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Animated chart */}
                  <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 16, padding: "0.75rem 0.6rem 0.4rem", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.9rem" }}>
                    <div style={{ display: "flex", gap: 5, marginBottom: "0.5rem" }}>
                      {["1D","1W","1M","3M"].map((t, i) => (
                        <span key={t} style={{ padding: "2px 9px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: i === 1 ? "rgba(79,142,247,0.18)" : "transparent", color: i === 1 ? "#4F8EF7" : "#525A6E", border: i === 1 ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent" }}>{t}</span>
                      ))}
                    </div>
                    <svg key={`ph-${chartKey}`} viewBox="0 0 295 75" style={{ width: "100%", height: 75, display: "block" }}>
                      <defs>
                        <linearGradient id="pmg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4F8EF7" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#4F8EF7" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,62 C22,57 38,44 60,38 C80,33 96,47 120,36 C144,25 158,14 185,9 C205,5 222,12 248,7 L295,4 L295,75 L0,75 Z" fill="url(#pmg)" style={{ animation: "chartFillIn 0.5s ease 2s both" }} />
                      <path d="M0,62 C22,57 38,44 60,38 C80,33 96,47 120,36 C144,25 158,14 185,9 C205,5 222,12 248,7 L295,4" fill="none" stroke="#4F8EF7" strokeWidth="2.5" strokeLinecap="round" style={{ strokeDasharray: 480, strokeDashoffset: 480, animation: "chartDraw 2s cubic-bezier(0.4,0,0.2,1) forwards" }} />
                      <circle cx="295" cy="4" r="4" fill="#4F8EF7" style={{ opacity: 0, animation: "dotPop 0.3s ease 2s forwards" }} />
                      <circle cx="295" cy="4" r="9" fill="rgba(79,142,247,0.2)" style={{ opacity: 0, animation: "dotPop 0.3s ease 2s forwards" }} />
                    </svg>
                  </div>

                  {/* 4 stats — 2×2 grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: "0.9rem" }}>
                    {[
                      { label: "Today P&L",   val: "+$284", color: "#00D084", icon: "📈" },
                      { label: "Win Rate",     val: "73%",   color: "#4F8EF7", icon: "🎯" },
                      { label: "Open Trades",  val: "3",     color: "#F5A623", icon: "⚡" },
                      { label: "Bots Active",  val: "3 / 5", color: "#4F8EF7", icon: "🤖" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 13, padding: "11px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                          <span style={{ fontSize: 9, color: "#525A6E", fontWeight: 700, letterSpacing: "0.05em" }}>{s.label}</span>
                          <span style={{ fontSize: 12 }}>{s.icon}</span>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: "var(--font-space-grotesk,sans-serif)" }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Live bot notification — re-animates every loop */}
                  <div key={`ntf-${journalKey}`} style={{ background: "rgba(79,142,247,0.07)", borderRadius: 14, padding: "11px 13px", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", gap: 11, marginBottom: "0.85rem", animation: "slideInRow 0.45s ease forwards" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🤖</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#F0F2F7" }}>Bot opened XAUUSD LONG</div>
                      <div style={{ fontSize: 10, color: "#525A6E", marginTop: 2 }}>Entry: 2,318.40 · SL: 2,310 · TP: 2,330</div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4F8EF7", boxShadow: "0 0 6px #4F8EF7", flexShrink: 0, animation: "livePulse 1.5s ease-in-out infinite" }} />
                  </div>

                  {/* Auto-trade toggle */}
                  <div style={{ background: "rgba(0,208,132,0.06)", borderRadius: 14, padding: "11px 13px", border: "1px solid rgba(0,208,132,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#00D084" }}>AUTO TRADE</div>
                      <div style={{ fontSize: 10, color: "#525A6E", marginTop: 2 }}>3 bots running · 2 signals queued</div>
                    </div>
                    <div style={{ width: 46, height: 26, borderRadius: 13, background: grad, position: "relative", boxShadow: "0 0 12px rgba(79,142,247,0.4)", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Desktop mockup + text */}
          <div style={{ flex: "1 1 560px", display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* ── Animated desktop dashboard ── */}
            <div style={{ borderRadius: 14, border: "1px solid rgba(79,142,247,0.18)", background: "#111318", overflow: "hidden", boxShadow: "0 0 50px rgba(79,142,247,0.1), 0 20px 60px rgba(0,0,0,0.6)" }}>
              {/* Browser chrome */}
              <div style={{ padding: "0.6rem 0.85rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8, background: "#0A0B10" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5F57" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FFBD2E" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28C840" }} />
                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 5, padding: "3px 14px", fontSize: 10, color: "#525A6E" }}>fxau.app/dashboard/journal</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 4px #00D084" }} />
                  <span style={{ fontSize: 9, color: "#00D084", fontWeight: 700 }}>LIVE</span>
                </div>
              </div>

              {/* App body */}
              <div style={{ display: "flex", height: 300 }}>
                {/* Mini sidebar */}
                <div style={{ width: 42, borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "0.75rem", gap: "1rem", background: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
                  {["⊞", "✏️", "📊", "🔖", "⚡"].map((ic, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: i === 1 ? "rgba(79,142,247,0.15)" : "transparent", border: i === 1 ? "1px solid rgba(79,142,247,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{ic}</div>
                  ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Top stats bar */}
                  <div style={{ padding: "0.6rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    {[
                      { label: "Total P&L", val: "+$1,274", color: "#00D084" },
                      { label: "Win Rate", val: "73%", color: "#4F8EF7" },
                      { label: "Trades", val: "48", color: "#F0F2F7" },
                      { label: "Profit Factor", val: "2.71", color: "#4F8EF7" },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 9, color: "#525A6E", fontWeight: 600, letterSpacing: "0.04em" }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: s.color, fontFamily: "var(--font-space-grotesk,sans-serif)" }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Journal table */}
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "90px 50px 70px 1fr 60px 60px 48px", padding: "0.4rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {["Symbol", "Side", "Date", "Notes", "P&L", "R", "Result"].map(h => (
                        <span key={h} style={{ fontSize: 9, fontWeight: 700, color: "#525A6E", letterSpacing: "0.06em" }}>{h}</span>
                      ))}
                    </div>

                    {/* Animated journal rows */}
                    {[
                      { sym: "XAUUSD", side: "LONG",  date: "Sep 03", note: "London breakout retest",  pnl: "+$341", r: "+2.1R", win: true },
                      { sym: "BTCUSD", side: "LONG",  date: "Sep 02", note: "Support bounce, tight SL", pnl: "+$512", r: "+3.2R", win: true },
                      { sym: "GBPUSD", side: "SHORT", date: "Sep 02", note: "Resistance rejection",    pnl: "-$89",  r: "-0.6R", win: false },
                      { sym: "EURUSD", side: "SHORT", date: "Sep 01", note: "News candle fade",        pnl: "+$127", r: "+0.9R", win: true },
                      { sym: "XAUUSD", side: "LONG",  date: "Sep 01", note: "Asian session breakout",  pnl: "+$284", r: "+1.8R", win: true },
                    ].map((row, i) => (
                      <div
                        key={`${journalKey}-${i}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "90px 50px 70px 1fr 60px 60px 48px",
                          padding: "0.45rem 1rem",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          alignItems: "center",
                          opacity: 0,
                          animation: `slideInRow 0.35s ease ${i * 0.18}s forwards`,
                          background: i === 0 ? "rgba(79,142,247,0.04)" : "transparent",
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#F0F2F7" }}>{row.sym}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: row.side === "LONG" ? "#4F8EF7" : "#7B5CF0" }}>{row.side}</span>
                        <span style={{ fontSize: 10, color: "#525A6E" }}>{row.date}</span>
                        <span style={{ fontSize: 10, color: "#8B93A8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.note}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: row.win ? "#00D084" : "#FF4B6E" }}>{row.pnl}</span>
                        <span style={{ fontSize: 10, color: row.win ? "#00D084" : "#FF4B6E", opacity: 0.8 }}>{row.r}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: row.win ? "rgba(0,208,132,0.12)" : "rgba(255,75,110,0.12)", color: row.win ? "#00D084" : "#FF4B6E", textAlign: "center" }}>{row.win ? "WIN" : "LOSS"}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom bar */}
                  <div style={{ padding: "0.5rem 1rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(79,142,247,0.03)" }}>
                    <span style={{ fontSize: 10, color: "#525A6E" }}>Showing 5 of 48 trades</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 4px #00D084" }} />
                      <span style={{ fontSize: 10, color: "#00D084", fontWeight: 600 }}>Auto-sync active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Text content below mockup ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7" }}>MOBILE & WEB PLATFORM</div>
              <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0 }}>
                Trade from <span style={gradText}>anywhere</span>
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
                {PLATFORM_FEATURES.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#4F8EF7", fontWeight: 800, fontSize: 13 }}>✓</span>
                    <span style={{ fontSize: 14, color: "#8B93A8" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" style={{ alignSelf: "flex-start", padding: "11px 26px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 18px rgba(79,142,247,0.3)", letterSpacing: "0.04em" }}>
                START FREE TRIAL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRADE ANALYSIS ════════════════════════════════════════════════════ */}
      <section style={{ ...sectionPad, background: "#0D0F16", position: "relative", overflow: "hidden" }}>
        {/* Large faded background number */}
        <div style={{ position: "absolute", left: "-1rem", top: "50%", transform: "translateY(-50%)", fontSize: "clamp(8rem,18vw,16rem)", fontWeight: 900, color: "rgba(79,142,247,0.04)", fontFamily: "var(--font-space-grotesk,sans-serif)", lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em" }}>2</div>

        <div style={container}>
          {/* Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "1rem" }}>TRADE ANALYSIS</div>
            <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              Analyze your trading <span style={gradText}>stats</span>
            </h2>
            <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 540, margin: 0 }}>
              Take a moment to understand what mistakes you made, if you risked more than planned, and review detailed trade-specific stats to sharpen your edge.
            </p>
          </div>

          {/* App window mockup */}
          <div style={{ borderRadius: 16, border: "1px solid rgba(79,142,247,0.18)", background: "#111318", overflow: "hidden", boxShadow: "0 0 80px rgba(79,142,247,0.08), 0 40px 100px rgba(0,0,0,0.6)" }}>
            {/* Window chrome bar */}
            <div style={{ padding: "0.7rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8, background: "#0A0B10" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "3px 20px", fontSize: 11, color: "#525A6E" }}>FXAU — Trade Analysis · XAUUSD Long</div>
              </div>
            </div>

            {/* App body: sidebar + main */}
            <div style={{ display: "flex", height: 500 }}>
              {/* Sidebar icons */}
              <div style={{ width: 54, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "1rem", gap: "1.1rem", background: "rgba(0,0,0,0.25)", flexShrink: 0 }}>
                {[
                  { icon: "⊞", active: false },
                  { icon: "✏️", active: true },
                  { icon: "📊", active: false },
                  { icon: "🔖", active: false },
                  { icon: "⚡", active: false },
                  { icon: "🎓", active: false },
                ].map((item, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: item.active ? "rgba(79,142,247,0.15)" : "transparent", border: item.active ? "1px solid rgba(79,142,247,0.35)" : "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>{item.icon}</div>
                ))}
              </div>

              {/* Main area */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                {/* Trade header bar */}
                <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(79,142,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#4F8EF7" }}>XA</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--font-space-grotesk,sans-serif)" }}>XAUUSD</span>
                        <span style={{ padding: "2px 7px", borderRadius: 4, background: "rgba(79,142,247,0.12)", color: "#4F8EF7", fontSize: 10, fontWeight: 700 }}>LONG</span>
                        <span style={{ padding: "2px 7px", borderRadius: 4, background: "rgba(0,208,132,0.1)", color: "#00D084", fontSize: 10, fontWeight: 700 }}>WIN</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#525A6E", marginTop: 1 }}>Sep 01, 2024 · 09:30 AM EST — 1:47 PM EST</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#00D084", fontFamily: "var(--font-space-grotesk,sans-serif)" }}>+$1,247.50</div>
                    <div style={{ fontSize: 11, color: "#00D084", opacity: 0.8 }}>+3.8R &nbsp;·&nbsp; +2.31%</div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 1.25rem", flexShrink: 0 }}>
                  {["Stats", "Playbook", "Executions", "Attachments"].map((tab, i) => (
                    <button key={tab} style={{ padding: "0.7rem 1rem", fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#F0F2F7" : "#525A6E", background: "transparent", border: "none", borderBottom: i === 0 ? "2px solid #4F8EF7" : "2px solid transparent", cursor: "pointer", marginBottom: -1 }}>{tab}</button>
                  ))}
                </div>

                {/* Content: left stats + right chart */}
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                  {/* Stats panel */}
                  <div style={{ flex: "0 0 48%", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "1rem 1.25rem", overflow: "auto", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {/* Stats grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[
                        { label: "Net P&L", val: "+$1,247", color: "#00D084" },
                        { label: "Win Rate", val: "73%", color: "#4F8EF7" },
                        { label: "Avg R:R", val: "1:2.4", color: "#F0F2F7" },
                        { label: "Total Trades", val: "48", color: "#F0F2F7" },
                        { label: "Best Trade", val: "+$847", color: "#00D084" },
                        { label: "Profit Factor", val: "2.71", color: "#4F8EF7" },
                        { label: "Avg Duration", val: "4h 23m", color: "#F0F2F7" },
                        { label: "Max Drawdown", val: "-$320", color: "#FF4B6E" },
                        { label: "Sharpe Ratio", val: "1.84", color: "#F0F2F7" },
                      ].map(s => (
                        <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "8px 10px" }}>
                          <div style={{ fontSize: 9, color: "#525A6E", marginBottom: 3, fontWeight: 700, letterSpacing: "0.04em" }}>{s.label}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "var(--font-space-grotesk,sans-serif)" }}>{s.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Mistakes / risk flags */}
                    <div style={{ background: "rgba(255,75,110,0.05)", border: "1px solid rgba(255,75,110,0.15)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#FF4B6E", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>⚠ RISK FLAGS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {["Held past target by 12 min", "Position size 0.2% above plan"].map(flag => (
                          <div key={flag} style={{ fontSize: 11, color: "#8B93A8", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "#FF4B6E", fontWeight: 700 }}>·</span> {flag}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trade notes */}
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#525A6E", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 5 }}>TRADE NOTES</div>
                      <div style={{ fontSize: 12, color: "#8B93A8", lineHeight: 1.6 }}>Waited for London session breakout confirmation. Entered on retest of key level at 2312. Managed risk at 1% account size.</div>
                    </div>
                  </div>

                  {/* Chart panel */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    {/* Chart toolbar */}
                    <div style={{ padding: "0.5rem 0.85rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {["1m", "5m", "15m", "1H", "4H"].map((t, i) => (
                        <span key={t} style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: i === 3 ? "rgba(79,142,247,0.15)" : "transparent", color: i === 3 ? "#4F8EF7" : "#525A6E", border: i === 3 ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent", cursor: "pointer" }}>{t}</span>
                      ))}
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#525A6E", cursor: "pointer" }}>📐 Indicators</span>
                    </div>

                    {/* Price info */}
                    <div style={{ padding: "0.4rem 0.85rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: "#525A6E" }}>O</span><span style={{ fontSize: 10, color: "#F0F2F7", fontWeight: 600 }}>2318.25</span>
                      <span style={{ fontSize: 10, color: "#525A6E" }}>H</span><span style={{ fontSize: 10, color: "#00D084", fontWeight: 600 }}>2321.80</span>
                      <span style={{ fontSize: 10, color: "#525A6E" }}>L</span><span style={{ fontSize: 10, color: "#FF4B6E", fontWeight: 600 }}>2315.40</span>
                      <span style={{ fontSize: 10, color: "#525A6E" }}>C</span><span style={{ fontSize: 10, color: "#F0F2F7", fontWeight: 600 }}>2319.50</span>
                    </div>

                    {/* Candlestick chart */}
                    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                      <svg viewBox="0 0 380 200" style={{ width: "100%", height: "100%", display: "block" }}>
                        {/* Grid lines */}
                        {[40, 80, 120, 160].map(y => (
                          <line key={y} x1="0" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        ))}
                        {/* Entry line */}
                        <line x1="0" y1="138" x2="380" y2="138" stroke="rgba(79,142,247,0.5)" strokeWidth="1" strokeDasharray="5,4" />
                        <rect x="2" y="130" width="34" height="14" rx="3" fill="rgba(79,142,247,0.15)" />
                        <text x="6" y="140" fill="#4F8EF7" fontSize="8" fontWeight="700">ENTRY</text>
                        {/* Exit / TP line */}
                        <line x1="0" y1="52" x2="380" y2="52" stroke="rgba(0,208,132,0.5)" strokeWidth="1" strokeDasharray="5,4" />
                        <rect x="2" y="44" width="26" height="14" rx="3" fill="rgba(0,208,132,0.12)" />
                        <text x="6" y="54" fill="#00D084" fontSize="8" fontWeight="700">EXIT</text>
                        {/* SL line */}
                        <line x1="0" y1="172" x2="380" y2="172" stroke="rgba(255,75,110,0.4)" strokeWidth="1" strokeDasharray="3,5" />
                        <text x="6" y="170" fill="#FF4B6E" fontSize="7">SL</text>

                        {/* Candles — downtrend then strong reversal up */}
                        {[
                          // [x, open, close, high, low] — all Y coords (higher Y = lower price)
                          [20,  155, 162, 150, 168],  // bear
                          [38,  162, 158, 156, 170],  // bear
                          [56,  158, 165, 153, 172],  // bear
                          [74,  165, 170, 160, 178],  // bear
                          [92,  170, 164, 162, 180],  // bear small
                          [110, 164, 172, 159, 178],  // bear
                          [128, 172, 155, 150, 176],  // strong bull reversal
                          [146, 155, 142, 138, 158],  // bull
                          [164, 142, 130, 126, 146],  // bull
                          [182, 130, 118, 114, 134],  // bull
                          [200, 118, 105, 102, 122],  // bull
                          [218, 105, 95,  92,  110],  // bull
                          [236, 95,  80,  76,  98],   // strong bull
                          [254, 80,  68,  65,  84],   // bull
                          [272, 68,  72,  65,  76],   // small bear (pause)
                          [290, 72,  58,  55,  75],   // bull continuation
                          [308, 58,  48,  44,  62],   // bull
                          [326, 48,  52,  44,  55],   // small bear
                          [344, 52,  42,  38,  56],   // bull
                          [362, 42,  36,  32,  46],   // bull exit zone
                        ].map(([x, open, close, high, low], i) => {
                          const bull = close < open
                          const col = bull ? "#00D084" : "#FF4B6E"
                          const bodyTop = Math.min(open, close)
                          const bodyH = Math.max(Math.abs(open - close), 2)
                          return (
                            <g key={i}>
                              <line x1={x + 6} y1={high} x2={x + 6} y2={low} stroke={col} strokeWidth="1.5" />
                              <rect x={x} y={bodyTop} width="12" height={bodyH} fill={col} fillOpacity={bull ? 1 : 0.7} rx="1" />
                            </g>
                          )
                        })}

                        {/* Entry arrow */}
                        <polygon points="118,148 126,138 134,148" fill="#4F8EF7" opacity="0.9" />
                        {/* Exit arrow */}
                        <polygon points="354,62 362,52 370,62" fill="#00D084" opacity="0.9" />

                        {/* Price labels right side */}
                        <text x="368" y="56" fill="#00D084" fontSize="7" fontWeight="700">2321</text>
                        <text x="368" y="140" fill="#4F8EF7" fontSize="7" fontWeight="700">2312</text>
                        <text x="368" y="174" fill="#FF4B6E" fontSize="7" fontWeight="700">2308</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
        @keyframes chartDraw {
          from { stroke-dashoffset: 420; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes chartFillIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dotPop {
          from { opacity: 0; transform: scale(0.4); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRow {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
