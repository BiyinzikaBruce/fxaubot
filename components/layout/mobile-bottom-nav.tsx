"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, Bot, BarChart2, User } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard",            icon: LayoutDashboard, label: "Home"      },
  { href: "/dashboard/accounts",   icon: Wallet,          label: "Accounts"  },
  { href: "/dashboard/bot",        icon: Bot,             label: "Bot", center: true },
  { href: "/dashboard/analytics",  icon: BarChart2,       label: "Analytics" },
  { href: "/dashboard/settings",   icon: User,            label: "Profile"   },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 h-16 lg:hidden flex items-center justify-around
      bg-[var(--color-bg-secondary)]/95 backdrop-blur-md
      border-t border-[var(--color-border-subtle)]
      px-2 pb-safe">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.href)

        if (item.center) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 -translate-y-4"
              aria-label={item.label}
            >
              <div
                className={cn(
                  "flex h-[52px] w-[52px] items-center justify-center rounded-full",
                  "shadow-[0_8px_28px_rgba(79,142,247,0.45)]",
                  "transition-transform duration-200 active:scale-95",
                  isActive ? "opacity-100" : "opacity-90",
                )}
                style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)" }}
              >
                <Icon className="h-6 w-6 text-white" strokeWidth={2.2} />
              </div>
              <span className={cn(
                "text-[10px] font-semibold",
                isActive ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-muted)]",
              )}>
                {item.label}
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 flex-1 h-full justify-center relative"
            aria-label={item.label}
          >
            {/* Active dot indicator */}
            {isActive && (
              <span
                className="absolute top-1 h-1 w-1 rounded-full"
                style={{ background: "linear-gradient(135deg, #4F8EF7, #7B5CF0)" }}
              />
            )}
            <Icon
              className={cn(
                "h-[22px] w-[22px] transition-colors",
                isActive
                  ? "text-[var(--color-accent-primary)]"
                  : "text-[var(--color-text-muted)]",
              )}
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[var(--color-accent-primary)] font-semibold"
                  : "text-[var(--color-text-muted)]",
              )}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
