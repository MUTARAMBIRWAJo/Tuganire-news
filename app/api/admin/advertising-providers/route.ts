import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"
const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

async function authorized() {
  const user = await getCurrentUser()
  return user && (user.role === "admin" || user.role === "superadmin") ? user : null
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data, error } = await admin.from("advertising_providers").select("id, provider, mode, publisher_id, enabled, site_status, created_at, updated_at").order("provider")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ providers: data || [] })
}

export async function POST(request: Request) {
  const user = await authorized()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  if (!["GOOGLE_ADSENSE", "ADSKEEPER"].includes(body.provider)) return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
  if (body.provider === "ADSKEEPER") {
    if (body.adskeeper_site_id && !/^\d+$/.test(body.adskeeper_site_id)) return NextResponse.json({ error: "AdsKeeper site ID must be numeric" }, { status: 400 })
    const { data, error } = await admin.from("advertising_providers").upsert({ provider: "ADSKEEPER", mode: "MANUAL_UNITS", adskeeper_site_id: body.adskeeper_site_id || null, enabled: Boolean(body.enabled), created_by: user.id }, { onConflict: "provider" }).select("id, provider, mode, adskeeper_site_id, enabled, site_status, created_at, updated_at").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ provider: data }, { status: 200 })
  }
  if (body.publisher_id && !/^ca-pub-\d{8,32}$/.test(body.publisher_id)) return NextResponse.json({ error: "Publisher ID must use the ca-pub-XXXXXXXX format" }, { status: 400 })

  const { data, error } = await admin.from("advertising_providers").upsert({
    provider: "GOOGLE_ADSENSE",
    mode: body.mode === "AUTO_ADS" ? "AUTO_ADS" : "MANUAL_UNITS",
    publisher_id: body.publisher_id || null,
    enabled: Boolean(body.enabled),
    site_status: ["UNKNOWN", "NOT_VERIFIED", "UNDER_REVIEW", "READY"].includes(body.site_status) ? body.site_status : "UNKNOWN",
    created_by: user.id,
  }, { onConflict: "provider" }).select("id, provider, mode, publisher_id, enabled, site_status, created_at, updated_at").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ provider: data }, { status: 200 })
}
