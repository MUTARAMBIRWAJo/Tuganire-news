import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ensureTwoFactorSetup } from "@/lib/security"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.rpc("get_my_app_user").single()
    const setup = await ensureTwoFactorSetup(user.id, (profile as any)?.email || user.email || null)

    return NextResponse.json({
      enabled: Boolean(setup.enabled),
      qrCodeDataUrl: setup.qrCodeDataUrl,
      otpauthUri: setup.otpauthUri,
      backupCodes: setup.backupCodes,
      pending: !setup.enabled,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create 2FA setup" }, { status: 500 })
  }
}
