import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
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

function isProtectedApi(pathname: string) {
  return PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

function copySupabaseResponse(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie)
  }

  for (const name of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(name)
    if (value) to.headers.set(name, value)
  }

  return to
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith("/dashboard") && !isProtectedApi(pathname)) return NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Service unavailable" }, {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      })
    }
    return new NextResponse("Authentication service unavailable", { status: 503 })
  }

  let response = NextResponse.next({ request: req })
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
        response = NextResponse.next({ request: req })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        response.headers.set("Cache-Control", "private, no-store")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")
      },
    },
  })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    if (/invalid refresh token|refresh token not found/i.test(authError.message)) {
      if (isProtectedApi(pathname)) {
        return copySupabaseResponse(response, NextResponse.json({ error: "Unauthorized" }, {
          status: 401,
          headers: { "Cache-Control": "private, no-store" },
        }))
      }

      const url = req.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirectTo", `${pathname}${req.nextUrl.search}`)
      return copySupabaseResponse(response, NextResponse.redirect(url))
    }

    if (isProtectedApi(pathname)) {
      return copySupabaseResponse(response, NextResponse.json({ error: "Authentication unavailable" }, {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      }))
    }
    return copySupabaseResponse(response, new NextResponse("Authentication service unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    }))
  }

  if (!user) {
    if (isProtectedApi(pathname)) {
      return copySupabaseResponse(response, NextResponse.json({ error: "Unauthorized" }, {
        status: 401,
        headers: { "Cache-Control": "private, no-store" },
      }))
    }
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectTo", pathname)
    return copySupabaseResponse(response, NextResponse.redirect(url))
  }

  const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aalError || !aalData) {
    const unavailable = isProtectedApi(pathname)
      ? NextResponse.json({ error: "Authentication assurance unavailable" }, {
          status: 503,
          headers: { "Cache-Control": "private, no-store" },
        })
      : new NextResponse("Authentication assurance unavailable", {
          status: 503,
          headers: { "Cache-Control": "private, no-store" },
        })
    return copySupabaseResponse(response, unavailable)
  }

  if (aalData.nextLevel === "aal2" && aalData.currentLevel !== "aal2") {
    if (isProtectedApi(pathname)) {
      return copySupabaseResponse(response, NextResponse.json({ error: "Additional authentication required" }, {
        status: 401,
        headers: { "Cache-Control": "private, no-store" },
      }))
    }

    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectTo", `${pathname}${req.nextUrl.search}`)
    url.searchParams.set("mfa", "required")
    return copySupabaseResponse(response, NextResponse.redirect(url))
  }

  const { data: profile, error: profileError } = await supabase.rpc("get_my_app_user").single() as {
    data: { role?: string; is_approved?: boolean } | null
    error: unknown
  }
  if (profileError) {
    if (isProtectedApi(pathname)) {
      return copySupabaseResponse(response, NextResponse.json({ error: "Authorization unavailable" }, {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      }))
    }
    return copySupabaseResponse(response, new NextResponse("Authorization service unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    }))
  }

  const role = profile?.role as UserRole | undefined
  const roleIsKnown = role !== undefined && Object.hasOwn(DASHBOARD_REDIRECTS, role)
  if (!roleIsKnown || (role !== "public" && profile?.is_approved !== true)) {
    if (isProtectedApi(pathname)) {
      return copySupabaseResponse(response, NextResponse.json({ error: "Forbidden" }, {
        status: 403,
        headers: { "Cache-Control": "private, no-store" },
      }))
    }
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectTo", pathname)
    return copySupabaseResponse(response, NextResponse.redirect(url))
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const url = req.nextUrl.clone()
    url.pathname = DASHBOARD_REDIRECTS[role]
    return copySupabaseResponse(response, NextResponse.redirect(url))
  }

  const allowedRolesForPath = Object.entries(DASHBOARD_PATHS).find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1]

  if (allowedRolesForPath && !allowedRolesForPath.includes(role)) {
    const url = req.nextUrl.clone()
    url.pathname = DASHBOARD_REDIRECTS[role]
    return copySupabaseResponse(response, NextResponse.redirect(url))
  }

  if (isProtectedApi(pathname)) {
    const allowedApiRoles = pathname === "/api/reporter" || pathname.startsWith("/api/reporter/")
      ? ["reporter", "admin", "superadmin"]
      : ["admin", "superadmin"]
    if (!allowedApiRoles.includes(role)) {
      return copySupabaseResponse(response, NextResponse.json({ error: "Forbidden" }, {
        status: 403,
        headers: { "Cache-Control": "private, no-store" },
      }))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/reporter/:path*",
  ],
}
