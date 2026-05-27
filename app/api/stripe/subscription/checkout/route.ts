import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSubscriptionCheckoutSession, getSubscriptionPriceId } from "@/lib/stripe-server"
import { getSubscriberMetadata } from "@/lib/billing/guards"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.rpc("get_my_app_user").single()
    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const subscriberMetadata = await getSubscriberMetadata(user.id)

    const priceId = getSubscriptionPriceId()
    if (!priceId) {
      return NextResponse.json({ error: "Missing STRIPE_SUBSCRIPTION_PRICE_ID" }, { status: 500 })
    }

    const customerEmail = (profile as any).email || user.email || null
    const customerName = (profile as any).display_name || (profile as any).full_name || null
    const customerId = subscriberMetadata?.stripe_customer_id || null

    const session = await createSubscriptionCheckoutSession({
      userId: user.id,
      priceId,
      sourcePage: "/dashboard/subscriber",
      successPath: "/dashboard/subscriber",
      cancelPath: "/dashboard/subscriber",
      customerEmail,
      customerName,
      customerId,
      metadata: { user_id: user.id, plan_name: "subscriber" },
    })

    if (!session.url) return NextResponse.json({ error: "Stripe checkout session missing URL" }, { status: 500 })

    return NextResponse.redirect(session.url, { status: 303 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to start checkout" }, { status: 500 })
  }
}
