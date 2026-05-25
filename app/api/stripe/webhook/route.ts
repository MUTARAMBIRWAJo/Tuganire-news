import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripeClient, getStripeWebhookSecret, persistStripePaymentRecord } from "@/lib/stripe"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const secret = getStripeWebhookSecret()

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook secret or signature missing." }, { status: 400 })
  }

  const body = await request.text()
  const stripe = getStripeClient()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook signature."
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}

        await persistStripePaymentRecord({
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
          paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
          kind: (metadata.payment_kind as any) || "donation",
          status: session.payment_status === "paid" ? "completed" : "pending",
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "usd",
          customerEmail: session.customer_details?.email || session.customer_email || null,
          customerName: session.customer_details?.name || null,
          metadata: metadata as Record<string, string>,
          rawPayload: event,
        })
        break
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = (paymentIntent.metadata || {}) as Record<string, string>

        await persistStripePaymentRecord({
          eventId: event.id,
          eventType: event.type,
          paymentIntentId: paymentIntent.id,
          kind: (metadata.payment_kind as any) || "donation",
          status: "completed",
          amount: (paymentIntent.amount_received || paymentIntent.amount) / 100,
          currency: paymentIntent.currency || "usd",
          customerEmail: paymentIntent.receipt_email || null,
          customerName: metadata.contact_name || null,
          metadata,
          rawPayload: event,
        })
        break
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = (paymentIntent.metadata || {}) as Record<string, string>

        await persistStripePaymentRecord({
          eventId: event.id,
          eventType: event.type,
          paymentIntentId: paymentIntent.id,
          kind: (metadata.payment_kind as any) || "donation",
          status: "failed",
          amount: (paymentIntent.amount_received || paymentIntent.amount) / 100,
          currency: paymentIntent.currency || "usd",
          customerEmail: paymentIntent.receipt_email || null,
          customerName: metadata.contact_name || null,
          metadata,
          rawPayload: event,
        })
        break
      }
      default:
        break
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process Stripe webhook."
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
