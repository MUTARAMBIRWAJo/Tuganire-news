import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireApiRoles } from "@/lib/auth/api-guard"

export async function GET(req: NextRequest) {
  try {
    const authorization = await requireApiRoles(["admin", "superadmin"])
    if (!authorization.authorized) return authorization.response

    const { searchParams } = new URL(req.url)
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "12", 10)
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 12

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRole) {
      return NextResponse.json({ error: "Service unavailable" }, {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      })
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
      console.error("/api/admin/payment-history query failed", error)
      return NextResponse.json({ error: "Unable to load payment history" }, {
        status: 500,
        headers: { "Cache-Control": "private, no-store" },
      })
    }

    return NextResponse.json({ rows: data }, { headers: { "Cache-Control": "private, no-store" } })
  } catch (e) {
    console.error("/api/admin/payment-history error", e)
    return NextResponse.json({ error: "Unable to load payment history" }, {
      status: 500,
      headers: { "Cache-Control": "private, no-store" },
    })
  }
}
