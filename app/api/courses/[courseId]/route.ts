import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { courseId } = await params
  const course = await prisma.course.findFirst({
    where: { id: courseId, isPublished: true },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      lessons: { orderBy: { order: "asc" } },
      progress: { where: { userId: session.user.id } },
    },
  })
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(course)
}
