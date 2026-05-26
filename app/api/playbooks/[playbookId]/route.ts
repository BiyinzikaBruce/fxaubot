import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

type Ctx = { params: Promise<{ playbookId: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { playbookId } = await params
  const pb = await prisma.playbook.findFirst({ where: { id: playbookId, userId: session.user.id } })
  if (!pb) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(pb)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { playbookId } = await params
  const body = await req.json()
  const pb = await prisma.playbook.updateMany({
    where: { id: playbookId, userId: session.user.id },
    data: {
      name: body.name,
      description: body.description,
      rules: body.rules,
      setupCriteria: body.setupCriteria,
      entryConditions: body.entryConditions,
      exitConditions: body.exitConditions,
      riskParams: body.riskParams,
      isShared: body.isShared,
    },
  })
  if (pb.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { playbookId } = await params
  await prisma.playbook.deleteMany({ where: { id: playbookId, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
