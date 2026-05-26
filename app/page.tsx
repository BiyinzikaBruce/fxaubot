import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-8 text-center">
      <h1
        className="text-5xl md:text-7xl font-bold mb-6"
        style={{
          fontFamily: "var(--font-display)",
          background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Trade Smarter.<br />Automate Everything.
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mb-10">
        Professional trading journal, multi-exchange bot automation, copy trading, and structured education — all in one platform.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/register"
          className="px-8 py-3 rounded-[999px] text-white font-semibold text-[15px]"
          style={{
            background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
            boxShadow: "0 4px 16px rgba(79,142,247,0.25)",
          }}
        >
          Get Started Free
        </Link>
        <Link
          href="/pricing"
          className="px-8 py-3 rounded-[999px] font-semibold text-[15px] text-[var(--color-text-primary)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-card)] transition-colors"
        >
          View Pricing
        </Link>
      </div>
    </div>
  )
}
