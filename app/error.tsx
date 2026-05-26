"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div
          className="text-[6rem] font-bold leading-none"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-loss)" }}
        >
          500
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Something went wrong
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {error.message || "An unexpected error occurred. Our team has been notified."}
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-2.5 rounded-[999px] text-white font-semibold text-[15px]"
          style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)" }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
