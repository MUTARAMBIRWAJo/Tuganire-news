import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [prefsResult, notificationsResult] = await Promise.all([
      supabase.from("user_security").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("security_notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(25),
    ])

    return NextResponse.json({
      preferences: prefsResult.data || null,
      notifications: notificationsResult.data || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load notifications" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const emailAlerts = formData.get("email_alerts") === "on"
    const passwordChangeAlerts = formData.get("password_change_alerts") === "on"
    const twoFactorAlerts = formData.get("two_factor_alerts") === "on"
    const suspiciousLoginAlerts = formData.get("suspicious_login_alerts") === "on"
    const newsletterAlerts = formData.get("newsletter_alerts") === "on"

    const { error } = await supabase.from("user_security").upsert({
      user_id: user.id,
      email_alerts: emailAlerts,
      password_change_alerts: passwordChangeAlerts,
      two_factor_alerts: twoFactorAlerts,
      suspicious_login_alerts: suspiciousLoginAlerts,
      newsletter_alerts: newsletterAlerts,
      theme_preference: String(formData.get("theme_preference") || "system"),
      language_preference: String(formData.get("language_preference") || "en"),
    }, { onConflict: "user_id" })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.redirect(new URL("/dashboard/public/security?security=prefs-updated", request.url), { status: 303 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update notification preferences" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  return POST(request)
}
