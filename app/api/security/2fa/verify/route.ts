import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { decryptSecret, hashCode, verifyTotp } from "@/lib/security"

export const runtime = "nodejs"

function redirectBack(request: Request, message: string) {
  const url = new URL(request.url)
  const redirectTo = new URL(request.headers.get("referer") || "/dashboard/public/security", url.origin)
  redirectTo.searchParams.set("security", message)
  return NextResponse.redirect(redirectTo, { status: 303 })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const otp = String(formData.get("otp") || "").trim()
    const recoveryCode = String(formData.get("recovery_code") || "").trim().toUpperCase()

    if (!otp && !recoveryCode) return redirectBack(request, "missing-otp")

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: twoFactor } = await supabase.from("two_factor_auth").select("*").eq("user_id", user.id).maybeSingle()
    if (!twoFactor) return redirectBack(request, "2fa-not-configured")

    const secret = decryptSecret(twoFactor.secret)
    const recoveryCodes = Array.isArray(twoFactor.backup_codes) ? twoFactor.backup_codes : []

    const recoveryMatch = recoveryCode ? recoveryCodes.includes(hashCode(recoveryCode)) : false
    const otpMatch = otp ? verifyTotp(secret, otp) : false

    if (!otpMatch && !recoveryMatch) {
      return redirectBack(request, "2fa-invalid")
    }

    if (!twoFactor.enabled) {
      await supabase.from("two_factor_auth").update({ enabled: true }).eq("user_id", user.id)
      await supabase.from("security_notifications").insert({
        user_id: user.id,
        kind: "two_factor_enabled",
        title: "Two-factor authentication enabled",
        message: "Google Authenticator protection has been enabled for your account.",
      })
    }

    if (recoveryMatch) {
      await supabase.from("recovery_codes").update({ used_at: new Date().toISOString() }).eq("user_id", user.id).eq("code_hash", hashCode(recoveryCode))
    }

    return redirectBack(request, "2fa-enabled")
  } catch (error: any) {
    return redirectBack(request, error?.message || "2fa-verify-error")
  }
}
