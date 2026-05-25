import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export interface PaymentHistoryRow {
  id: string
  payment_kind: string
  payment_status: string
  amount_cents: number
  currency: string
  customer_email: string | null
  customer_name: string | null
  advertiser_company: string | null
  article_title: string | null
  promoted_article_id: string | null
  duration_days: number | null
  homepage_priority: boolean
  trending_boost: boolean
  created_at: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
}

export async function getPaymentHistory(limit = 12) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRole) {
    return { rows: [] as PaymentHistoryRow[], enabled: false }
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
    return { rows: [] as PaymentHistoryRow[], enabled: true }
  }

  return { rows: data as PaymentHistoryRow[], enabled: true }
}
