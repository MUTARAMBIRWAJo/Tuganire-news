import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { isAdvertisementPlacement, type AdvertisementPlacement } from "@/lib/advertisements"

const createServiceClient = (url: string, key: string) => {
  return createClient(url, key, { auth: { persistSession: false } })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key"

const sb = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false }
})

export const runtime = "edge"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const now = new Date().toISOString()
    const { searchParams } = new URL(request.url)
    const placementParam = searchParams.get("placement") || "HOME_BELOW_BREAKING_NEWS"
    const locale = searchParams.get("locale") === "rw" ? "rw" : "en"
    if (!isAdvertisementPlacement(placementParam)) {
      return NextResponse.json({ ads: [] }, { status: 400 })
    }
    const placement = placementParam as AdvertisementPlacement

    // Use anon client to ensure public access
    const { data, error } = await sb
      .from("advertisements")
      .select("id, title, description, title_en, description_en, cta_text_en, title_rw, description_rw, cta_text_rw, media_type, media_url, mobile_media_url, poster_url, link_url, placement, view_count, display_order, priority")
      .eq("is_active", true)
      .eq("status", "ACTIVE")
      .eq("placement", placement)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("priority", { ascending: false })
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      

    if (error) {
      console.error("Error fetching advertisements:", error)
      return NextResponse.json({ ads: [] }, { status: 200 })
    }

    // Track views (non-blocking) - use service role for updates
    if (data && data.length > 0) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceKey) {
        const serviceSb = createServiceClient(supabaseUrl, serviceKey)
        data.forEach((ad) => {
          // Fetch current count first, then increment (fire-and-forget)
          void serviceSb
            .from("advertisements")
            .select("view_count")
            .eq("id", ad.id)
            .single()
            .then(({ data: adData }) => {
              if (adData) {
                void serviceSb
                  .from("advertisements")
                  .update({ view_count: (adData.view_count || 0) + 1 })
                  .eq("id", ad.id)
              }
            })
        })
      }
    }

    const localizedAds = (data || []).map((ad) => ({
      id: ad.id,
      media_type: ad.media_type,
      media_url: ad.media_url,
      mobile_media_url: ad.mobile_media_url || null,
      poster_url: ad.poster_url || null,
      title: (locale === "rw" ? ad.title_rw : ad.title_en) || ad.title,
      description: (locale === "rw" ? ad.description_rw : ad.description_en) || ad.description,
      cta_text: (locale === "rw" ? ad.cta_text_rw : ad.cta_text_en) || null,
      link_url: ad.link_url,
      placement: ad.placement,
    }))

    return NextResponse.json({ ads: localizedAds }, { status: 200 })
  } catch (error: any) {
    console.error("Advertisements API error:", error)
    return NextResponse.json({ ads: [] }, { status: 200 })
  }
}

