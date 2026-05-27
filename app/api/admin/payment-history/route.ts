import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "12", 10)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRole) {
      return new Response(JSON.stringify({ rows: [], enabled: false }), { status: 200, headers: { "Content-Type": "application/json" } })
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await supabase
      .from("payment_transactions")
      .select(
        "id, payment_kind, payment_status, amount_cents, currency, customer_email, customer_name, advertiser_company, article_title, promoted_article_id, duration_days, homepage_priority, trending_boost, created_at, stripe_session_id, stripe_payment_intent_id",
      )
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) {
      return new Response(JSON.stringify({ rows: [], enabled: true }), { status: 200, headers: { "Content-Type": "application/json" } })
    }

    return new Response(JSON.stringify({ rows: data }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (e) {
    console.error("/api/admin/payment-history error", e)
    return new Response(JSON.stringify({ rows: [], enabled: true }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}
