import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Identify current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile, error: profileErr } = await supabase.rpc("get_my_app_user").single()
    if (profileErr || !profile) return NextResponse.json({ count: 0 })

    const role = (profile as any).role
    if (!(role === "admin" || role === "superadmin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Count pending approvals
    const { count, error } = await supabase
      .from("app_users")
      .select("id", { count: "exact", head: true })
      .eq("is_approved", false)

    if (error) return NextResponse.json({ count: 0 })

    return NextResponse.json({ count: count || 0 })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
