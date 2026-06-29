import { NextRequest, NextResponse } from "next/server"

// Edge-compatible proxy — checks cookie presence only.
// Full session validation + role enforcement happens in server components and API routes.
// Better Auth prefixes the cookie with "__Secure-" whenever baseURL is https (e.g. in production),
// so both variants must be checked or the session is invisible to the proxy after login.
const SESSION_COOKIE = "better-auth.session_token"
const SECURE_SESSION_COOKIE = `__Secure-${SESSION_COOKIE}`

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/mentor"]
const AUTH_ROUTES = ["/login", "/register"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  if (!isProtected && !isAuthRoute) return NextResponse.next()

  const hasSession =
    request.cookies.has(SESSION_COOKIE) || request.cookies.has(SECURE_SESSION_COOKIE)

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
