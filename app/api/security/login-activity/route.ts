import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase.from("login_activity").select("*").eq("user_id", user.id).order("login_at", { ascending: false }).limit(25)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ activity: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load activity" }, { status: 500 })
  }
}
