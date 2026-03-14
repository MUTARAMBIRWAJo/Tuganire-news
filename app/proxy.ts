import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

export default async function proxy(req: NextRequest) {
  const res = NextResponse.next()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key"

  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Refresh the session so server components can read cookies consistently
  const { error } = await supabase.auth.getSession()
  if (error) {
    const msg = (error.message || "").toLowerCase()
    if (msg.includes("invalid refresh token") || msg.includes("refresh token") || msg.includes("already used")) {
      // Clear invalid cookies to break redirect loops
      await supabase.auth.signOut()
    }
  }

  return res
}
