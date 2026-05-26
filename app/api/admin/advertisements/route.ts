import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/guards"
import { createClient as createServiceClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

export const runtime = "nodejs"

export async function GET() {
  try {
    await requireRole(["admin", "superadmin"])

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
    await requireRole(["admin", "superadmin"])

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
    } = body

    if (!title || !media_type || !media_url) {
      return NextResponse.json(
        { error: "Title, media_type, and media_url are required" },
        { status: 400 }
      )
    }

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

