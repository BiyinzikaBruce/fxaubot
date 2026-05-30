"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

const SOCIAL_PROOFS = [
  { city: "Sydney", country: "Australia", action: "Started bot automation" },
  { city: "London", country: "UK", action: "Joined copy trading" },
  { city: "Dubai", country: "UAE", action: "Upgraded to Pro" },
  { city: "New York", country: "USA", action: "Activated trading bot" },
  { city: "Singapore", country: "SG", action: "Started free trial" },
]

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Results", href: "#results" },
  { label: "Pricing", href: "/pricing" },
  { label: "Education", href: "/learn" },
  { label: "Contact", href: "#contact" },
]

const FEATURES = [
  "Trading Journal",
  "Bot Automation",
  "Copy Trading",
  "Structured Education",
]

// Fake chart path for dashboard mockup
const CHART_PATH =
  "M0,80 C20,75 35,60 55,55 C75,50 85,65 105,55 C125,45 135,30 155,25 C175,20 185,35 205,28 C225,21 235,10 255,8 L255,100 L0,100 Z"

const CHART_LINE =
  "M0,80 C20,75 35,60 55,55 C75,50 85,65 105,55 C125,45 135,30 155,25 C175,20 185,35 205,28 C225,21 235,10 255,8"

const RECENT_TRADES = [
  { pair: "XAUUSD", side: "BUY", pnl: "+$284", pct: "+1.8%" },
  { pair: "EURUSD", side: "SELL", pnl: "+$127", pct: "+0.9%" },
  { pair: "BTCUSD", side: "BUY", pnl: "+$512", pct: "+3.2%" },
]

export default function LandingPage() {
  const [proofIndex, setProofIndex] = useState(0)
  const [proofVisible, setProofVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

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

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#08090E", color: "#F0F2F7", fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(8,9,14,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            FX
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "var(--font-space-grotesk, sans-serif)",
              background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FXAU
          </span>
        </Link>

        {/* Desktop nav links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "2rem" }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              style={{
                color: "#8B93A8",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F2F7")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8B93A8")}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/login"
            style={{
              color: "#8B93A8",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
            className="hidden md:block"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            style={{
              padding: "8px 20px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(79,142,247,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          padding: "4rem 2rem",
          maxWidth: 1280,
          margin: "0 auto",
          gap: "4rem",
        }}
      >
        {/* Left: Content */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* Announcement badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid rgba(79,142,247,0.35)",
                background: "rgba(79,142,247,0.08)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#4F8EF7",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#4F8EF7",
                  boxShadow: "0 0 6px #4F8EF7",
                  animation: "pulse 1.5s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              AI-POWERED TRADING PLATFORM
            </div>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-space-grotesk, sans-serif)",
              fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            The Future of
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Automated Trading
            </span>
          </h1>

          {/* Sub-headline */}
          <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
            FXAU executes precision trades across every market using advanced AI automation. Built for traders
            who demand results — journal, automate, copy, and learn. Always on.
          </p>

          {/* Feature checkmarks */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
            {FEATURES.map((f) => (
              <span
                key={f}
                style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#8B93A8", fontWeight: 500 }}
              >
                <span style={{ color: "#4F8EF7", fontSize: 15, fontWeight: 700 }}>✓</span> {f}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "0.25rem" }}>
            <Link
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.04em",
                textDecoration: "none",
                boxShadow: "0 6px 24px rgba(79,142,247,0.35)",
              }}
            >
              🚀 GET STARTED FREE
            </Link>
            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 28px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#F0F2F7",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.04em",
                textDecoration: "none",
                background: "transparent",
              }}
            >
              VIEW PRICING
            </Link>
            <a
              href="https://discord.gg/fxau"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 999,
                border: "1px solid rgba(79,142,247,0.3)",
                color: "#4F8EF7",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.04em",
                textDecoration: "none",
                background: "rgba(79,142,247,0.06)",
              }}
            >
              JOIN DISCORD
            </a>
          </div>

          {/* Social proof popup */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 16px",
              borderRadius: 12,
              background: "#111318",
              border: "1px solid rgba(255,255,255,0.08)",
              alignSelf: "flex-start",
              marginTop: "0.5rem",
              opacity: proofVisible ? 1 : 0,
              transform: proofVisible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              📈
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F2F7" }}>
                {proof.action} — {proof.city}
              </div>
              <div style={{ fontSize: 11, color: "#525A6E", marginTop: 1 }}>
                {proof.country} · just now
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dashboard mockup */}
        <div
          style={{ flex: "1 1 440px", display: "flex", justifyContent: "center", alignItems: "center" }}
          className="hidden lg:flex"
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              borderRadius: 20,
              border: "1px solid rgba(79,142,247,0.2)",
              background: "linear-gradient(145deg, #111318 0%, #0D0F16 100%)",
              boxShadow: "0 0 60px rgba(79,142,247,0.12), 0 24px 64px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            {/* Dashboard header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#525A6E", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>
                  LIVE PORTFOLIO
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-space-grotesk, sans-serif)", color: "#F0F2F7" }}>
                  $24,861
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#00D084", marginLeft: 10 }}>+18.4%</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 6px #00D084" }} />
                <span style={{ fontSize: 12, color: "#00D084", fontWeight: 600 }}>LIVE</span>
              </div>
            </div>

            {/* Chart area */}
            <div style={{ padding: "1rem 0 0", position: "relative" }}>
              <div style={{ padding: "0 1.5rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["1D", "1W", "1M", "ALL"].map((t, i) => (
                    <span
                      key={t}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: i === 1 ? "rgba(79,142,247,0.15)" : "transparent",
                        color: i === 1 ? "#4F8EF7" : "#525A6E",
                        border: i === 1 ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <svg viewBox="0 0 255 100" style={{ width: "100%", height: 120, display: "block" }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F8EF7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4F8EF7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={CHART_PATH} fill="url(#chartGradient)" />
                <path d={CHART_LINE} fill="none" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" />
                <circle cx="255" cy="8" r="4" fill="#4F8EF7" />
                <circle cx="255" cy="8" r="7" fill="rgba(79,142,247,0.3)" />
              </svg>
            </div>

            {/* Recent trades */}
            <div style={{ padding: "1rem 1.5rem 1.5rem" }}>
              <div style={{ fontSize: 11, color: "#525A6E", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
                RECENT TRADES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {RECENT_TRADES.map((t) => (
                  <div
                    key={t.pair}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: "rgba(79,142,247,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#4F8EF7",
                        }}
                      >
                        {t.pair.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F2F7" }}>{t.pair}</div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: t.side === "BUY" ? "#4F8EF7" : "#7B5CF0",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {t.side}
                        </div>
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

            {/* Bot status bar */}
            <div
              style={{
                padding: "0.75rem 1.5rem",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(79,142,247,0.05)",
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 5px #00D084" }} />
              <span style={{ fontSize: 12, color: "#8B93A8", fontWeight: 500 }}>
                3 bots active · next trade in <span style={{ color: "#4F8EF7" }}>~2m</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 24/7 Support badge ─────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 999,
          background: "#111318",
          border: "1px solid rgba(79,142,247,0.25)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          zIndex: 40,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 14 }}>💬</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8EF7", letterSpacing: "0.04em" }}>
          24/7 AI SUPPORT
        </span>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 5px #00D084" }} />
      </div>

      {/* ── Pulse animation ─────────────────────────────────────── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}
