"use client"

import Link from "next/link"

const grad = "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)"
const gradText: React.CSSProperties = {
  background: grad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

// ── Reusable card shell ────────────────────────────────────────────────────
function ResultCard({
  children,
  profit,
  sublabel,
  color = "#00D084",
  time,
}: {
  children: React.ReactNode
  profit: string
  sublabel: string
  color?: string
  time?: string
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#0D0F16",
        breakInside: "avoid",
        marginBottom: 14,
        transition: "transform 0.2s, border-color 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = "translateY(-4px)"
        el.style.borderColor = "rgba(79,142,247,0.4)"
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = "translateY(0)"
        el.style.borderColor = "rgba(255,255,255,0.07)"
      }}
    >
      {/* Phone status bar */}
      <div style={{
        background: "#06070C",
        padding: "8px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#F0F2F7" }}>{time ?? "9:41"}</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
            {[6, 9, 12, 15].map((h, i) => (
              <div key={i} style={{ width: 2.5, height: h, borderRadius: 1, background: i < 3 ? "#F0F2F7" : "rgba(255,255,255,0.2)" }} />
            ))}
          </div>
          <div style={{ width: 20, height: 10, borderRadius: 2, border: "1.5px solid rgba(255,255,255,0.4)", position: "relative" }}>
            <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, width: "75%", borderRadius: 1, background: "#00D084" }} />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div>{children}</div>

      {/* Profit overlay */}
      <div style={{
        background: "linear-gradient(0deg, rgba(6,7,12,0.97) 0%, rgba(6,7,12,0.85) 55%, transparent 100%)",
        padding: "2.5rem 1.25rem 1.25rem",
      }}>
        <div style={{
          fontSize: "clamp(1.5rem,3.5vw,2rem)",
          fontWeight: 900,
          color,
          fontFamily: "var(--font-space-grotesk,sans-serif)",
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          textShadow: `0 0 20px ${color}66`,
        }}>
          {profit}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#8B93A8", letterSpacing: "0.08em", marginTop: 5 }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}

