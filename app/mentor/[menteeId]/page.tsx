import { PageHeader } from "@/components/layout/page-header"

export const metadata = { title: "Mentee View" }

export default function MentorMenteeePage({
  params,
}: {
  params: { menteeId: string }
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-8">
      <PageHeader
        title="Mentee Journal"
        breadcrumbs={[{ label: "Mentor", href: "/dashboard/mentor" }, { label: "Mentee" }]}
      />
      <p className="text-[var(--color-text-secondary)]">
        Read-only view of mentee {params.menteeId} — built in Phase 6.
      </p>
    </div>
  )
}
