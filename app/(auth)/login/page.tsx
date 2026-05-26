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

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") ?? "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

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

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            className="text-3xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FXAU
          </span>
          <p className="mt-2 text-[var(--color-text-secondary)] text-sm">
            Sign in to your trading platform
          </p>
        </div>

        <div
          className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-8 space-y-5"
        >
          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[999px] border border-[var(--color-border-default)] bg-transparent text-[var(--color-text-primary)] font-medium text-sm hover:bg-[var(--color-bg-card-hover)] transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-[var(--color-border-subtle)]" />
            <span className="mx-3 text-xs text-[var(--color-text-tertiary)]">or</span>
            <div className="flex-1 border-t border-[var(--color-border-subtle)]" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[10px] px-3.5 py-2.5 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-accent-primary)] transition-colors"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[var(--color-loss)]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[var(--color-accent-primary)] hover:opacity-80">
                  Forgot password?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[10px] px-3.5 py-2.5 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-accent-primary)] transition-colors"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[var(--color-loss)]">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-[10px] bg-[var(--color-loss-bg)] border border-[var(--color-loss-border)] px-4 py-3 text-sm text-[var(--color-loss)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-6 rounded-[999px] text-white font-semibold text-[15px] transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
                boxShadow: "0 4px 16px rgba(79,142,247,0.25)",
              }}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            {"Don't have an account? "}
            <Link href="/register" className="text-[var(--color-accent-primary)] hover:opacity-80 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
