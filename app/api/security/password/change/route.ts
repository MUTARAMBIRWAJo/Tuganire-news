import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashCode } from "@/lib/security"

export const runtime = "nodejs"

function redirectBack(request: Request, message: string, status = 303) {
  const url = new URL(request.url)
  const redirectTo = new URL(request.headers.get("referer") || "/dashboard/public/security", url.origin)
  redirectTo.searchParams.set("security", message)
  return NextResponse.redirect(redirectTo, { status })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const currentPassword = String(formData.get("current_password") || "")
    const newPassword = String(formData.get("new_password") || "")
    const confirmPassword = String(formData.get("confirm_password") || "")

    if (!currentPassword || !newPassword || !confirmPassword) {
      return redirectBack(request, "missing-password-fields")
    }

    if (newPassword.length < 12) {
      return redirectBack(request, "password-too-weak")
    }

    if (newPassword !== confirmPassword) {
      return redirectBack(request, "password-mismatch")
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: currentPassword,
    })
    if (signInError) {
      return redirectBack(request, "current-password-invalid")
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return redirectBack(request, "password-update-failed")
    }

    await supabase.from("user_security").upsert({
      user_id: user.id,
      last_password_change_at: new Date().toISOString(),
      password_change_alerts: true,
    }, { onConflict: "user_id" })

    await supabase.from("security_notifications").insert({
      user_id: user.id,
      kind: "password_change",
      title: "Password updated",
      message: "Your account password was changed successfully.",
    })

    await supabase.from("login_activity").insert({
      user_id: user.id,
      ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      browser: request.headers.get("user-agent") || null,
      device: request.headers.get("user-agent") || null,
      country: request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "unknown",
      user_agent: request.headers.get("user-agent") || null,
    })

    return redirectBack(request, "password-updated")
  } catch (error: any) {
    return redirectBack(request, error?.message || "password-change-error", 303)
  }
}
