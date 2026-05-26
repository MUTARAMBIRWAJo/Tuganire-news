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

  // Basic guard: check for Supabase access token in common cookie names (best-effort)
  // Supabase client commonly stores tokens in localStorage; when cookie-based sessions
  // are used, cookie names are typically 'sb-access-token' and 'sb-refresh-token'.
  const cookieNamesToCheck = ["sb-access-token", "sb-refresh-token", "sb-tuganire-auth"]
  let token: string | null = null

  for (const name of cookieNamesToCheck) {
    const c = req.cookies.get(name)
    if (c) {
      token = Array.isArray(c) ? c[0] : c
      break
    }
  }

  function isJwtValid(jwt?: string | null) {
    if (!jwt) return false
    try {
      const parts = jwt.split(".")
      if (parts.length < 2) return false
      const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
      const json = decodeURIComponent(
        Array.prototype.map
          .call(atob(b64), function (c: string) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          })
          .join("")
      )
      const payload = JSON.parse(json)
      if (!payload) return false
      if (payload.exp && typeof payload.exp === "number") {
        const now = Math.floor(Date.now() / 1000)
        return payload.exp > now
      }
      return true
    } catch (e) {
      return false
    }
  }

  if (!isJwtValid(token)) {
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
