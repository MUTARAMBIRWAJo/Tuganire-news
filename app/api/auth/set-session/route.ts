import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { generateDeviceFingerprint, getRequestCountry, getRequestIp, hashCode } from "@/lib/security"

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = await req.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "missing tokens" }, { status: 400 })
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key",
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    let role = "public"
    try {
      const { data: profile } = (await supabase.rpc("get_current_user_profile").single()) as {
        data: { role?: string } | null
      }
      if (profile?.role && typeof profile.role === "string") {
        role = profile.role
      }
    } catch {
      role = "public"
    }

    const userAgent = req.headers.get("user-agent") || null
    const ipAddress = getRequestIp(req.headers as Headers)
    const country = getRequestCountry(req.headers as Headers)
    const { browser, device } = generateDeviceFingerprint(userAgent)
    const sessionToken = hashCode(access_token)

    try {
      await supabase.from("user_sessions").upsert(
        {
          user_id: (await supabase.auth.getUser()).data.user?.id || null,
          session_token: sessionToken,
          device,
          ip_address: ipAddress,
          user_agent: userAgent,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "session_token" },
      )

      await supabase.from("login_activity").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id || null,
        ip_address: ipAddress,
        browser,
        device,
        country,
        user_agent: userAgent,
      })
    } catch {
      // Non-fatal: security telemetry should not block login.
    }

    const response = NextResponse.json({ ok: true, role })
    response.cookies.set({
      name: "tuganire-role",
      value: role,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 })
  }
}
