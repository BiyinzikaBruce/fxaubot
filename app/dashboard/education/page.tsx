"use client"

import Link from "next/link"
import { GraduationCap, BookOpen, CheckCircle } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useCourses, type Course } from "@/hooks/use-courses"
import { cn } from "@/lib/utils"

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-elevated)]">
      <div className="h-1.5 rounded-full bg-[var(--color-accent-primary)] transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function EducationPage() {
  const coursesQuery = useCourses()
  const courses = (coursesQuery.data ?? []) as Course[]
  const isLoading = coursesQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Education" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Education" }]} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Education"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Education" }]}
      />

      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
          <GraduationCap className="h-10 w-10 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">No courses published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: Course) => {
            const progress = course.progress?.[0]
            const completed = progress?.completedLessons?.length ?? 0
            const total = course._count.lessons
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0
            const isDone = !!progress?.completedAt

            return (
              <Link key={course.id} href={`/dashboard/education/${course.id}`}
                className={cn("rounded-[14px] border bg-[var(--color-bg-card)] p-5 flex flex-col gap-4 hover:border-[var(--color-accent-primary)]/50 transition-colors", isDone ? "border-[var(--color-profit)]/30" : "border-[var(--color-border-subtle)]")}>
                {/* Thumbnail */}
                <div className="h-28 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-[#7B5CF0]/20 flex items-center justify-center relative overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-10 w-10 text-[var(--color-accent-primary)]/60" />
                  )}
                  {isDone && (
                    <div className="absolute top-2 right-2 rounded-full bg-[var(--color-profit)] p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <p className="font-semibold text-[var(--color-text-primary)] line-clamp-2">{course.title}</p>
                  {course.description && (
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{course.description}</p>
                  )}
                  <p className="text-xs text-[var(--color-text-muted)]">by {course.author.name} · {total} lesson{total !== 1 ? "s" : ""}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>{completed}/{total} lessons</span>
                    <span>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
