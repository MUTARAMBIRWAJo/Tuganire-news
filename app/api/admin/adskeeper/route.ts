import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { isAdvertisementPlacement } from "@/lib/advertisements"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"
const admin = createClient(url, key, { auth: { persistSession: false } })

async function authorized() {
  const user = await getCurrentUser()
  return user && (user.role === "admin" || user.role === "superadmin") ? user : null
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data, error } = await admin.from("adskeeper_ad_units").select("id, name, widget_id, placement, locale, status, start_date, end_date, priority, height_px, notes, advertising_providers!inner(adskeeper_site_id, enabled)").order("priority", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ units: data || [] })
}

export async function POST(request: Request) {
  const user = await authorized()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  if (!body.name || !/^\d+$/.test(String(body.widget_id || "")) || !isAdvertisementPlacement(String(body.placement || ""))) return NextResponse.json({ error: "Name, numeric widget_id, and valid placement are required" }, { status: 400 })

  let { data: provider } = await admin.from("advertising_providers").select("id").eq("provider", "ADSKEEPER").maybeSingle()
  if (!provider) {
    const result = await admin.from("advertising_providers").insert({ provider: "ADSKEEPER", mode: "MANUAL_UNITS", enabled: false, adskeeper_site_id: null, created_by: user.id }).select("id").single()
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
    provider = result.data
  }

  const { data, error } = await admin.from("adskeeper_ad_units").insert({
    provider_id: provider.id,
    name: body.name,
    widget_id: String(body.widget_id),
    placement: body.placement,
    locale: ["all", "en", "rw"].includes(body.locale) ? body.locale : "all",
    status: ["ACTIVE", "PAUSED", "DRAFT", "ARCHIVED"].includes(body.status) ? body.status : "DRAFT",
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    priority: Math.max(0, Number(body.priority) || 0),
    height_px: Math.min(1200, Math.max(0, Number(body.height_px) || 300)),
    notes: body.notes || null,
    created_by: user.id,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unit: data }, { status: 201 })
}
