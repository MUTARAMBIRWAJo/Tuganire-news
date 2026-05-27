import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.rpc("get_my_app_user").single()
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = String((profile as any).role || "public")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

    const db = supabaseUrl && serviceRole
      ? createSupabaseClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })
      : supabase

    const [pendingApprovalsResult, pendingTasksResult, activeCampaignsResult, openPaymentsResult] = await Promise.all([
      role === "admin" || role === "superadmin"
        ? db.from("app_users").select("id", { count: "exact", head: true }).eq("is_approved", false)
        : Promise.resolve({ count: 0, error: null } as any),
      role === "reporter"
        ? db.from("articles").select("id", { count: "exact", head: true }).eq("author_id", user.id).in("status", ["draft", "submitted"])
        : role === "admin" || role === "superadmin"
          ? db.from("articles").select("id", { count: "exact", head: true }).in("status", ["draft", "submitted"])
          : Promise.resolve({ count: 0, error: null } as any),
      role === "advertiser" || role === "admin" || role === "superadmin"
        ? db.from("advertiser_campaigns").select("id", { count: "exact", head: true }).eq("status", "active")
        : Promise.resolve({ count: 0, error: null } as any),
      role === "admin" || role === "superadmin"
        ? db.from("payment_transactions").select("id", { count: "exact", head: true }).eq("payment_status", "pending")
        : Promise.resolve({ count: 0, error: null } as any),
    ])

    return NextResponse.json({
      pendingApprovals: pendingApprovalsResult.count || 0,
      pendingTasks: pendingTasksResult.count || 0,
      activeCampaigns: activeCampaignsResult.count || 0,
      openPayments: openPaymentsResult.count || 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 })
  }
}
