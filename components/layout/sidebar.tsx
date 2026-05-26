"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Bot,
  Zap,
  Users,
  FlaskConical,
  FileText,
  GraduationCap,
  UserCheck,
  Wallet,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const NAV_SECTIONS = [
  {
    label: "Trading",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Automation",
    items: [
      { href: "/dashboard/bot", label: "Bot", icon: Bot },
      { href: "/dashboard/signals", label: "Signals", icon: Zap },
      { href: "/dashboard/copy-trading", label: "Copy Trading", icon: Users },
      { href: "/dashboard/backtesting", label: "Backtesting", icon: FlaskConical },
    ],
  },
  {
    label: "Strategy",
    items: [
      { href: "/dashboard/playbooks", label: "Playbooks", icon: FileText },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/dashboard/education", label: "Education", icon: GraduationCap },
      { href: "/dashboard/mentor", label: "Mentor", icon: UserCheck },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/accounts", label: "Accounts", icon: Wallet },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-50 overflow-hidden",
        "bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-subtle)]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-border-subtle)] shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold font-[var(--font-display)]"
              style={{
                background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              FXAU
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <span className="block px-5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                {section.label}
              </span>
            )}
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 mx-3 my-0.5 px-3 py-2.5 rounded-[10px] transition-colors",
                    "font-[var(--font-display)] text-[15px] font-medium",
                    isActive
                      ? "bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] border border-[var(--color-border-accent)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: theme toggle + user */}
      <div className="shrink-0 border-t border-[var(--color-border-subtle)] p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] transition-colors",
            "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
          )}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <Moon className="h-[18px] w-[18px] shrink-0" />
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[15px] font-medium font-[var(--font-display)]"
              >
                {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User info */}
        {session?.user && (
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-[10px]",
              "border border-[var(--color-border-subtle)]",
              collapsed ? "justify-center" : ""
            )}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7B5CF0] flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                    {session.user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-loss)] hover:bg-[var(--color-loss-bg)] transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
