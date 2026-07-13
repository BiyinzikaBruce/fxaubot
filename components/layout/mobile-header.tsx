"use client"

import Link from "next/link"
import { Menu, Sparkle } from "lucide-react"

interface MobileHeaderProps {
  onMenuOpen: () => void
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/95 backdrop-blur-sm lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-[0_4px_12px_rgba(79,142,247,0.30)]"
          style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)" }}
        >
          <Sparkle className="h-4 w-4 text-white" fill="white" />
        </div>
        <span
          className="text-lg font-bold tracking-tight font-[var(--font-display)]"
          style={{
            background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          FXAU
        </span>
      </Link>
      <button
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  )
}
