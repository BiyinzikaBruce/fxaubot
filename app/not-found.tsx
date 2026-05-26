import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div
          className="text-[8rem] font-bold leading-none"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Page not found
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-6 py-2.5 rounded-[999px] text-white font-semibold text-[15px]"
          style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)" }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
