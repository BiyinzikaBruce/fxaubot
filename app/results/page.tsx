"use client"

import Link from "next/link"

const grad = "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)"
const gradText: React.CSSProperties = {
  background: grad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

const STATS = [
  { val: "$2.3M+",  label: "Total Profits Tracked" },
  { val: "12,400+", label: "Active Traders" },
  { val: "73%",     label: "Platform Win Rate" },
  { val: "48ms",    label: "Avg Execution Speed" },
]

// ── Card components ────────────────────────────────────────────────────────

function CardShell({ children, label, sublabel, highlight = "#00D084" }: {
  children: React.ReactNode
  label: string
  sublabel: string
  highlight?: string
}) {
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#111318", breakInside: "avoid", marginBottom: 16, cursor: "default" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(79,142,247,0.35)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"}
    >
      {children}
      {/* Overlay */}
      <div style={{ background: "linear-gradient(transparent 0%, rgba(8,9,14,0.92) 60%)", padding: "2.5rem 1.25rem 1.25rem", marginTop: -1 }}>
        <div style={{ fontSize: "clamp(1.4rem,3vw,1.75rem)", fontWeight: 900, color: highlight, fontFamily: "var(--font-space-grotesk,sans-serif)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{label}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#8B93A8", letterSpacing: "0.08em", marginTop: 4 }}>{sublabel}</div>
      </div>
    </div>
  )
}

// Terminal-style account header
function TerminalHeader({ account }: { account: string }) {
  return (
    <div style={{ padding: "10px 14px", background: "#0A0B10", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFBD2E" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28C840" }} />
      </div>
      <span style={{ fontSize: 10, color: "#525A6E", flex: 1, textAlign: "center" }}>{account}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00D084", boxShadow: "0 0 4px #00D084" }} />
        <span style={{ fontSize: 9, color: "#00D084", fontWeight: 700 }}>LIVE</span>
      </div>
    </div>
  )
}

