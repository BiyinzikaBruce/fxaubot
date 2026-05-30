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

const MODULES = [
  { num: "01", title: "Forex Fundamentals",       desc: "Currency pairs, pips, lots, margin, leverage — everything you need before placing your first trade.", icon: "📖" },
  { num: "02", title: "Technical Analysis",        desc: "Price action, candlestick patterns, support & resistance, trend lines, and multi-timeframe analysis.", icon: "📊" },
  { num: "03", title: "Risk Management",           desc: "Position sizing, stop-loss strategy, R:R ratios, and why most traders blow accounts (and how not to).", icon: "🛡️" },
  { num: "04", title: "Trading Psychology",        desc: "Discipline, FOMO, revenge trading, building a routine — the mental edge that separates winners.", icon: "🧠" },
  { num: "05", title: "Bot Automation with FXAU",  desc: "Set up your first trading bot on FXAU, configure entries/exits, and automate your strategy.", icon: "🤖" },
  { num: "06", title: "Trade Journal & Analytics", desc: "How to log, review, and improve every trade using FXAU's automated journal and AI insights.", icon: "📓" },
  { num: "07", title: "Copy Trading Masterclass",  desc: "How to find, vet, and copy top traders on FXAU — and when to stop copying.", icon: "📡" },
  { num: "08", title: "Prop Firm Challenges",      desc: "How to pass FTMO, MFF, and other funded challenges using discipline and FXAU's prop firm tracker.", icon: "🏆" },
]

const BENEFITS = [
  { icon: "🎥", title: "Live Weekly Sessions",       desc: "Join live Zoom classes every week with experienced mentors based in Uganda." },
  { icon: "💬", title: "Private Telegram Group",     desc: "Access our exclusive student group for signals, setups, and peer accountability." },
  { icon: "📋", title: "Structured Curriculum",      desc: "8 progressive modules from beginner to funded trader — no fluff, all practical." },
  { icon: "🤖", title: "Free FXAU Pro Access",       desc: "Every enrolled student gets 3 months of FXAU Pro — journal, bots, and analytics included." },
  { icon: "🏆", title: "Prop Firm Prep",             desc: "Dedicated mentorship track to help you pass your first funded challenge." },
  { icon: "🤝", title: "1-on-1 Mentor Support",      desc: "Get personal feedback on your trades, journal, and strategy from your assigned mentor." },
]

const FAQS = [
  { q: "Do I need any prior trading experience?", a: "No. The academy starts from absolute zero — Module 1 assumes you have never placed a trade. We take you from beginner to automated trader step by step." },
  { q: "Is the academy online or in-person?", a: "Both. Live sessions are held online via Zoom every week, with optional in-person meetups in Kampala, Uganda for enrolled students." },
  { q: "How much does it cost?", a: "Reach out after submitting your application and our team will share the current intake pricing. We offer monthly payment plans." },
  { q: "What do I need to get started?", a: "A smartphone or laptop, a stable internet connection, and a trading account with a broker (we'll guide you through setup). FXAU account is free to create." },
  { q: "How long is the course?", a: "The full curriculum takes 8 weeks at 2 sessions per week. Most students are placing live trades and running their first bot by week 4." },
  { q: "Will I get a certificate?", a: "Yes. Graduates receive a Forex Academy Uganda × FXAU certificate of completion, and top students are invited into the mentor programme." },
]

const STATS = [
  { val: "500+",  label: "Students Enrolled" },
  { val: "8",     label: "Course Modules" },
  { val: "73%",   label: "Student Win Rate" },
  { val: "4.9★",  label: "Average Rating" },
]

