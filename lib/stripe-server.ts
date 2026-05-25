import "server-only"

import Stripe from "stripe"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"
import type {
  ArticleBoostInput,
  CheckoutSessionResult,
  DonationCheckoutInput,
  PaymentKind,
  PaymentRecordInput,
  PricingPlan,
  SponsoredCheckoutInput,
} from "@/types/payment"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY")
}

const envSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://tuganire.site"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
})

type StripeEnv = z.infer<typeof envSchema>

let cachedEnv: StripeEnv | null = null

function getEnv(): StripeEnv {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env)
  }

  return cachedEnv
}

export const stripeServer = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil" as any,
  typescript: true,
})

export function getStripeWebhookSecret() {
  return getEnv().STRIPE_WEBHOOK_SECRET || null
}

export function getSiteUrl() {
  return getEnv().NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")
}

function toMetadataString(value: unknown) {
  if (value === null || value === undefined) return undefined
  if (typeof value === "boolean") return value ? "true" : "false"
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : undefined
  const trimmed = String(value).trim()
  return trimmed.length > 0 ? trimmed.slice(0, 500) : undefined
}

export function buildMetadata(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, toMetadataString(value)] as const)
      .filter(([, value]) => Boolean(value)),
  ) as Record<string, string>
}

function toCents(amount: number) {
  return Math.max(0, Math.round(amount * 100))
}

function makeIdempotencyKey(kind: PaymentKind, requestId: string | undefined, amount: number, sourcePage?: string) {
  const base = [kind, requestId || "anon", String(amount), sourcePage || ""].join(":")
  return base.slice(0, 255)
}

export interface CreateEmbeddedCheckoutSessionInput {
  kind: PaymentKind
  title: string
  description: string
  amount: number
  sourcePage: string
  cancelPath: string
  successPath: string
  currency?: string
  requestId?: string
  customerEmail?: string
  customerName?: string
  metadata?: Record<string, unknown>
}

export async function createEmbeddedCheckoutSession(
  input: CreateEmbeddedCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const siteUrl = getSiteUrl()
  const currency = (input.currency || "usd").toLowerCase()
  const amount = Math.max(1, Number(input.amount))
  const metadata = buildMetadata({
    payment_kind: input.kind,
    source_page: input.sourcePage,
    request_id: input.requestId || crypto.randomUUID(),
    ...input.metadata,
  })
  const idempotencyKey = makeIdempotencyKey(input.kind, input.requestId, amount, input.sourcePage)

  const session = await stripeServer.checkout.sessions.create(
    {
      mode: "payment",
      ui_mode: "embedded" as any,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: toCents(amount),
            product_data: {
              name: input.title,
              description: input.description,
              metadata,
            },
          },
        },
      ],
      metadata,
      customer_email: input.customerEmail,
      return_url: `${siteUrl}${input.successPath}?session_id={CHECKOUT_SESSION_ID}`,
    },
    { idempotencyKey },
  )

  if (!session.client_secret) {
    throw new Error("Stripe did not return an embedded checkout client secret.")
  }

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
    kind: input.kind,
    status: "created",
    amount,
    currency,
    successUrl: `${siteUrl}${input.successPath}`,
    cancelUrl: `${siteUrl}${input.cancelPath}`,
  }
}

export async function createDonationSession(input: DonationCheckoutInput) {
  return createEmbeddedCheckoutSession({
    kind: "donation",
    title: "Donation to Tuganire News",
    description: input.message || "Support independent journalism and verified reporting.",
    amount: input.amount,
    sourcePage: input.sourcePage || "/donate",
    cancelPath: "/payment/cancel",
    successPath: "/payment/success",
    customerEmail: input.donorEmail,
    customerName: input.donorName,
    requestId: input.requestId,
    metadata: {
      donor_name: input.donorName,
      donor_email: input.donorEmail,
      donor_message: input.message,
    },
  })
}

export async function createSponsoredCheckoutSession(input: SponsoredCheckoutInput, plan: PricingPlan) {
  return createEmbeddedCheckoutSession({
    kind: plan.kind,
    title: plan.title,
    description: plan.subtitle,
    amount: plan.price,
    sourcePage: input.sourcePage || "/promote",
    cancelPath: "/payment/cancel",
    successPath: "/payment/success",
    customerEmail: input.contactEmail,
    customerName: input.contactName,
    requestId: input.requestId,
    metadata: {
      plan_id: plan.id,
      article_id: input.articleId,
      article_title: input.articleTitle,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_company: input.contactCompany,
      placement: plan.placement,
    },
  })
}

export async function createArticleBoostSession(input: ArticleBoostInput) {
  const amount = 35 + input.durationDays * 12 + (input.homepagePriority ? 45 : 0) + (input.trendingBoost ? 35 : 0)

  return createEmbeddedCheckoutSession({
    kind: "article_boost",
    title: `Boost article: ${input.articleTitle}`,
    description: `Boost for ${input.durationDays} days${input.homepagePriority ? ", homepage priority" : ""}${input.trendingBoost ? ", trending section boost" : ""}.`,
    amount,
    sourcePage: input.sourcePage || "/promote",
    cancelPath: "/payment/cancel",
    successPath: "/payment/success",
    requestId: input.requestId,
    metadata: {
      article_id: input.articleId,
      article_title: input.articleTitle,
      duration_days: input.durationDays,
      homepage_priority: input.homepagePriority,
      trending_boost: input.trendingBoost,
    },
  })
}

export async function persistStripePaymentRecord(input: PaymentRecordInput) {
  const env = getEnv()

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { persisted: false }
  }

  const supabase = createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const transactionRow = {
    stripe_event_id: input.eventId,
    stripe_session_id: input.sessionId || null,
    stripe_payment_intent_id: input.paymentIntentId || null,
    payment_kind: input.kind,
    payment_status: input.status,
    amount_cents: Math.round(input.amount * 100),
    currency: input.currency,
    customer_email: input.customerEmail || null,
    customer_name: input.customerName || null,
    metadata: input.metadata,
    event_type: input.eventType,
    raw_payload: input.rawPayload,
    article_id: input.metadata.article_id || null,
    article_title: input.metadata.article_title || null,
    advertiser_name: input.metadata.contact_name || input.metadata.advertiser_name || null,
    advertiser_company: input.metadata.contact_company || null,
    promoted_article_id: input.metadata.promoted_article_id || input.metadata.article_id || null,
    duration_days: input.metadata.duration_days ? Number(input.metadata.duration_days) : null,
    homepage_priority: input.metadata.homepage_priority === "true",
    trending_boost: input.metadata.trending_boost === "true",
  }

  await supabase.from("payment_event_logs").upsert(
    {
      stripe_event_id: input.eventId,
      event_type: input.eventType,
      raw_payload: input.rawPayload,
      payment_kind: input.kind,
      payment_status: input.status,
    },
    { onConflict: "stripe_event_id" },
  )

  await supabase.from("payment_transactions").upsert(transactionRow, {
    onConflict: "stripe_session_id",
  })

  return { persisted: true }
}
