"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "@/lib/auth-client"

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})
type FormData = z.infer<typeof schema>

const TESTIMONIALS = [
  { quote: "FXAU completely changed how I track my trades. The bot automation alone pays for itself.", name: "James K.", role: "Forex Trader · London" },
  { quote: "Finally a journal that connects to my prop firm and tracks every rule automatically.", name: "Sara M.", role: "Prop Trader · Dubai" },
  { quote: "The AI insights showed me I was overtrading on Fridays. Fixed that, win rate jumped 12%.", name: "Luca B.", role: "Swing Trader · Milan" },
]

const grad = "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)"
const gradText: React.CSSProperties = {
  background: grad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") ?? "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [testimonialIdx] = useState(() => Math.floor(Math.random() * 3))

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const result = await signIn.email({ email: data.email, password: data.password })
    if (result.error) {
      setError(result.error.message ?? "Invalid credentials")
    } else {
      router.push(from)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn.social({ provider: "google", callbackURL: from })
  }

  const t = TESTIMONIALS[testimonialIdx]

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#08090E", fontFamily: "var(--font-dm-sans, sans-serif)", color: "#F0F2F7" }}>

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div style={{ flex: "0 0 52%", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem 4rem 4rem 4.5rem", overflow: "hidden" }}
        className="hidden lg:flex">
        {/* Background glow */}
        <div style={{ position: "absolute", top: "0%", left: "-15%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(79,142,247,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "0%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(123,92,240,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(79,142,247,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: "3.5rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", boxShadow: "0 0 20px rgba(79,142,247,0.4)" }}>FX</div>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-space-grotesk, sans-serif)", ...gradText }}>FXAU</span>
        </Link>

        {/* Headline */}
        <div style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontFamily: "var(--font-space-grotesk, sans-serif)", fontSize: "clamp(2.2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
            Welcome back.<br /><span style={gradText}>Your edge awaits.</span>
          </h1>
          <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 400 }}>
            Your bots, journal, and copy trades are live. Sign in to see what happened while you were away.
          </p>
        </div>

        {/* Live stats strip */}
        <div style={{ display: "flex", gap: 0, marginBottom: "3rem", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { icon: "🤖", label: "Bots Running", val: "3,241" },
            { icon: "📈", label: "Trades Today", val: "18,900+" },
            { icon: "💰", label: "P&L Today",   val: "+$284K" },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, padding: "1.1rem 1.25rem", background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space-grotesk, sans-serif)", color: "#F0F2F7" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#525A6E", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial card */}
        <div style={{ padding: "1.5rem", borderRadius: 16, background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)" }}>
          <div style={{ fontSize: 22, color: "#4F8EF7", marginBottom: "0.75rem", opacity: 0.7 }}>"</div>
          <p style={{ fontSize: 15, color: "#8B93A8", lineHeight: 1.7, margin: "0 0 1rem", fontStyle: "italic" }}>{t.quote}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {t.name[0]}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#F0F2F7" }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "#525A6E" }}>{t.role}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#F5A623", fontSize: 12 }}>★</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: Form ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "#0D0F16", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }} className="lg:hidden">
            <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-space-grotesk, sans-serif)", ...gradText }}>FXAU</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-space-grotesk, sans-serif)", fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.01em" }}>Sign in to FXAU</h2>
            <p style={{ color: "#8B93A8", fontSize: 15 }}>Your trading dashboard is waiting.</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#F0F2F7", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background 0.2s, border-color 0.2s", marginBottom: "1.25rem" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 12, color: "#525A6E", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.04em" }}>EMAIL</label>
              <input {...register("email")} type="email" placeholder="you@example.com"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 16px", fontSize: 15, color: "#F0F2F7", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              {errors.email && <p style={{ marginTop: 5, fontSize: 12, color: "#FF4B6E" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#8B93A8", letterSpacing: "0.04em" }}>PASSWORD</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "#4F8EF7", textDecoration: "none", fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <input {...register("password")} type="password" placeholder="••••••••"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 16px", fontSize: 15, color: "#F0F2F7", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              {errors.password && <p style={{ marginTop: 5, fontSize: 12, color: "#FF4B6E" }}>{errors.password.message}</p>}
            </div>

            {error && (
              <div style={{ borderRadius: 10, background: "rgba(255,75,110,0.1)", border: "1px solid rgba(255,75,110,0.25)", padding: "12px 16px", fontSize: 14, color: "#FF4B6E" }}>{error}</div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
              style={{ width: "100%", padding: "15px", borderRadius: 12, background: grad, color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1, boxShadow: "0 6px 24px rgba(79,142,247,0.35)", letterSpacing: "0.02em", transition: "opacity 0.2s", marginTop: 4 }}>
              {isSubmitting ? "Signing in…" : "Sign In to Dashboard →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 14, color: "#8B93A8" }}>
            {"Don't have an account? "}
            <Link href="/register" style={{ color: "#4F8EF7", fontWeight: 600, textDecoration: "none" }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
