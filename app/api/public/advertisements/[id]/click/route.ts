import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

const sb = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

export const runtime = "edge"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Increment click count
    const { data: ad } = await sb
      .from("advertisements")
      .select("click_count")
      .eq("id", id)
      .single()

    if (ad) {
      await sb
        .from("advertisements")
        .update({ click_count: (ad.click_count || 0) + 1 })
        .eq("id", id)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Click tracking error:", error)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

