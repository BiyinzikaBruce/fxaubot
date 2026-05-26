import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const playbooks = await prisma.playbook.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { trades: true } } },
  })
  return NextResponse.json(playbooks)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const playbook = await prisma.playbook.create({
    data: {
      userId: session.user.id,
      name: body.name,
      description: body.description,
      rules: body.rules ?? [],
      setupCriteria: body.setupCriteria,
      entryConditions: body.entryConditions,
      exitConditions: body.exitConditions,
      riskParams: body.riskParams,
      isShared: body.isShared ?? false,
    },
  })
  return NextResponse.json(playbook, { status: 201 })
}
