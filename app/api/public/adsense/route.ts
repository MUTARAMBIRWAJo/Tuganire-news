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
    const { data } = await sb
      .from("advertising_providers")
      .select("publisher_id, enabled, mode")
      .eq("provider", "GOOGLE_ADSENSE")
      .maybeSingle()
    return NextResponse.json({ config: data && data.enabled && data.publisher_id ? { publisherId: data.publisher_id, mode: data.mode } : null })
  }
  if (!isAdvertisementPlacement(placement)) return NextResponse.json({ unit: null }, { status: 400 })

  const { data, error } = await sb
    .from("adsense_ad_units")
    .select("ad_slot, ad_format, responsive, locale, advertising_providers!inner(publisher_id, enabled, mode)")
    .eq("placement", placement as AdvertisementPlacement)
    .in("locale", ["all", locale])
    .eq("status", "ACTIVE")
    .eq("advertising_providers.enabled", true)
    .eq("advertising_providers.mode", "MANUAL_UNITS")
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ unit: null }, { status: 200 })
  const provider = Array.isArray(data.advertising_providers) ? data.advertising_providers[0] : data.advertising_providers
  if (!provider?.publisher_id) return NextResponse.json({ unit: null }, { status: 200 })

  return NextResponse.json({
    unit: {
      publisherId: provider.publisher_id,
      adSlot: data.ad_slot,
      format: data.ad_format,
      responsive: data.responsive,
    },
  })
}
