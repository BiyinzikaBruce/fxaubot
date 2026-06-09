import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { type NextRequest, NextResponse } from "next/server"

const handler = toNextJsHandler(auth)

export async function GET(request: NextRequest) {
  try {
    return await handler.GET(request)
  } catch (e) {
    console.error("[auth GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handler.POST(request)
  } catch (e) {
    console.error("[auth POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
