import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { isAdvertisementPlacement, type AdvertisementMediaType, type AdvertisementStatus } from "@/lib/advertisements"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

const isSafeUrl = (value: unknown) => {
  if (value == null || value === "") return true
  if (typeof value !== "string") return false
  if (value.startsWith("/") && !value.startsWith("//")) return true
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sb = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { persistSession: false }
    })

    const { data, error } = await sb
      .from("advertisements")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ads: data || [] }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      media_type,
      media_url,
      storage_bucket,
      storage_path,
      media_mime,
      media_size,
      link_url,
      is_active,
      display_order,
      start_date,
      end_date,
      slug,
      advertiser_name,
      advertiser_email,
      placement,
      priority,
      status,
      poster_url,
      mobile_media_url,
      title_en,
      description_en,
      cta_text_en,
      title_rw,
      description_rw,
      cta_text_rw,
    } = body

    if (!title || !media_type || !media_url || !["image", "video"].includes(media_type as AdvertisementMediaType)) {
      return NextResponse.json(
        { error: "Title, media_type, and media_url are required" },
        { status: 400 }
      )
    }
    if (!isAdvertisementPlacement(placement || "HOME_BELOW_BREAKING_NEWS")) return NextResponse.json({ error: "Invalid placement" }, { status: 400 })
    if (!["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "ARCHIVED"].includes(status || "ACTIVE")) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    if (!isSafeUrl(link_url) || !isSafeUrl(media_url) || !isSafeUrl(poster_url) || !isSafeUrl(mobile_media_url)) return NextResponse.json({ error: "URLs must use http or https" }, { status: 400 })
    if (media_type === "video" && poster_url && !isSafeUrl(poster_url)) return NextResponse.json({ error: "Invalid video poster URL" }, { status: 400 })
    if (end_date && start_date && new Date(end_date) < new Date(start_date)) return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })

    const sb = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { persistSession: false }
    })

    const { data, error } = await sb
      .from("advertisements")
      .insert({
        title,
        description: description || null,
        media_type,
        media_url,
        storage_bucket: storage_bucket || null,
        storage_path: storage_path || null,
        media_mime: media_mime || null,
        media_size: media_size ?? null,
        link_url: link_url || null,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0,
        start_date: start_date || null,
        end_date: end_date || null,
        slug: slug || null,
        advertiser_name: advertiser_name || null,
        advertiser_email: advertiser_email || null,
        placement: placement || "HOME_BELOW_BREAKING_NEWS",
        priority: Math.max(0, Number(priority) || 0),
        status: (status || (is_active === false ? "PAUSED" : "ACTIVE")) as AdvertisementStatus,
        poster_url: poster_url || null,
        mobile_media_url: mobile_media_url || null,
        title_en: title_en || title,
        description_en: description_en || description || null,
        cta_text_en: cta_text_en || null,
        title_rw: title_rw || null,
        description_rw: description_rw || null,
        cta_text_rw: cta_text_rw || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ad: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}

