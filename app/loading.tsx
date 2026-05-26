export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="inline-flex">
          <svg
            className="animate-spin h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="var(--color-border-default)"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="var(--color-accent-primary)"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-tertiary)]" style={{ fontFamily: "var(--font-display)" }}>
          Loading...
        </p>
      </div>
    </div>
  )
}
