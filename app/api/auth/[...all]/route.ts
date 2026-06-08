import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { NextRequest, NextResponse } from "next/server"

const handler = toNextJsHandler(auth)

export async function GET(req: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  try {
    return await handler.GET(req, ctx)
  } catch (e) {
    console.error("[auth GET error]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  try {
    return await handler.POST(req, ctx)
  } catch (e) {
    console.error("[auth POST error]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
