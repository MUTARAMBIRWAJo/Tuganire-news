import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.rpc("get_my_app_user").single()
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = (profile as any).role
    if (!(role === "advertiser" || role === "admin" || role === "superadmin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { data, error } = await supabase
      .from("advertiser_campaigns")
      .select("*")
      .eq("user_id", (profile as any).id)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ campaigns: data || [] })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.rpc("get_my_app_user").single()
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = (profile as any).role
    if (!(role === "advertiser" || role === "admin" || role === "superadmin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const toInsert = {
      user_id: (profile as any).id,
      campaign_name: body.campaign_name || body.name || "Untitled Campaign",
      budget_cents: body.budget_cents || null,
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      creative: body.creative || null,
      status: "draft",
    }

    const { data, error } = await supabase.from("advertiser_campaigns").insert([toInsert]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ campaign: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 })
  }
}
