import { Sidebar } from "@/components/layout/sidebar"
import { UpgradeNudge } from "@/components/dashboard/upgrade-nudge"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Sidebar />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: "260px" }}
      >
        <div
          className="p-8 max-w-[1400px]"
          style={{ padding: "var(--content-padding)" }}
        >
          {children}
        </div>
      </main>
      <UpgradeNudge />
    </div>
  )
}
