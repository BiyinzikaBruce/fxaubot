import { NextRequest, NextResponse } from "next/server"

// Edge-compatible proxy — checks cookie presence only.
// Full session validation + role enforcement happens in server components and API routes.
const SESSION_COOKIE = "better-auth.session_token"

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/mentor"]
const AUTH_ROUTES = ["/login", "/register"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  if (!isProtected && !isAuthRoute) return NextResponse.next()

  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
