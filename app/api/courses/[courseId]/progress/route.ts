import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { courseId } = await params
  const { lessonId } = await req.json()

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { select: { id: true } } },
  })
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const existing = await prisma.courseProgress.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })

  const completedLessons = existing
    ? Array.from(new Set([...existing.completedLessons, lessonId]))
    : [lessonId]

  const allLessons = course.lessons.map((l) => l.id)
  const isCompleted = allLessons.every((id) => completedLessons.includes(id))

  const progress = await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    create: { userId: session.user.id, courseId, completedLessons, completedAt: isCompleted ? new Date() : null },
    update: { completedLessons, completedAt: isCompleted ? new Date() : null },
  })
  return NextResponse.json(progress)
}
