import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const createServiceClient = (url: string, key: string) => {
  return createClient(url, key, { auth: { persistSession: false } })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key"

const sb = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false }
})

export const runtime = "edge"
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET() {
  try {
    const now = new Date().toISOString()

    // Use anon client to ensure public access
    const { data, error } = await sb
      .from("advertisements")
      .select("id, title, description, media_type, media_url, link_url, view_count, display_order")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
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

    return NextResponse.json({ ads: data || [] }, { status: 200 })
  } catch (error: any) {
    console.error("Advertisements API error:", error)
    return NextResponse.json({ ads: [] }, { status: 200 })
  }
}

