"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Sparkle,
  X,
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
  collapsed: boolean
  onCollapsedChange: (val: boolean) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
  className?: string
}

export function Sidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
  className,
}: SidebarProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <motion.aside
      // Only animate width — Framer Motion does not touch CSS transform here,
      // so the Tailwind translate-x classes below work without conflict.
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-[60] overflow-hidden",
        "bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-subtle)]",
        // Mobile: slide in/out via CSS transition
        // Desktop: always visible (lg:translate-x-0 overrides the negative translate)
        "transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className,
      )}
    >
      {/* Logo + toggle */}
      <div className="flex items-center gap-3 px-5 h-[76px] border-b border-[var(--color-border-subtle)] shrink-0">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-[0_4px_16px_rgba(79,142,247,0.35)]"
          style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)" }}
        >
          <Sparkle className="h-[18px] w-[18px] text-white" fill="white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold font-[var(--font-display)] tracking-tight"
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

        {/* Desktop: collapse toggle */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Mobile: close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors ml-auto"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.label} className={cn(sectionIdx > 0 && "mt-2")}>
            {!collapsed && (
              <span className="block px-6 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                {section.label}
              </span>
            )}
            <div className="flex flex-col gap-1 px-3">
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
                    onClick={() => onMobileClose?.()}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all",
                      "font-[var(--font-display)] text-[15px] font-medium",
                      isActive
                        ? "text-[var(--color-accent-primary)] shadow-[0_2px_12px_rgba(79,142,247,0.18)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] hover:translate-x-0.5",
                    )}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(79,142,247,0.16) 0%, rgba(123,92,240,0.10) 100%)",
                            border: "1px solid var(--color-border-accent)",
                          }
                        : undefined
                    }
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#4F8EF7] to-[#7B5CF0]" />
                    )}
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
          </div>
        ))}
      </nav>

      {/* Bottom: theme toggle + user */}
      <div className="shrink-0 border-t border-[var(--color-border-subtle)] p-4 space-y-2">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={cn(
            "flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-xl transition-colors",
            "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]",
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

        {session?.user && (
          <div
            className={cn(
              "flex items-center gap-3 px-3.5 py-3 rounded-xl",
              "border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]",
              collapsed ? "justify-center" : "",
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
