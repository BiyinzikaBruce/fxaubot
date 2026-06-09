import { NextResponse } from "next/server"

export async function GET() {
  const googleIdSnippet = process.env.GOOGLE_CLIENT_ID
    ? process.env.GOOGLE_CLIENT_ID.slice(0, 12) + "..."
    : "NOT SET ✗"

  return NextResponse.json({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "NOT SET ✗",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "SET ✓" : "NOT SET ✗",
    GOOGLE_CLIENT_ID: googleIdSnippet,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET ✓" : "NOT SET ✗",
    DATABASE_URL: process.env.DATABASE_URL ? "SET ✓" : "NOT SET ✗",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "NOT SET ✗ — client will use localhost!",
    NODE_ENV: process.env.NODE_ENV,
  })
}
