"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Circle, PlayCircle, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useCourse, useCompleteLesson, type Lesson } from "@/hooks/use-courses"
import { cn } from "@/lib/utils"

type Props = { params: Promise<{ courseId: string }> }

export default function CourseDetailPage({ params }: Props) {
  const { courseId } = use(params)
  const { data: course, isLoading } = useCourse(courseId)
  const { mutate: completeLesson } = useCompleteLesson()
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-[var(--color-bg-card)]" />
        <div className="h-64 animate-pulse rounded-[14px] bg-[var(--color-bg-card)]" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-[var(--color-text-secondary)]">Course not found</p>
        <Link href="/dashboard/education" className="text-sm text-[var(--color-accent-primary)] hover:underline">Back to Education</Link>
      </div>
    )
  }

  const progress = course.progress?.[0]
  const completedIds = new Set(progress?.completedLessons ?? [])
  const lessons: Lesson[] = course.lessons ?? []
  const totalCompleted = completedIds.size
  const pct = lessons.length > 0 ? Math.round((totalCompleted / lessons.length) * 100) : 0
  const current = activeLesson ?? lessons[0] ?? null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={course.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: course.title },
        ]}
        actions={
          <Link href="/dashboard/education" className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lesson list */}
        <div className="flex flex-col gap-3">
          <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Progress</p>
              <span className="text-xs font-bold text-[var(--color-accent-primary)]">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-elevated)]">
              <div className="h-1.5 rounded-full bg-[var(--color-accent-primary)] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">{totalCompleted}/{lessons.length} lessons completed</p>
          </div>

          <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] divide-y divide-[var(--color-border-subtle)]">
            {lessons.map((lesson: Lesson, i: number) => {
              const done = completedIds.has(lesson.id)
              const isActive = current?.id === lesson.id
              return (
                <button key={lesson.id} onClick={() => setActiveLesson(lesson)}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors", isActive ? "bg-[var(--color-accent-glow)]" : "hover:bg-[var(--color-bg-elevated)]")}>
                  {done
                    ? <CheckCircle className="h-4 w-4 text-[var(--color-profit)] shrink-0" />
                    : <Circle className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm truncate", isActive ? "text-[var(--color-accent-primary)] font-medium" : "text-[var(--color-text-secondary)]")}>
                      {i + 1}. {lesson.title}
                    </p>
                  </div>
                </button>
              )
            })}
            {lessons.length === 0 && (
              <p className="px-4 py-6 text-sm text-center text-[var(--color-text-muted)]">No lessons yet</p>
            )}
          </div>
        </div>

        {/* Lesson content */}
        <div className="lg:col-span-2">
          {current ? (
            <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{current.title}</h2>
                {completedIds.has(current.id) ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-profit)] shrink-0">
                    <CheckCircle className="h-4 w-4" /> Completed
                  </span>
                ) : (
                  <button onClick={() => completeLesson({ courseId, lessonId: current.id })}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--color-profit)]/15 px-3 py-1.5 text-xs font-medium text-[var(--color-profit)] hover:bg-[var(--color-profit)]/25 shrink-0">
                    <CheckCircle className="h-3.5 w-3.5" /> Mark complete
                  </button>
                )}
              </div>

              {current.videoUrl && (
                <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white/40" />
                </div>
              )}

              {current.content ? (
                <div className="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {current.content}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12">
                  <BookOpen className="h-8 w-8 text-[var(--color-text-muted)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">No content for this lesson yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-24 rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
              <BookOpen className="h-8 w-8 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-muted)]">Select a lesson to start learning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
