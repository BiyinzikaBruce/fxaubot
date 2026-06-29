"use client"

import { useState } from "react"
import Link from "next/link"

const grad = "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)"
const gradText: React.CSSProperties = {
  background: grad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

// ── Plan data ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Pro",
    tag: null,
    desc: "For traders ready to automate and track everything",
    monthly: 49.99,
    yearly: 39.99,
    cta: "Start Pro →",
    href: "/register?plan=pro",
    featured: false,
    color: "rgba(255,255,255,0.06)",
    features: [
      { text: "Unlimited trade journal", ok: true },
      { text: "1 active bot", ok: true },
      { text: "Signal feed", ok: true },
      { text: "Basic analytics dashboard", ok: true },
      { text: "Basic backtesting", ok: true },
      { text: "Copy trading", ok: false },
      { text: "Unlimited active bots", ok: false },
      { text: "Mentor access", ok: false },
      { text: "MT5 live account connection", ok: false },
      { text: "Prop firm sync", ok: false },
    ],
  },
  {
    name: "Ultimate",
    tag: "MOST POPULAR",
    desc: "Maximum performance for serious traders",
    monthly: 99.99,
    yearly: 79.99,
    cta: "Start Ultimate →",
    href: "/register?plan=ultimate",
    featured: true,
    color: grad,
    features: [
      { text: "Everything in Pro", ok: true },
      { text: "Unlimited active bots", ok: true },
      { text: "Copy trading", ok: true },
      { text: "Unlimited backtesting", ok: true },
      { text: "Full analytics suite", ok: true },
      { text: "Mentor access", ok: true },
      { text: "Education library", ok: true },
      { text: "MT5 live account connection", ok: false },
      { text: "Prop firm sync", ok: false },
      { text: "API access", ok: false },
    ],
  },
  {
    name: "Platinum",
    tag: "ELITE",
    desc: "Run bots live, on a real broker, hands-off",
    monthly: 299.99,
    yearly: 239.99,
    cta: "Go Platinum →",
    href: "/register?plan=platinum",
    featured: false,
    color: "#F5A623",
    features: [
      { text: "Everything in Ultimate", ok: true },
      { text: "MT5 live account connection", ok: true },
      { text: "Prop firm sync (FTMO, MFF, etc.)", ok: true },
      { text: "Custom strategy builder", ok: true },
      { text: "API access", ok: true },
      { text: "Priority 24/7 support", ok: true },
      { text: "Early access to new features", ok: true },
      { text: "White-glove onboarding", ok: true },
    ],
  },
]

// ── Comparison table rows ─────────────────────────────────────────────────
const TABLE_ROWS: { label: string; pro: string | boolean; ultimate: string | boolean; platinum: string | boolean }[] = [
  { label: "Trading Journal",         pro: "Unlimited",     ultimate: "Unlimited",        platinum: "Unlimited" },
  { label: "Active Bots",             pro: "1",             ultimate: "Unlimited",         platinum: "Unlimited" },
  { label: "MT5 Live Connection",     pro: false,           ultimate: false,               platinum: true },
  { label: "Copy Trading",            pro: false,           ultimate: true,                platinum: true },
  { label: "Backtesting",             pro: "Basic",         ultimate: "Unlimited",          platinum: "Unlimited" },
  { label: "Mentor Access",           pro: false,           ultimate: true,                platinum: true },
  { label: "Education Library",       pro: false,           ultimate: true,                platinum: true },
  { label: "Prop Firm Sync",          pro: false,           ultimate: false,               platinum: true },
  { label: "Custom Strategy Builder", pro: false,           ultimate: false,               platinum: true },
  { label: "API Access",              pro: false,           ultimate: false,               platinum: true },
  { label: "Priority Support",        pro: false,           ultimate: false,               platinum: true },
]

// ── FAQ data ──────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade anytime from your account settings. Changes take effect immediately and are prorated." },
  { q: "Is there a free plan?", a: "No — every FXAU plan is a paid plan, starting at Pro. Every plan comes with a 7-day money-back guarantee, so you can try any tier risk-free." },
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards via Stripe. We also accept Bitcoin, USDT (TRC20/ERC20), and Skrill — contact us on Telegram for crypto payments." },
  { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee on your first payment if you're not satisfied. After that, subscriptions are non-refundable." },
  { q: "What prop firms does Platinum sync with?", a: "FTMO, MyForexFunds, The5%ers, Funded Next, Apex, and more. New firms are added regularly." },
  { q: "Can I use FXAU on multiple devices?", a: "Yes. Your account works on any device — web browser, iOS, and Android. All data syncs in real time." },
]

