"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp, signIn } from "@/lib/auth-client"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["trader", "student"]),
})
type FormData = z.infer<typeof schema>

const STATS = [
  { val: "12,400+", label: "Active Traders" },
  { val: "2.3M+",  label: "Trades Logged" },
  { val: "73%",    label: "Avg Win Rate" },
]

const FEATURES = [
  { icon: "📓", text: "Automated trade journaling across all brokers" },
  { icon: "🤖", text: "AI-powered bots that trade while you sleep" },
  { icon: "📡", text: "Copy top traders automatically in real time" },
  { icon: "🔬", text: "Backtest strategies before risking capital" },
]

const grad = "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)"
const gradText: React.CSSProperties = {
  background: grad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "trader" },
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: FormData) => {
    setError(null)
    const result = await signUp.email({ email: data.email, password: data.password, name: data.name })
    if (result.error) {
      setError(result.error.message ?? "Registration failed")
    } else {
      router.push("/dashboard")
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const result = await signIn.social({ provider: "google", callbackURL: "/dashboard" })
      if (result?.error) {
        setError("Google sign-in failed. Please try email/password instead.")
        setGoogleLoading(false)
      }
    } catch {
      setError("Google sign-in failed. Please try email/password instead.")
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#08090E", fontFamily: "var(--font-dm-sans, sans-serif)", color: "#F0F2F7" }}>

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div style={{ flex: "0 0 52%", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem 4rem 4rem 4.5rem", overflow: "hidden" }}
        className="hidden lg:flex">
        {/* Background glow blobs */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "55%", height: "55%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(79,142,247,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "-5%", width: "45%", height: "45%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(123,92,240,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(79,142,247,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: "3.5rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", boxShadow: "0 0 20px rgba(79,142,247,0.4)" }}>FX</div>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-space-grotesk, sans-serif)", ...gradText }}>FXAU</span>
        </Link>

        {/* Headline */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-space-grotesk, sans-serif)", fontSize: "clamp(2.2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
            Trade smarter.<br /><span style={gradText}>Start free today.</span>
          </h1>
          <p style={{ color: "#8B93A8", fontSize: 16, lineHeight: 1.75, maxWidth: 400 }}>
            Join thousands of traders who journal, automate, and grow with FXAU. No credit card required.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
          {FEATURES.map(f => (
            <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 15, color: "#8B93A8", lineHeight: 1.55, paddingTop: 6 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-space-grotesk, sans-serif)", ...gradText }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#525A6E", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: Form ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "#0D0F16", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem", display: "block" }} className="lg:hidden">
            <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-space-grotesk, sans-serif)", ...gradText }}>FXAU</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-space-grotesk, sans-serif)", fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.01em" }}>Create your account</h2>
            <p style={{ color: "#8B93A8", fontSize: 15 }}>Get started free — no credit card needed.</p>
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
            {/* Role */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8B93A8", marginBottom: 8, letterSpacing: "0.04em" }}>I AM A</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(["trader", "student"] as const).map(role => (
                  <label key={role} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 12, border: `1px solid ${selectedRole === role ? "#4F8EF7" : "rgba(255,255,255,0.1)"}`, background: selectedRole === role ? "rgba(79,142,247,0.1)" : "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.2s" }}>
                    <input {...register("role")} type="radio" value={role} style={{ display: "none" }} />
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selectedRole === role ? "#4F8EF7" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selectedRole === role && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4F8EF7" }} />}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, textTransform: "capitalize", color: selectedRole === role ? "#F0F2F7" : "#8B93A8" }}>{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.04em" }}>FULL NAME</label>
              <input {...register("name")} type="text" placeholder="Alex Johnson"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 16px", fontSize: 15, color: "#F0F2F7", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              {errors.name && <p style={{ marginTop: 5, fontSize: 12, color: "#FF4B6E" }}>{errors.name.message}</p>}
            </div>

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
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8B93A8", marginBottom: 7, letterSpacing: "0.04em" }}>PASSWORD</label>
              <input {...register("password")} type="password" placeholder="Min 8 characters"
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
              style={{ width: "100%", padding: "15px", borderRadius: 12, background: grad, color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1, boxShadow: "0 6px 24px rgba(79,142,247,0.35)", letterSpacing: "0.02em", transition: "opacity 0.2s, transform 0.1s", marginTop: 4 }}>
              {isSubmitting ? "Creating account…" : "Create Free Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 14, color: "#8B93A8" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#4F8EF7", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>

          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: 12, color: "#525A6E", lineHeight: 1.6 }}>
            By creating an account you agree to our{" "}
            <Link href="#" style={{ color: "#525A6E", textDecoration: "underline" }}>Terms</Link> and{" "}
            <Link href="#" style={{ color: "#525A6E", textDecoration: "underline" }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