function Row({ label, val, color = "#F0F2F7" }: { label: string; val: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 12, color: "#525A6E" }}>{label}:</span>
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" style={{ color: "#8B93A8", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign In</Link>
          <Link href="/register" style={{ padding: "8px 20px", borderRadius: 999, background: grad, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(79,142,247,0.3)" }}>GET STARTED</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "5rem 2rem 3rem", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.35)", background: "rgba(79,142,247,0.08)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#4F8EF7", marginBottom: "1.5rem" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4F8EF7", boxShadow: "0 0 6px #4F8EF7", display: "inline-block" }} />
          VERIFIED COMMUNITY RESULTS
        </div>
        <h1 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>
          Real traders. <span style={gradText}>Real results.</span>
        </h1>
        <p style={{ color: "#8B93A8", fontSize: 17, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 3rem" }}>
          These are actual results from FXAU traders using our bots, journal, and copy trading features. No demos, no cherry-picks.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: "4rem" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ padding: "1.25rem 2.5rem", borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-space-grotesk,sans-serif)", ...gradText }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#525A6E", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Masonry grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem 6rem" }}>
        <div style={{ columns: "3 280px", columnGap: 16 }}>

          {/* ── Card 1: Account growth R500 → R40k ── */}
          <CardShell label="$500 → $12,400+" sublabel="XAUUSD — 3 MONTH GROWTH" highlight="#00D084">
            <TerminalHeader account="MT5 · Account #84719234" />
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ marginBottom: "0.75rem" }}>
                <Row label="Balance"       val="$12,456.78" color="#F0F2F7" />
                <Row label="Equity"        val="$13,124.55" color="#00D084" />
                <Row label="Profit"        val="+$11,956.78" color="#00D084" />
                <Row label="Margin Level"  val="4,534%" color="#4F8EF7" />
                <Row label="Free Margin"   val="$12,835.15" />
              </div>
              <div style={{ fontSize: 10, color: "#525A6E", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>OPEN POSITIONS</div>
              {[
                { pair: "XAUUSD", dir: "BUY",  lot: "0.02", pnl: "+$234.56" },
                { pair: "EURUSD", dir: "SELL", lot: "0.01", pnl: "+$45.23" },
              ].map(p => (
                <div key={p.pair} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{p.pair}</span>
                  <span style={{ fontSize: 10, color: p.dir === "BUY" ? "#4F8EF7" : "#7B5CF0", fontWeight: 700 }}>{p.dir} {p.lot}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#00D084" }}>{p.pnl}</span>
                </div>
              ))}
              <div style={{ marginTop: "0.85rem", padding: "8px 10px", borderRadius: 8, background: "rgba(0,208,132,0.07)", border: "1px solid rgba(0,208,132,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#8B93A8" }}>FXAU Bot — Running</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D084" }} />
                  <span style={{ fontSize: 10, color: "#00D084", fontWeight: 700 }}>ACTIVE</span>
                </div>
              </div>
            </div>
          </CardShell>

          {/* ── Card 2: Quick profit ── */}
          <CardShell label="Quick $119 Profit" sublabel="EURUSD — TAKE PROFIT HIT" highlight="#4F8EF7">
            <TerminalHeader account="MT4 · Account #20394817" />
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ fontSize: 12, color: "#8B93A8", marginBottom: "0.75rem", lineHeight: 1.6 }}>
                Profits 🤑 I close or the bot will? 🤖
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: 11, color: "#525A6E" }}>Balance before:</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>$4,395.49</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: 11, color: "#525A6E" }}>Balance after:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#00D084" }}>$4,514.74</span>
              </div>
              <div style={{ padding: "10px", borderRadius: 10, background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.18)" }}>
                <div style={{ fontSize: 11, color: "#525A6E", marginBottom: 3 }}>EURUSD · SELL · 0.02 lots</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#00D084" }}>+$119.25</div>
                <div style={{ fontSize: 10, color: "#525A6E", marginTop: 2 }}>TP hit automatically by bot</div>
              </div>
            </div>
          </CardShell>

          {/* ── Card 3: Withdrawal ── */}
          <CardShell label="$3,040 Withdrawal" sublabel="XAUUSD — REGULAR MONDAY" highlight="#00D084">
            <TerminalHeader account="FXAU · Wallet Withdrawal" />
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,208,132,0.12)", border: "2px solid rgba(0,208,132,0.3)", margin: "0 auto 0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✓</div>
                <div style={{ fontSize: 11, color: "#525A6E", marginBottom: 4 }}>WITHDRAWAL CONFIRMED</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#00D084", fontFamily: "var(--font-space-grotesk,sans-serif)" }}>$3,040.00</div>
              </div>
              <div style={{ fontSize: 10, color: "#525A6E", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8, marginTop: 4 }}>DETAILS</div>
              <Row label="Reference"  val="TXN-48291-FXAU" />
              <Row label="Method"     val="Bank Transfer" />
              <Row label="Status"     val="Completed ✓"  color="#00D084" />
              <Row label="Date"       val="May 30, 2025" />
            </div>
          </CardShell>

          {/* ── Card 4: Win streak ── */}
          <CardShell label="7 Wins in a Row" sublabel="MULTIPLE PAIRS — BOT RESULTS" highlight="#4F8EF7">
            <TerminalHeader account="MT5 · Trade History" />
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ fontSize: 10, color: "#525A6E", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>CLOSED POSITIONS</div>
              {[
                { pair: "XAUUSD", dir: "BUY",  pnl: "+$284", r: "+1.8R", win: true },
                { pair: "EURUSD", dir: "SELL", pnl: "+$127", r: "+0.9R", win: true },
                { pair: "BTCUSD", dir: "BUY",  pnl: "+$512", r: "+3.2R", win: true },
                { pair: "GBPUSD", dir: "SELL", pnl: "+$198", r: "+1.3R", win: true },
                { pair: "XAUUSD", dir: "BUY",  pnl: "+$341", r: "+2.1R", win: true },
                { pair: "EURUSD", dir: "BUY",  pnl: "+$95",  r: "+0.7R", win: true },
                { pair: "BTCUSD", dir: "BUY",  pnl: "+$623", r: "+3.8R", win: true },
              ].map((t, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 40px 1fr 50px 28px", gap: 4, padding: "6px 8px", borderRadius: 7, background: i === 0 ? "rgba(79,142,247,0.06)" : "transparent", marginBottom: 3, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{t.pair}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.dir === "BUY" ? "#4F8EF7" : "#7B5CF0" }}>{t.dir}</span>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(0,208,132,0.25)" }}><div style={{ height: "100%", width: `${60 + i * 5}%`, borderRadius: 2, background: "#00D084" }} /></div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#00D084", textAlign: "right" }}>{t.pnl}</span>
                  <span style={{ fontSize: 9, color: "#00D084", textAlign: "right" }}>✓</span>
                </div>
              ))}
              <div style={{ marginTop: "0.75rem", padding: "8px 10px", borderRadius: 8, background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.15)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#525A6E" }}>Total this session</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#00D084" }}>+$2,180</span>
              </div>
            </div>
          </CardShell>

          {/* ── Card 5: Equity screenshot ── */}
          <CardShell label="$25,555 Equity" sublabel="US30 — FROM $1,500 DEPOSIT" highlight="#00D084">
            <TerminalHeader account="MT4 · Account #72938410" />
            <div style={{ padding: "1rem 1.25rem" }}>
              <Row label="Balance"      val="$25,000.00" />
              <Row label="Equity"       val="$25,555.46" color="#00D084" />
              <Row label="Credit"       val="$0.00" />
              <Row label="Margin"       val="$30,055.46" />
              <Row label="Open P&L"     val="+$555.46"   color="#00D084" />
              <div style={{ marginTop: "0.85rem" }}>
                <svg viewBox="0 0 280 60" style={{ width: "100%", height: 60, display: "block" }}>
                  <defs><linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F8EF7" stopOpacity="0.3" /><stop offset="100%" stopColor="#4F8EF7" stopOpacity="0" /></linearGradient></defs>
                  <path d="M0,55 C30,50 50,42 80,35 C110,28 130,40 160,25 C190,12 220,18 250,8 L280,5 L280,60 L0,60 Z" fill="url(#rg1)" />
                  <path d="M0,55 C30,50 50,42 80,35 C110,28 130,40 160,25 C190,12 220,18 250,8 L280,5" fill="none" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </CardShell>

          {/* ── Card 6: Daily profit ── */}
          <CardShell label="$284 — Regular Monday" sublabel="XAUUSD — DAILY BOT PROFIT" highlight="#4F8EF7">
            <TerminalHeader account="FXAU Dashboard · Today" />
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "0.75rem" }}>
                {[
                  { label: "Today P&L", val: "+$284", color: "#00D084" },
                  { label: "Win Rate",  val: "100%",  color: "#4F8EF7" },
                  { label: "Trades",    val: "4",     color: "#F0F2F7" },
                  { label: "Bots",      val: "3 / 3", color: "#4F8EF7" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 9, color: "#525A6E", marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#8B93A8", fontStyle: "italic", textAlign: "center", padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                "Always trust the process 🙏 FXAU never misses Mondays"
              </div>
            </div>
          </CardShell>

          {/* ── Card 7: Bot combined P&L ── */}
          <CardShell label="$1,780 Today" sublabel="ALL BOTS — COMBINED P&L" highlight="#00D084">
            <TerminalHeader account="FXAU Bot Manager" />
            <div style={{ padding: "1rem 1.25rem" }}>
              {[
                { name: "XAUUSD Scalper", pair: "XAU/USD", trades: 12, pnl: "+$841", bar: 68, status: "IN TRADE" },
                { name: "EUR Trend Bot",  pair: "EUR/USD", trades: 8,  pnl: "+$312", bar: 42, status: "WAITING" },
                { name: "BTC Breakout",   pair: "BTC/USD", trades: 5,  pnl: "+$627", bar: 54, status: "IN TRADE" },
              ].map(bot => (
                <div key={bot.name} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{bot.name}</div>
                      <div style={{ fontSize: 10, color: "#525A6E" }}>{bot.pair} · {bot.trades} trades</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#00D084" }}>{bot.pnl}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: bot.status === "IN TRADE" ? "#4F8EF7" : "#525A6E" }}>{bot.status}</div>
                    </div>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ height: "100%", width: `${bot.bar}%`, borderRadius: 2, background: grad }} />
                  </div>
                </div>
              ))}
            </div>
          </CardShell>

          {/* ── Card 8: Account growth chart ── */}
          <CardShell label="$500 → $18,240" sublabel="BTCUSD — 3 MONTH BOT RUN" highlight="#7B5CF0">
            <TerminalHeader account="FXAU Analytics · 90D" />
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#525A6E" }}>Starting balance</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>$500.00</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#525A6E" }}>Current balance</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#00D084" }}>$18,240.00</div>
                </div>
              </div>
              <svg viewBox="0 0 280 90" style={{ width: "100%", height: 90, display: "block", marginBottom: "0.75rem" }}>
                <defs>
                  <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B5CF0" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7B5CF0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,85 C20,83 35,80 55,75 C75,70 85,72 105,65 C125,58 140,55 160,45 C180,34 195,28 220,18 C240,10 258,6 280,3 L280,90 L0,90 Z" fill="url(#rg2)" />
                <path d="M0,85 C20,83 35,80 55,75 C75,70 85,72 105,65 C125,58 140,55 160,45 C180,34 195,28 220,18 C240,10 258,6 280,3" fill="none" stroke="#7B5CF0" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="280" cy="3" r="4" fill="#7B5CF0" />
                <circle cx="280" cy="3" r="8" fill="rgba(123,92,240,0.25)" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#525A6E" }}>
                <span>Mar 2025</span><span>Apr 2025</span><span>May 2025</span>
              </div>
              <div style={{ marginTop: "0.65rem", padding: "6px 10px", borderRadius: 8, background: "rgba(123,92,240,0.08)", border: "1px solid rgba(123,92,240,0.2)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#525A6E" }}>Total return</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#7B5CF0" }}>+3,548%</span>
              </div>
            </div>
          </CardShell>

          {/* ── Card 9: Prop firm challenge ── */}
          <CardShell label="Prop Challenge Passed" sublabel="$100K FUNDED — FTMO SYNC" highlight="#4F8EF7">
            <TerminalHeader account="FXAU Prop Tracker · FTMO" />
            <div style={{ padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(0,208,132,0.07)", border: "1px solid rgba(0,208,132,0.2)", marginBottom: "0.75rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,208,132,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏆</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#00D084" }}>CHALLENGE PASSED</div>
                  <div style={{ fontSize: 10, color: "#525A6E" }}>$100K account · Phase 2 complete</div>
                </div>
              </div>
              {[
                { label: "Account Size",    val: "$100,000", color: "#F0F2F7" },
                { label: "Profit Target",   val: "10% ✓",   color: "#00D084" },
                { label: "Max Drawdown",    val: "3.2% / 10%", color: "#4F8EF7" },
                { label: "Profit Made",     val: "+$10,840", color: "#00D084" },
              ].map(r => <Row key={r.label} label={r.label} val={r.val} color={r.color} />)}
              <div style={{ marginTop: "0.75rem", fontSize: 11, color: "#8B93A8", fontStyle: "italic" }}>
                "FXAU tracked every rule automatically — never breached a single limit 🎯"
              </div>
            </div>
          </CardShell>

        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 2rem", background: "#0D0F16", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-space-grotesk,sans-serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
          Your results could be <span style={gradText}>next.</span>
        </h2>
        <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 2rem" }}>
          Start for free — no credit card needed. Connect your broker and let FXAU do the heavy lifting.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/register" style={{ padding: "14px 34px", borderRadius: 999, background: grad, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 24px rgba(79,142,247,0.35)" }}>
            Start Free Today →
          </Link>
          <a href="https://t.me/fxaubot" target="_blank" rel="noopener noreferrer" style={{ padding: "14px 28px", borderRadius: 999, border: "1px solid rgba(79,142,247,0.3)", color: "#4F8EF7", fontWeight: 700, fontSize: 15, textDecoration: "none", background: "rgba(79,142,247,0.07)" }}>
            ✈️ Join Telegram
          </a>
        </div>
      </section>

    </div>
  )
}
