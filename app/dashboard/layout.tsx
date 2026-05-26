import { Sidebar } from "@/components/layout/sidebar"

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
    </div>
  )
}
