import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { lessons: true } },
      progress: { where: { userId: session.user.id } },
    },
  })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || (user.role !== "mentor" && user.role !== "admin")) {
    return NextResponse.json({ error: "Only mentors and admins can create courses" }, { status: 403 })
  }

  const body = await req.json()
  const course = await prisma.course.create({
    data: {
      authorId: session.user.id,
      title: body.title,
      description: body.description,
      thumbnailUrl: body.thumbnailUrl,
      isPublished: body.isPublished ?? false,
      order: body.order ?? 0,
    },
  })
  return NextResponse.json(course, { status: 201 })
}
