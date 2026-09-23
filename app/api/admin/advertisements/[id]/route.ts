import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { isAdvertisementPlacement } from "@/lib/advertisements"

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const allowedFields = [
      "title", "description", "media_type", "media_url", "storage_bucket", "storage_path", "media_mime", "media_size",
      "link_url", "is_active", "display_order", "start_date", "end_date", "slug", "advertiser_name", "advertiser_email",
      "placement", "priority", "status", "poster_url", "mobile_media_url", "title_en", "description_en", "cta_text_en",
      "title_rw", "description_rw", "cta_text_rw",
    ] as const
    const update = Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number])))
    if (update.placement && !isAdvertisementPlacement(String(update.placement))) return NextResponse.json({ error: "Invalid placement" }, { status: 400 })
    if (update.status && !["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "ARCHIVED"].includes(String(update.status))) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    if (update.priority !== undefined && Number(update.priority) < 0) return NextResponse.json({ error: "Priority cannot be negative" }, { status: 400 })
    if (!["link_url", "media_url", "poster_url", "mobile_media_url"].every((field) => isSafeUrl(update[field]))) return NextResponse.json({ error: "URLs must use http or https" }, { status: 400 })

    const sb = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { persistSession: false }
    })

    const { data, error } = await sb
      .from("advertisements")
      .update(update)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ad: data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const sb = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { persistSession: false }
    })

    const { error } = await sb
      .from("advertisements")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}

