"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type Lesson = { id: string; courseId: string; title: string; content: string | null; videoUrl: string | null; order: number }
export type CourseProgress = { id: string; completedLessons: string[]; completedAt: string | null }
export type Course = {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  isPublished: boolean
  order: number
  author: { id: string; name: string; avatarUrl: string | null }
  _count: { lessons: number }
  progress: CourseProgress[]
  lessons?: Lesson[]
}

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses")
      if (!res.ok) throw new Error("Failed to fetch courses")
      return res.json()
    },
    staleTime: 60_000,
  })
}

export function useCourse(courseId: string) {
  return useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`)
      if (!res.ok) throw new Error("Failed to fetch course")
      return res.json()
    },
    staleTime: 30_000,
    enabled: !!courseId,
  })
}

export function useCompleteLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ courseId, lessonId }: { courseId: string; lessonId: string }) => {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      })
      if (!res.ok) throw new Error("Failed to update progress")
      return res.json()
    },
    onSuccess: (_data: unknown, { courseId }: { courseId: string; lessonId: string }) => {
      qc.invalidateQueries({ queryKey: ["courses"] })
      qc.invalidateQueries({ queryKey: ["course", courseId] })
    },
  })
}
