import { PageHeader } from "@/components/layout/page-header"

export const metadata = { title: "Admin" }

export default function AdminPage() {
  return (
    <div>
      <PageHeader title="Admin Overview" breadcrumbs={[{ label: "Admin" }]} />
      <p className="text-[var(--color-text-secondary)]">
        Platform stats and management — built in Phase 8.
      </p>
    </div>
  )
}
