"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { UpgradeNudge } from "@/components/dashboard/upgrade-nudge"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Mobile top bar — hidden on desktop */}
      <MobileHeader onMenuOpen={() => setMobileOpen(true)} />

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Backdrop — only renders on mobile when drawer is open */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-[margin] duration-300",
          collapsed ? "lg:ml-[68px]" : "lg:ml-[260px]",
          // Top offset for mobile header
          "pt-14 lg:pt-0",
          // Bottom offset for mobile bottom nav
          "pb-20 lg:pb-0",
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation — hidden on desktop */}
      <MobileBottomNav />

      <UpgradeNudge />
    </div>
  )
}
