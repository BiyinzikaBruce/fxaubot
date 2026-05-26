import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(subs)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { plan, billing, amountUSDT, network, txHash } = body

  if (!plan || !billing || !amountUSDT || !network || !txHash) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const existing = await prisma.subscription.findFirst({
    where: { txHash },
  })
  if (existing) return NextResponse.json({ error: "Transaction hash already submitted" }, { status: 400 })

  const sub = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan,
      billing,
      amountUSDT,
      network,
      txHash,
      status: "pending",
    },
  })
  return NextResponse.json(sub, { status: 201 })
}
