import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "NOT SET",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "SET ✓" : "NOT SET ✗",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET ✓" : "NOT SET ✗",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET ✓" : "NOT SET ✗",
    DATABASE_URL: process.env.DATABASE_URL ? "SET ✓" : "NOT SET ✗",
    NODE_ENV: process.env.NODE_ENV,
  })
}
