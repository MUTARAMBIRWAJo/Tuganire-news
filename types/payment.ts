export type PaymentKind =
  | "donation"
  | "sponsored_post"
  | "featured_homepage"
  | "premium_breaking"
  | "article_boost"
  | "business_ad"
  | "event_promotion"
  | "premium_promoted_post"

export type CheckoutStatus = "created" | "pending" | "completed" | "failed" | "canceled"

export type CheckoutMode = "embedded"

export interface MoneyValue {
  amount: number
  currency: string
}

export interface DonationPreset {
  amount: number
  label: string
  description: string
  featured?: boolean
}

export interface PricingPlan {
  id: string
  kind: PaymentKind
  title: string
  subtitle: string
  price: number
  currency: string
  badge?: string
  features: string[]
  placement?: string
}

export interface CheckoutSessionResult {
  sessionId: string
  clientSecret: string
  kind: PaymentKind
  status: CheckoutStatus
  amount: number
  currency: string
  successUrl: string
  cancelUrl: string
}

export interface DonationCheckoutInput {
  amount: number
  donorName?: string
  donorEmail?: string
  message?: string
  sourcePage?: string
  requestId?: string
}

export interface SponsoredCheckoutInput {
  planId: string
  sourcePage?: string
  articleId?: string
  articleTitle?: string
  requestId?: string
  contactName?: string
  contactEmail?: string
  contactCompany?: string
}

export interface ArticleBoostInput {
  articleId: string
  articleTitle: string
  durationDays: number
  homepagePriority: boolean
  trendingBoost: boolean
  sourcePage?: string
  requestId?: string
}

export interface PaymentRecordInput {
  eventId: string
  eventType: string
  sessionId?: string
  paymentIntentId?: string
  kind: PaymentKind
  status: CheckoutStatus
  amount: number
  currency: string
  customerEmail?: string | null
  customerName?: string | null
  metadata: Record<string, string>
  rawPayload: unknown
}
