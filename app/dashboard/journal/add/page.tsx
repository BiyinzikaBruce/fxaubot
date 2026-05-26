import { PageHeader } from "@/components/layout/page-header"
import { AddTradeForm } from "@/components/journal/add-trade-form"

export const metadata = { title: "Add Trade" }

export default function AddTradePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add Trade"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Journal", href: "/dashboard/journal" },
          { label: "Add Trade" },
        ]}
      />
      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6">
        <AddTradeForm />
      </div>
    </div>
  )
}
