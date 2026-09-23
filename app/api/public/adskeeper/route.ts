import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { isAdvertisementPlacement, type AdvertisementPlacement } from "@/lib/advertisements"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key"
const sb = createClient(url, key, { auth: { persistSession: false } })

export const runtime = "edge"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const placement = params.get("placement") || ""
  const locale = params.get("locale") === "rw" ? "rw" : "en"
  if (!placement) {
    const { data } = await sb.from("advertising_providers").select("adskeeper_site_id, enabled").eq("provider", "ADSKEEPER").maybeSingle()
    return NextResponse.json({ config: data?.enabled && data.adskeeper_site_id ? { siteId: data.adskeeper_site_id } : null })
  }
  if (!isAdvertisementPlacement(placement)) return NextResponse.json({ unit: null }, { status: 400 })

  const { data, error } = await sb
    .from("adskeeper_ad_units")
    .select("widget_id, height_px, locale, advertising_providers!inner(adskeeper_site_id, enabled)")
    .eq("placement", placement as AdvertisementPlacement)
    .in("locale", ["all", locale])
    .eq("status", "ACTIVE")
    .eq("advertising_providers.enabled", true)
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ unit: null }, { status: 200 })
  const provider = Array.isArray(data.advertising_providers) ? data.advertising_providers[0] : data.advertising_providers
  if (!provider?.adskeeper_site_id || !/^\d+$/.test(data.widget_id)) return NextResponse.json({ unit: null }, { status: 200 })

  return NextResponse.json({ unit: { widgetId: data.widget_id, siteId: provider.adskeeper_site_id, heightPx: data.height_px } })
}