export default function LearnPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", experience: "", message: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/academy-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus("success")
      setForm({ name: "", email: "", phone: "", country: "", experience: "", message: "" })
    } catch {
      setStatus("error")
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12, padding: "13px 16px", fontSize: 15, color: "#F0F2F7",
    outline: "none", boxSizing: "border-box", fontFamily: "var(--font-dm-sans,sans-serif)",
    transition: "border-color 0.2s",
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
          {[["Home", "/"], ["Results", "/results"], ["Pricing", "/pricing"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px" }}>Sign In</Link>
          <Link href="/register" style={{ padding: "8px 20px", borderRadius: 999, background: grad, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(79,142,247,0.3)" }}>GET STARTED</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <div style={{ position: "absolute", top: "-20%", left: "20%", width: "60%", height: "200%", background: "radial-gradient(ellipse, rgba(79,142,247,0.09) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(79,142,247,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Partnership badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.35)", background: "rgba(79,142,247,0.08)", marginBottom: "1.75rem" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>FX</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8EF7", letterSpacing: "0.04em" }}>FXAU × FOREX ACADEMY UGANDA</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2.6rem,5.5vw,4rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "1.25rem", maxWidth: 820, margin: "0 auto 1.25rem" }}>
          Learn to trade forex.<br /><span style={gradText}>Connect with experienced traders.</span>
        </h1>

        <p style={{ color: "#8B93A8", fontSize: 18, lineHeight: 1.75, maxWidth: 600, margin: "0 auto 2.5rem" }}>
          Forex Academy Uganda, powered by FXAU, is a structured programme that takes you from zero to placing live trades, running bots, and passing prop firm challenges.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: "4rem" }}>
          <a href="#signup" style={{ padding: "14px 36px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 28px rgba(79,142,247,0.4)" }}>
            Apply Now — It's Free →
          </a>
          <a href="https://t.me/fxaubot" target="_blank" rel="noopener noreferrer"
            style={{ padding: "14px 28px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.3)", color: "#4F8EF7", fontWeight: 700, fontSize: 15, textDecoration: "none", background: "rgba(79,142,247,0.07)" }}>
            ✈️ Join Telegram
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "inline-flex", gap: 0, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
          {STATS.map((s, i, arr) => (
            <div key={s.label} style={{ padding: "1rem 2rem", background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-space-grotesk,sans-serif)", ...gradText }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#525A6E", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "0.75rem" }}>8-MODULE CURRICULUM</div>
          <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
            What you will <span style={gradText}>learn</span>
          </h2>
          <p style={{ color: "#8B93A8", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            From forex basics to automated bots and funded accounts — a complete trading education in 8 weeks.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" }}>
          {MODULES.map((mod) => (
            <div key={mod.num}
              style={{ padding: "1.75rem", borderRadius: 16, background: "#111318", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: "1rem", transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(79,142,247,0.35)"; el.style.transform = "translateY(-4px)" }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(0)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{mod.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#4F8EF7", letterSpacing: "0.08em" }}>MODULE {mod.num}</span>
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: 16, fontWeight: 700, color: "#F0F2F7", margin: "0 0 0.5rem" }}>{mod.title}</h3>
                <p style={{ fontSize: 13, color: "#8B93A8", lineHeight: 1.65, margin: 0 }}>{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why join ── */}
      <section style={{ background: "#0D0F16", padding: "5rem 2rem", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "0.75rem" }}>WHY FXAU ACADEMY</div>
            <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              Everything you need to <span style={gradText}>succeed</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
            {BENEFITS.map(b => (
              <div key={b.title} style={{ padding: "1.75rem", borderRadius: 16, background: "#111318", border: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "1rem" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: 15, fontWeight: 700, color: "#F0F2F7", margin: "0 0 0.45rem" }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: "#8B93A8", lineHeight: 1.65, margin: 0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Signup form ── */}
      <section id="signup" style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 2rem" }}>
        <div style={{ display: "flex", gap: "5rem", alignItems: "flex-start" }}>

          {/* Left: info */}
          <div style={{ flex: "1 1 380px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#4F8EF7", marginBottom: "0.75rem" }}>JOIN THE ACADEMY</div>
              <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
                Apply for the next<br /><span style={gradText}>intake today</span>
              </h2>
              <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, margin: 0 }}>
                Fill in your details and our team will contact you within 24 hours to confirm your spot and share intake details.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: "✓", text: "No prior experience needed" },
                { icon: "✓", text: "3 months FXAU Pro included free" },
                { icon: "✓", text: "Weekly live sessions via Zoom" },
                { icon: "✓", text: "Private Telegram mentor group" },
                { icon: "✓", text: "Certificate of completion" },
                { icon: "✓", text: "Prop firm challenge support" },
              ].map(i => (
                <div key={i.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F8EF7", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i.icon}</span>
                  <span style={{ fontSize: 14, color: "#8B93A8" }}>{i.text}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: "1.25rem", borderRadius: 14, background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.18)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#00D084", marginBottom: 4 }}>🎓 Next Intake</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#F0F2F7" }}>June 2025 — Limited spots</div>
              <div style={{ fontSize: 12, color: "#8B93A8", marginTop: 3 }}>Apply now to secure your place before enrolment closes.</div>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ flex: "1 1 460px" }}>
            {status === "success" ? (
              <div style={{ padding: "3rem 2rem", borderRadius: 20, background: "#111318", border: "1px solid rgba(0,208,132,0.25)", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,208,132,0.1)", border: "2px solid rgba(0,208,132,0.3)", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎉</div>
                <h3 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: 22, fontWeight: 800, color: "#F0F2F7", marginBottom: "0.75rem" }}>Application received!</h3>
                <p style={{ color: "#8B93A8", fontSize: 15, lineHeight: 1.75, maxWidth: 360, margin: "0 auto 1.5rem" }}>
                  We have sent a confirmation to your email. Our team will reach out within <strong style={{ color: "#4F8EF7" }}>24–48 hours</strong>.
                </p>
                <p style={{ color: "#8B93A8", fontSize: 14, margin: "0 0 1.5rem" }}>In the meantime, join our Telegram community:</p>
                <a href="https://t.me/fxaubot" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                  ✈️ Join Telegram Community
                </a>
              </div>
            ) : (
              <div style={{ padding: "2.5rem", borderRadius: 20, background: "#111318", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                <h3 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: 20, fontWeight: 800, marginBottom: "0.5rem" }}>Apply for enrolment</h3>
                <p style={{ color: "#8B93A8", fontSize: 14, marginBottom: "1.75rem" }}>All fields marked * are required. We will respond within 24 hours.</p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {/* Name + Email */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.05em" }}>FULL NAME *</label>
                      <input name="name" value={form.name} onChange={handleChange} required placeholder="Alex Johnson"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.05em" }}>EMAIL *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                    </div>
                  </div>

                  {/* Phone + Country */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.05em" }}>PHONE *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+256 700 000 000"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.05em" }}>COUNTRY *</label>
                      <input name="country" value={form.country} onChange={handleChange} required placeholder="Uganda"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.05em" }}>TRADING EXPERIENCE *</label>
                    <select name="experience" value={form.experience} onChange={handleChange} required
                      style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                      onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}>
                      <option value="" style={{ background: "#111318" }}>Select your level…</option>
                      <option value="Complete Beginner" style={{ background: "#111318" }}>Complete Beginner — I have never traded</option>
                      <option value="Beginner" style={{ background: "#111318" }}>Beginner — I know the basics but lost money</option>
                      <option value="Intermediate" style={{ background: "#111318" }}>Intermediate — I trade but inconsistently</option>
                      <option value="Advanced" style={{ background: "#111318" }}>Advanced — I want bots and prop firm prep</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.05em" }}>MESSAGE (OPTIONAL)</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Tell us your goals or any questions you have…"
                      style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                      onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                  </div>

                  {status === "error" && (
                    <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,75,110,0.1)", border: "1px solid rgba(255,75,110,0.25)", fontSize: 14, color: "#FF4B6E" }}>
                      Something went wrong. Please try again or contact us on Telegram.
                    </div>
                  )}

                  <button type="submit" disabled={status === "loading"}
                    style={{ width: "100%", padding: "15px", borderRadius: 12, background: grad, color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.6 : 1, boxShadow: "0 6px 24px rgba(79,142,247,0.35)", letterSpacing: "0.02em", marginTop: 4 }}>
                    {status === "loading" ? "Submitting…" : "Submit Application →"}
                  </button>

                  <p style={{ textAlign: "center", fontSize: 12, color: "#525A6E", lineHeight: 1.6, margin: 0 }}>
                    By applying you agree to be contacted by the FXAU team. We never spam or share your data.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Academy <span style={gradText}>FAQs</span>
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
        <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
          Ready to start your<br /><span style={gradText}>trading journey?</span>
        </h2>
        <p style={{ color: "#8B93A8", fontSize: 16, maxWidth: 440, margin: "0 auto 2rem", lineHeight: 1.75 }}>
          Apply for the next intake today. Limited spots available — we only accept serious students.
        </p>
        <a href="#signup" style={{ display: "inline-block", padding: "14px 40px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 28px rgba(79,142,247,0.4)" }}>
          Apply Now — Free to Register →
        </a>
      </section>

    </div>
  )
}
