"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Lock, Sparkles } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const REAPPEAR_AFTER_MS = 4 * 60 * 1000
const FIRST_SHOW_DELAY_MS = 5_000

type NudgeContent = {
  icon: string
  title: string
  subtitle: string
  locked: string[]
  cta: string
  gold: boolean
}

const CONTENT: Record<"none" | "pro" | "ultimate", NudgeContent> = {
  none: {
    icon: "🔒",
    title: "No Active Plan — Limited Access",
    subtitle: "Subscribe to start journaling trades and running bots",
    locked: [
      "Trading journal, bots, and signal feed",
      "Copy trading and backtesting",
      "MT5 live connection and prop firm sync",
    ],
    cta: "Choose a Plan",
    gold: false,
  },
  pro: {
    icon: "⭐",
    title: "You're on Pro — Unlock More",
    subtitle: "Upgrade to Ultimate for unlimited bots and copy trading",
    locked: [
      "Copy trading and unlimited active bots",
      "Mentor access and education library",
      "Unlimited backtesting and full analytics",
    ],
    cta: "Upgrade to Ultimate",
    gold: false,
  },
  ultimate: {
    icon: "💎",
    title: "You're on Ultimate — Go Platinum",
    subtitle: "Trade live with a real broker, hands-off",
    locked: [
      "MT5 live account connection",
      "Prop firm sync (FTMO, MFF, etc.)",
      "Custom strategy builder and API access",
    ],
    cta: "Go Platinum",
    gold: true,
  },
}

export function UpgradeNudge() {
  const { data: session } = useSession()
  const plan = session?.user?.plan ?? "none"
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (plan === "platinum") return
    const showTimer = setTimeout(() => setVisible(true), FIRST_SHOW_DELAY_MS)
    return () => clearTimeout(showTimer)
  }, [plan])

  function handleDismiss() {
    setVisible(false)
    setTimeout(() => setVisible(true), REAPPEAR_AFTER_MS)
  }

  if (plan === "platinum") return null
  const content = CONTENT[plan as "none" | "pro" | "ultimate"] ?? CONTENT.none

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "fixed bottom-6 right-6 z-[90] w-[360px] rounded-2xl border p-5 shadow-2xl backdrop-blur-sm",
            content.gold
              ? "border-[#F5A623]/50 bg-[linear-gradient(160deg,#1a1408,#0D0F16)]"
              : "border-[var(--color-border-accent)] bg-[var(--color-bg-card)]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base",
                  content.gold ? "bg-[#F5A623]/15" : "bg-[var(--color-accent-glow)]",
                )}
              >
                {content.icon}
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug">{content.title}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-lg p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{content.subtitle}</p>

          <div className="mt-3 flex flex-col gap-1.5">
            {content.locked.map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
                <Lock className="h-3 w-3 mt-0.5 shrink-0 text-[var(--color-loss)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/billing"
            className={cn(
              "mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90",
              content.gold
                ? "bg-[linear-gradient(135deg,#F5A623,#E08A0C)]"
                : "bg-[var(--color-accent-primary)]",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {content.cta}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
