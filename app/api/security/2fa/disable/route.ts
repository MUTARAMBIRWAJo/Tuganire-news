import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

function redirectBack(request: Request, message: string) {
  const url = new URL(request.url)
  const redirectTo = new URL(request.headers.get("referer") || "/dashboard/public/security", url.origin)
  redirectTo.searchParams.set("security", message)
  return NextResponse.redirect(redirectTo, { status: 303 })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { error } = await supabase.from("two_factor_auth").update({ enabled: false }).eq("user_id", user.id)
    if (error) return redirectBack(request, "2fa-disable-failed")

    await supabase.from("security_notifications").insert({
      user_id: user.id,
      kind: "two_factor_disabled",
      title: "Two-factor authentication disabled",
      message: "Google Authenticator protection has been disabled for your account.",
    })

    return redirectBack(request, "2fa-disabled")
  } catch (error: any) {
    return redirectBack(request, error?.message || "2fa-disable-error")
  }
}
