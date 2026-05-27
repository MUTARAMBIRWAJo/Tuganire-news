import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createBillingPortalSession } from "@/lib/stripe-server"
import { getSubscriberMetadata } from "@/lib/billing/guards"

export const runtime = "nodejs"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.rpc("get_my_app_user").single()
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const subscriberMetadata = await getSubscriberMetadata(user.id)
    const customerId = subscriberMetadata?.stripe_customer_id || null
    if (!customerId) {
      return NextResponse.json({ error: "No Stripe customer is linked to this account yet." }, { status: 404 })
    }

    const portalSession = await createBillingPortalSession(customerId, "/dashboard/subscriber")
    return NextResponse.redirect(portalSession.url, { status: 303 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to open billing portal" }, { status: 500 })
  }
}
