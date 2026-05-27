import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import type { UserRole } from "@/lib/auth/roles"

const PROTECTED_API_PREFIXES = ["/api/admin", "/api/reporter"]
const DASHBOARD_PATHS: Record<string, UserRole[]> = {
  "/dashboard/public": ["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"],
  "/dashboard/subscriber": ["subscriber", "admin", "superadmin"],
  "/dashboard/advertiser": ["advertiser", "admin", "superadmin"],
  "/dashboard/supporter": ["supporter", "admin", "superadmin"],
  "/dashboard/reporter": ["reporter", "admin", "superadmin"],
  "/dashboard/admin": ["admin", "superadmin"],
  "/dashboard/superadmin": ["superadmin"],
}

const DASHBOARD_REDIRECTS: Record<UserRole, string> = {
  public: "/dashboard/public",
  subscriber: "/dashboard/subscriber",
  advertiser: "/dashboard/advertiser",
  supporter: "/dashboard/supporter",
  reporter: "/dashboard/reporter",
  admin: "/dashboard/admin",
  superadmin: "/dashboard/superadmin",
}

function isProtected(pathname: string) {
  return pathname.startsWith("/dashboard") || PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!isProtected(pathname)) return NextResponse.next()

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const role = (req.cookies.get("tuganire-role")?.value || "public") as UserRole
    const url = req.nextUrl.clone()
    url.pathname = DASHBOARD_REDIRECTS[role] || "/dashboard/public"
    return NextResponse.redirect(url)
  }

  const role = (req.cookies.get("tuganire-role")?.value || "public") as UserRole

  // Allow unauthenticated access only when we can safely infer a public landing page.
  const hasRoleCookie = !!req.cookies.get("tuganire-role")?.value
  if (!hasRoleCookie) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  const allowedRolesForPath = Object.entries(DASHBOARD_PATHS).find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1]

  if (allowedRolesForPath && !allowedRolesForPath.includes(role)) {
    const url = req.nextUrl.clone()
    url.pathname = DASHBOARD_REDIRECTS[role] || "/dashboard/public"
    return NextResponse.redirect(url)
  }

  if (PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/")) && role === "public") {
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