// ── Cell renderer ─────────────────────────────────────────────────────────
function Cell({ val }: { val: string | boolean }) {
  if (val === true)  return <span style={{ color: "#00D084", fontSize: 18, fontWeight: 700 }}>✓</span>
  if (val === false) return <span style={{ color: "#525A6E", fontSize: 16 }}>✕</span>
  return <span style={{ fontSize: 13, fontWeight: 600, color: "#8B93A8" }}>{val as string}</span>
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [yearly, setYearly] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#08090E", color: "#F0F2F7", fontFamily: "var(--font-dm-sans,sans-serif)" }}>

      {/* ── Navbar ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,9,14,0.9)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>FX</div>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space-grotesk,sans-serif)", ...gradText }}>FXAU</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {[["Home", "/"], ["Results", "/results"], ["Education", "/learn"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px" }}>Sign In</Link>
          <Link href="/register" style={{ padding: "8px 20px", borderRadius: 999, background: grad, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(79,142,247,0.3)" }}>GET STARTED</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "5rem 2rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30%", left: "25%", width: "50%", height: "200%", background: "radial-gradient(ellipse, rgba(79,142,247,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <h1 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2.4rem,5vw,3.6rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
          Everything you need for<br /><span style={gradText}>consistent profitability</span>
        </h1>
        <p style={{ color: "#8B93A8", fontSize: 16, marginBottom: "1.5rem", fontWeight: 600, letterSpacing: "0.04em" }}>
          HOW MUCH WILL YOU INVEST IN YOUR TRADING SUCCESS TODAY?
        </p>

        {/* Money-back guarantee */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 999, background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.3)", color: "#00D084", fontSize: 13, fontWeight: 700, marginBottom: "1.75rem" }}>
          🛡️ 7-Day Money-Back Guarantee
        </div>
        <br />

        {/* Toggle */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: "#111318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 4, marginBottom: "3.5rem" }}>
          <button onClick={() => setYearly(false)} style={{ padding: "10px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, transition: "all 0.2s", background: !yearly ? "#fff" : "transparent", color: !yearly ? "#08090E" : "#8B93A8" }}>
            Monthly
          </button>
          <button onClick={() => setYearly(true)} style={{ padding: "10px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, transition: "all 0.2s", background: yearly ? grad : "transparent", color: yearly ? "#fff" : "#8B93A8", display: "flex", alignItems: "center", gap: 8 }}>
            Annual
            {!yearly && <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "rgba(123,92,240,0.5)", border: "1px solid rgba(123,92,240,0.6)", padding: "2px 8px", borderRadius: 999 }}>SAVE 20%</span>}
          </button>
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem 5rem", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem", alignItems: "start" }}>
        {PLANS.map((plan) => {
          const elite = plan.tag === "ELITE"
          const eliteText: React.CSSProperties = elite ? { color: "#F5A623" } : {}
          return (
          <div key={plan.name} style={{
            borderRadius: 20,
            border: plan.featured ? "2px solid rgba(79,142,247,0.6)" : elite ? "2px solid rgba(245,166,35,0.5)" : "1px solid rgba(255,255,255,0.08)",
            background: plan.featured ? "linear-gradient(160deg,#111826,#0D1420)" : elite ? "linear-gradient(160deg,#1a1408,#0D0F16)" : "#111318",
            padding: "2rem",
            position: "relative",
            boxShadow: plan.featured ? "0 0 50px rgba(79,142,247,0.15), 0 20px 60px rgba(0,0,0,0.5)" : elite ? "0 0 50px rgba(245,166,35,0.12), 0 20px 60px rgba(0,0,0,0.5)" : "none",
            transform: plan.featured ? "scale(1.03)" : "scale(1)",
          }}>
            {/* Badge */}
            {plan.tag && (
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", borderRadius: 999, background: elite ? "linear-gradient(135deg,#F5A623,#E08A0C)" : grad, fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.08em", whiteSpace: "nowrap", boxShadow: elite ? "0 4px 14px rgba(245,166,35,0.4)" : "0 4px 14px rgba(79,142,247,0.4)" }}>
                {plan.tag}
              </div>
            )}

            {/* Plan name */}
            <div style={{ marginBottom: "0.5rem" }}>
              <h3 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: 22, fontWeight: 800, margin: 0, ...(plan.featured ? gradText : { color: "#F0F2F7", ...eliteText }) }}>
                {plan.name}
              </h3>
              <p style={{ color: "#8B93A8", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{plan.desc}</p>
            </div>

            {/* Price */}
            <div style={{ margin: "1.5rem 0" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#8B93A8", alignSelf: "flex-start", marginTop: 8 }}>$</span>
                <span style={{ fontSize: 52, fontWeight: 900, fontFamily: "var(--font-space-grotesk,sans-serif)", lineHeight: 1, ...(plan.featured ? gradText : eliteText) }}>
                  {(yearly ? plan.yearly : plan.monthly).toFixed(2)}
                </span>
                <span style={{ fontSize: 14, color: "#8B93A8", marginBottom: 8 }}>/ Month</span>
              </div>
              {yearly && (
                <div style={{ fontSize: 12, color: "#00D084", fontWeight: 700, marginTop: 4 }}>
                  Billed ${(plan.yearly * 12).toFixed(2)}/year · Save ${((plan.monthly - plan.yearly) * 12).toFixed(2)}
                </div>
              )}
            </div>

            {/* CTA */}
            <Link href={plan.href} style={{
              display: "block", textAlign: "center", padding: "13px", borderRadius: 12,
              background: plan.featured ? grad : elite ? "linear-gradient(135deg,#F5A623,#E08A0C)" : "rgba(255,255,255,0.06)",
              border: plan.featured || elite ? "none" : "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
              boxShadow: plan.featured ? "0 6px 24px rgba(79,142,247,0.35)" : elite ? "0 6px 24px rgba(245,166,35,0.35)" : "none",
              marginBottom: "1.75rem", letterSpacing: "0.02em",
            }}>
              {plan.cta}
            </Link>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 10, opacity: f.ok ? 1 : 0.4 }}>
                  <span style={{ fontSize: 14, color: f.ok ? "#00D084" : "#525A6E", flexShrink: 0, marginTop: 1, fontWeight: 700 }}>
                    {f.ok ? "✓" : "✕"}
                  </span>
                  <span style={{ fontSize: 13.5, color: f.ok ? "#8B93A8" : "#525A6E", lineHeight: 1.45, textDecoration: f.ok ? "none" : "line-through" }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          )
        })}
      </div>

      {/* ── Feature comparison table ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "0.75rem" }}>PLANS & FEATURES</div>
          <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Full feature <span style={gradText}>breakdown</span>
          </h2>
        </div>

        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: "#111318", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ padding: "1.1rem 1.5rem", fontSize: 13, fontWeight: 700, color: "#525A6E", letterSpacing: "0.06em" }}>FEATURE</div>
            {PLANS.map(p => (
              <div key={p.name} style={{ padding: "1.1rem 1rem", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 800, ...(p.featured ? gradText : { color: "#F0F2F7" }) }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#8B93A8", marginTop: 2 }}>
                  ${(yearly ? p.yearly : p.monthly).toFixed(2)}/mo
                </div>
              </div>
            ))}
          </div>
          {/* Rows */}
          {TABLE_ROWS.map((row, i) => (
            <div key={row.label} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent", borderBottom: i < TABLE_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div style={{ padding: "0.9rem 1.5rem", fontSize: 13, color: "#8B93A8", fontWeight: 500 }}>{row.label}</div>
              <div style={{ padding: "0.9rem 1rem", textAlign: "center" }}><Cell val={row.pro} /></div>
              <div style={{ padding: "0.9rem 1rem", textAlign: "center" }}><Cell val={row.ultimate} /></div>
              <div style={{ padding: "0.9rem 1rem", textAlign: "center" }}><Cell val={row.platinum} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Payment methods ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "0.75rem" }}>INTERNATIONAL</div>
          <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 0.75rem" }}>
            Alternative <span style={gradText}>payment methods</span>
          </h2>
          <p style={{ color: "#8B93A8", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            Prefer crypto or Skrill? Use any method below — then send proof of payment to us on Telegram for instant activation.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem" }}>
          {[
            { name: "Bitcoin (BTC)",  icon: "₿",  network: "BTC NETWORK",   address: "3HXSQEy4zEihHNRVMjUjPG9eibNeXg5b34", bg: "rgba(247,147,26,0.08)", border: "rgba(247,147,26,0.2)", ic: "#F7931A" },
            { name: "USDT",          icon: "₮",  network: "TRC20 NETWORK", address: "TFeLVP23wSYExvZsCRViomh45BKy3yaB2d",  bg: "rgba(38,161,123,0.08)", border: "rgba(38,161,123,0.2)", ic: "#26A17B" },
            { name: "USDT",          icon: "₮",  network: "ERC20 NETWORK", address: "0xaf89ea52CB3788b22143806dFC648D4b7d6EC9f9", bg: "rgba(38,161,123,0.08)", border: "rgba(38,161,123,0.2)", ic: "#26A17B" },
            { name: "Skrill",        icon: "S",  network: "EMAIL",         address: "support@fxau.io",                        bg: "rgba(134,56,151,0.08)", border: "rgba(134,56,151,0.2)", ic: "#863897" },
          ].map((m, i) => {
            const key = `${m.name}-${i}`
            return (
              <div key={key} style={{ padding: "1.25rem 1.5rem", borderRadius: 16, background: m.bg, border: `1px solid ${m.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: m.ic }}>
                    {m.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#F0F2F7" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "#525A6E", fontWeight: 600, letterSpacing: "0.06em" }}>{m.network}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ fontSize: 12, color: "#8B93A8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono,monospace)" }}>
                    {m.address}
                  </span>
                  <button
                    onClick={() => copy(m.address, key)}
                    style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 7, background: copied === key ? "rgba(0,208,132,0.15)" : "rgba(255,255,255,0.07)", border: `1px solid ${copied === key ? "rgba(0,208,132,0.3)" : "rgba(255,255,255,0.12)"}`, color: copied === key ? "#00D084" : "#8B93A8", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.2s" }}
                  >
                    {copied === key ? "COPIED ✓" : "COPY"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: "1rem", padding: "1rem 1.5rem", borderRadius: 14, background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>✈️</span>
          <p style={{ fontSize: 14, color: "#8B93A8", margin: 0, lineHeight: 1.6 }}>
            After sending payment, contact us on Telegram at{" "}
            <a href="https://t.me/fxausupport" target="_blank" rel="noopener noreferrer" style={{ color: "#4F8EF7", fontWeight: 600, textDecoration: "none" }}>t.me/fxausupport</a>{" "}
            with your proof of payment and email address for instant activation.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Pricing <span style={gradText}>FAQs</span>
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderRadius: 14, border: `1px solid ${openFaq === i ? "rgba(79,142,247,0.3)" : "rgba(255,255,255,0.07)"}`, background: "#111318", overflow: "hidden", transition: "border-color 0.2s" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", textAlign: "left", padding: "1.1rem 1.5rem", background: "transparent", border: "none", color: "#F0F2F7", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <span>{faq.q}</span>
                <span style={{ color: "#4F8EF7", fontSize: 22, fontWeight: 300, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", color: "#8B93A8", fontSize: 14, lineHeight: 1.75 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ textAlign: "center", padding: "5rem 2rem", background: "#0D0F16", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
          Pick your edge. <span style={gradText}>Start trading smarter.</span>
        </h2>
        <p style={{ color: "#8B93A8", fontSize: 16, maxWidth: 440, margin: "0 auto 2rem", lineHeight: 1.75 }}>
          7-day money-back guarantee on every plan. Join 12,400+ traders already using FXAU.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/register" style={{ padding: "14px 36px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 28px rgba(79,142,247,0.4)" }}>
            Get Started →
          </Link>
          <a href="https://t.me/fxausupport" target="_blank" rel="noopener noreferrer"
            style={{ padding: "14px 28px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.3)", color: "#4F8EF7", fontWeight: 700, fontSize: 15, textDecoration: "none", background: "rgba(79,142,247,0.07)" }}>
            Talk to Sales
          </a>
        </div>
      </section>

    </div>
  )
}