function Row({ label, val, color = "#F0F2F7" }: { label: string; val: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 12, color: "#525A6E" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#08090E", color: "#F0F2F7", fontFamily: "var(--font-dm-sans,sans-serif)" }}>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,9,14,0.9)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>FX</div>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space-grotesk,sans-serif)", ...gradText }}>FXAU</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {[["Home", "/"], ["Features", "/#features"], ["Pricing", "/pricing"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px" }}>Sign In</Link>
          <Link href="/register" style={{ padding: "8px 20px", borderRadius: 999, background: grad, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(79,142,247,0.3)" }}>GET STARTED</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "4.5rem 2rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "30%", width: "40%", height: "200%", background: "radial-gradient(ellipse, rgba(79,142,247,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.35)", background: "rgba(79,142,247,0.08)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#4F8EF7", marginBottom: "1.5rem" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4F8EF7", boxShadow: "0 0 6px #4F8EF7", display: "inline-block", animation: "pulse 1.5s infinite" }} />
          LIVE COMMUNITY RESULTS
        </div>
        <h1 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2.4rem,5vw,3.6rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
          Real traders.<br /><span style={gradText}>Real profits.</span>
        </h1>
        <p style={{ color: "#8B93A8", fontSize: 17, lineHeight: 1.75, maxWidth: 520, margin: "0 auto 2.5rem" }}>
          Verified results from FXAU traders using bots, copy trading, and our journal. No demos. No fakes.
        </p>

        {/* Stats bar */}
        <div style={{ display: "inline-flex", gap: 0, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", marginBottom: "4rem" }}>
          {[
            { val: "$2.3M+",  label: "Profits Tracked" },
            { val: "12,400+", label: "Active Traders" },
            { val: "73%",     label: "Avg Win Rate" },
            { val: "3,241",   label: "Bots Running" },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ padding: "1rem 2rem", background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-space-grotesk,sans-serif)", ...gradText }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#525A6E", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Masonry grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 6rem" }}>
        <div style={{ columns: "3 300px", columnGap: 14 }}>

          {/* ─ 1: Account $500 → $12,400 ─ */}
          <ResultCard profit="$500 → $12,400+" sublabel="XAUUSD — 3 MONTH BOT RUN" color="#00D084" time="10:24">
            <div style={{ padding: "1rem 1.25rem 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(79,142,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>FXAU Bot · Account #84719</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00D084" }} />
                    <span style={{ fontSize: 10, color: "#00D084", fontWeight: 700 }}>RUNNING</span>
                  </div>
                </div>
              </div>
              <Row label="Balance"     val="$12,456.78" />
              <Row label="Equity"      val="$13,124.55" color="#00D084" />
              <Row label="Total Profit" val="+$11,956.78" color="#00D084" />
              <Row label="Margin Level" val="4,534%" color="#4F8EF7" />
              <Row label="Open Trades" val="2 positions" />
              <div style={{ marginTop: "0.85rem" }}>
                {[
                  { pair: "XAUUSD", side: "BUY",  lot: "0.02", pnl: "+$234.56" },
                  { pair: "EURUSD", side: "SELL", lot: "0.01", pnl: "+$45.23" },
                ].map(p => (
                  <div key={p.pair} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{p.pair}</span>
                    <span style={{ fontSize: 10, color: p.side === "BUY" ? "#4F8EF7" : "#7B5CF0", fontWeight: 700 }}>{p.side} {p.lot}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#00D084" }}>{p.pnl}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.85rem 0 0" }} />
            </div>
          </ResultCard>

          {/* ─ 2: Quick profit notification ─ */}
          <ResultCard profit="Quick $119 Profit" sublabel="EURUSD — TAKE PROFIT HIT" color="#4F8EF7" time="14:07">
            <div style={{ padding: "1rem 1.25rem 0" }}>
              <div style={{ fontSize: 12, color: "#8B93A8", marginBottom: "0.85rem", lineHeight: 1.6, fontStyle: "italic" }}>
                "Profits 🤑 I close or the bot will? 🤖<br />Always trust the process!"
              </div>
              <div style={{ padding: "1rem", borderRadius: 12, background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)" }}>
                <Row label="Before" val="$4,395.49" />
                <Row label="After"  val="$4,514.74" color="#00D084" />
                <div style={{ marginTop: "0.65rem", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#00D084" }}>+$119.25</div>
                  <div style={{ fontSize: 10, color: "#525A6E", marginTop: 3 }}>TP hit automatically · EURUSD SELL</div>
                </div>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.85rem 0 0" }} />
            </div>
          </ResultCard>

          {/* ─ 3: Withdrawal ─ */}
          <ResultCard profit="$3,040 Withdrawal" sublabel="XAUUSD — REGULAR MONDAY" color="#00D084" time="09:15">
            <div style={{ padding: "1.25rem 1.25rem 0", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,208,132,0.1)", border: "2px solid rgba(0,208,132,0.3)", margin: "0 auto 0.85rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✓</div>
              <div style={{ fontSize: 11, color: "#525A6E", letterSpacing: "0.08em", marginBottom: 4 }}>WITHDRAWAL CONFIRMED</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#00D084", fontFamily: "var(--font-space-grotesk,sans-serif)", letterSpacing: "-0.03em" }}>$3,040</div>
              <div style={{ padding: "0 0 0.75rem" }}>
                <div style={{ marginTop: "1rem", textAlign: "left" }}>
                  <Row label="Reference" val="TXN-48291" />
                  <Row label="Method"    val="Bank Transfer" />
                  <Row label="Status"    val="Completed ✓" color="#00D084" />
                  <Row label="Date"      val="May 30, 2025" />
                </div>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 0 0" }} />
            </div>
          </ResultCard>

          {/* ─ 4: 7 wins in a row ─ */}
          <ResultCard profit="7 Wins Straight" sublabel="MULTIPLE PAIRS — FXAU BOT" color="#4F8EF7" time="16:52">
            <div style={{ padding: "1rem 1.25rem 0" }}>
              <div style={{ fontSize: 10, color: "#525A6E", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>CLOSED POSITIONS · TODAY</div>
              {[
                { pair: "XAUUSD", side: "BUY",  pnl: "+$284", r: "1.8R" },
                { pair: "EURUSD", side: "SELL", pnl: "+$127", r: "0.9R" },
                { pair: "BTCUSD", side: "BUY",  pnl: "+$512", r: "3.2R" },
                { pair: "GBPUSD", side: "SELL", pnl: "+$198", r: "1.3R" },
                { pair: "XAUUSD", side: "BUY",  pnl: "+$341", r: "2.1R" },
                { pair: "EURUSD", side: "BUY",  pnl: "+$95",  r: "0.7R" },
                { pair: "BTCUSD", side: "BUY",  pnl: "+$623", r: "3.8R" },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, background: i === 0 ? "rgba(79,142,247,0.06)" : "transparent", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, width: 68 }}>{t.pair}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.side === "BUY" ? "#4F8EF7" : "#7B5CF0", width: 36 }}>{t.side}</span>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(0,208,132,0.15)" }}>
                    <div style={{ height: "100%", width: `${50 + i * 6}%`, borderRadius: 2, background: "#00D084" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#00D084", width: 48, textAlign: "right" }}>{t.pnl}</span>
                  <span style={{ fontSize: 9, color: "#00D084", width: 22, textAlign: "right" }}>✓</span>
                </div>
              ))}
              <div style={{ marginTop: "0.75rem", padding: "9px 12px", borderRadius: 10, background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.15)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#525A6E" }}>Session total</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: "#00D084" }}>+$2,180</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.85rem 0 0" }} />
            </div>
          </ResultCard>

          {/* ─ 5: Equity $25k ─ */}
          <ResultCard profit="$25,555 Equity" sublabel="US30 — FROM $1,500 DEPOSIT" color="#00D084" time="11:30">
            <div style={{ padding: "1rem 1.25rem 0" }}>
              <Row label="Balance"    val="$25,000.00" />
              <Row label="Equity"     val="$25,555.46" color="#00D084" />
              <Row label="Open P&L"   val="+$555.46"  color="#00D084" />
              <Row label="Margin"     val="$30,055.46" />
              <svg viewBox="0 0 280 70" style={{ width: "100%", height: 70, display: "block", marginTop: "0.75rem" }}>
                <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F8EF7" stopOpacity="0.35" /><stop offset="100%" stopColor="#4F8EF7" stopOpacity="0" /></linearGradient></defs>
                <path d="M0,60 C30,55 55,47 80,40 C110,32 130,44 155,30 C180,16 205,20 235,10 L280,6 L280,70 L0,70 Z" fill="url(#eg)" />
                <path d="M0,60 C30,55 55,47 80,40 C110,32 130,44 155,30 C180,16 205,20 235,10 L280,6" fill="none" stroke="#4F8EF7" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="280" cy="6" r="4" fill="#4F8EF7" />
                <circle cx="280" cy="6" r="8" fill="rgba(79,142,247,0.22)" />
              </svg>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 0 0" }} />
            </div>
          </ResultCard>

          {/* ─ 6: Daily profit ─ */}
          <ResultCard profit="$284 Every Monday" sublabel="XAUUSD — DAILY BOT RUN" color="#4F8EF7" time="09:02">
            <div style={{ padding: "1rem 1.25rem 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "0.85rem" }}>
                {[
                  { l: "Today P&L", v: "+$284", c: "#00D084" },
                  { l: "Win Rate",  v: "100%",  c: "#4F8EF7" },
                  { l: "Trades",    v: "4",     c: "#F0F2F7" },
                  { l: "Bots",      v: "3 / 3", c: "#4F8EF7" },
                ].map(s => (
                  <div key={s.l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 11px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 9, color: "#525A6E", marginBottom: 4, fontWeight: 600 }}>{s.l}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: s.c, fontFamily: "var(--font-space-grotesk,sans-serif)" }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)", fontSize: 12, color: "#8B93A8", fontStyle: "italic", lineHeight: 1.55 }}>
                "FXAU never misses Mondays 🙏 trust the process and let the bot cook"
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.85rem 0 0" }} />
            </div>
          </ResultCard>

          {/* ─ 7: Bot combined ─ */}
          <ResultCard profit="$1,780 Combined" sublabel="ALL BOTS — TODAY'S P&L" color="#00D084" time="20:14">
            <div style={{ padding: "1rem 1.25rem 0" }}>
              {[
                { name: "XAUUSD Scalper", pair: "XAU/USD", trades: 12, pnl: "+$841", pct: 68, status: "IN TRADE", sc: "#4F8EF7" },
                { name: "EUR Trend Bot",  pair: "EUR/USD", trades: 8,  pnl: "+$312", pct: 42, status: "WAITING",  sc: "#525A6E" },
                { name: "BTC Breakout",   pair: "BTC/USD", trades: 5,  pnl: "+$627", pct: 54, status: "IN TRADE", sc: "#4F8EF7" },
              ].map(b => (
                <div key={b.name} style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{b.name}</div>
                      <div style={{ fontSize: 10, color: "#525A6E" }}>{b.pair} · {b.trades} trades</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#00D084" }}>{b.pnl}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: b.sc, letterSpacing: "0.05em" }}>{b.status}</div>
                    </div>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ height: "100%", width: `${b.pct}%`, borderRadius: 2, background: grad }} />
                  </div>
                </div>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 0 0" }} />
            </div>
          </ResultCard>

          {/* ─ 8: 3-month growth ─ */}
          <ResultCard profit="$500 → $18,240" sublabel="BTCUSD — 3 MONTH BOT · +3,548%" color="#7B5CF0" time="08:00">
            <div style={{ padding: "1rem 1.25rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#525A6E" }}>Start</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>$500.00</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#525A6E" }}>Now</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#00D084" }}>$18,240.00</div>
                </div>
              </div>
              <svg viewBox="0 0 280 90" style={{ width: "100%", height: 90, display: "block" }}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B5CF0" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7B5CF0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,85 C18,83 34,80 52,76 C70,72 84,74 102,67 C122,59 138,55 158,44 C178,33 196,26 220,16 C242,8 260,5 280,2 L280,90 L0,90 Z" fill="url(#pg)" />
                <path d="M0,85 C18,83 34,80 52,76 C70,72 84,74 102,67 C122,59 138,55 158,44 C178,33 196,26 220,16 C242,8 260,5 280,2" fill="none" stroke="#7B5CF0" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="280" cy="2" r="4" fill="#7B5CF0" />
                <circle cx="280" cy="2" r="9" fill="rgba(123,92,240,0.25)" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#525A6E", padding: "0.35rem 0" }}>
                <span>Mar 2025</span><span>Apr 2025</span><span>May 2025</span>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 9, background: "rgba(123,92,240,0.08)", border: "1px solid rgba(123,92,240,0.2)", display: "flex", justifyContent: "space-between", marginBottom: 0 }}>
                <span style={{ fontSize: 11, color: "#525A6E" }}>Total return</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: "#7B5CF0" }}>+3,548%</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.85rem 0 0" }} />
            </div>
          </ResultCard>

          {/* ─ 9: Prop firm pass ─ */}
          <ResultCard profit="$100K Funded ✓" sublabel="FTMO CHALLENGE — PASSED" color="#4F8EF7" time="13:44">
            <div style={{ padding: "1rem 1.25rem 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 12, background: "rgba(0,208,132,0.07)", border: "1px solid rgba(0,208,132,0.2)", marginBottom: "0.85rem" }}>
                <div style={{ fontSize: 26 }}>🏆</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#00D084" }}>CHALLENGE PASSED</div>
                  <div style={{ fontSize: 10, color: "#525A6E" }}>$100K account · Both phases complete</div>
                </div>
              </div>
              <Row label="Account Size"  val="$100,000"   color="#F0F2F7" />
              <Row label="Profit Made"   val="+$10,840"   color="#00D084" />
              <Row label="Max Drawdown"  val="3.2% / 10%" color="#4F8EF7" />
              <Row label="Win Rate"      val="71%"        color="#4F8EF7" />
              <Row label="Status"        val="Funded ✓"   color="#00D084" />
              <div style={{ marginTop: "0.75rem", padding: "9px 12px", borderRadius: 10, background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.14)", fontSize: 11, color: "#8B93A8", fontStyle: "italic", lineHeight: 1.6 }}>
                "FXAU tracked every rule automatically — never got close to a breach 🎯"
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.85rem 0 0" }} />
            </div>
          </ResultCard>

        </div>
      </div>

      {/* CTA */}
      <section style={{ padding: "5rem 2rem", background: "#0D0F16", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
          Your result could be <span style={gradText}>next.</span>
        </h2>
        <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 460, margin: "0 auto 2rem" }}>
          Start free — no credit card needed. Connect your broker and let FXAU do the work.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/register" style={{ padding: "14px 36px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 28px rgba(79,142,247,0.4)" }}>
            Start Free Today →
          </Link>
          <a href="https://t.me/fxaubot" target="_blank" rel="noopener noreferrer"
            style={{ padding: "14px 28px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.3)", color: "#4F8EF7", fontWeight: 700, fontSize: 15, textDecoration: "none", background: "rgba(79,142,247,0.07)" }}>
            ✈️ Join Telegram
          </a>
        </div>
      </section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }`}</style>
    </div>
  )
}
