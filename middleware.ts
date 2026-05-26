import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PATHS = [
  "/dashboard/admin",
  "/dashboard/superadmin",
  "/dashboard/reporter",
  "/api/admin",
  "/api/reporter",
]

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!isProtected(pathname)) return NextResponse.next()

  // Basic guard: check for Supabase auth storage cookie (best-effort)
  // The client uses storageKey 'sb-tuganire-auth' for the session token.
  const hasAuthCookie = !!req.cookies.get("sb-tuganire-auth")

  if (!hasAuthCookie) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/reporter/:path*",
  ],
}
