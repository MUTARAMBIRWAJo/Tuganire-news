"use server"

import { z } from "zod"
import {
  articleBoostDurations,
  businessAdvertisingPlans,
  eventPromotionPlans,
  premiumPromotedPostPlans,
  sponsoredPostPlans,
} from "@/lib/payment-config"
import {
  createArticleBoostSession,
  createDonationSession,
  createSponsoredCheckoutSession,
} from "@/lib/stripe-server"
import type { CheckoutSessionResult, DonationCheckoutInput, SponsoredCheckoutInput, ArticleBoostInput } from "@/types/payment"

export interface ActionResult {
  ok: boolean
  message: string
  session?: CheckoutSessionResult
}

const donationSchema = z.object({
  amount: z.coerce.number().min(1).max(10000),
  donorName: z.string().trim().max(120).optional(),
  donorEmail: z.string().email().optional().or(z.literal("")),
  message: z.string().trim().max(280).optional(),
  sourcePage: z.string().trim().max(120).optional(),
  requestId: z.string().trim().max(80).optional(),
})

const sponsoredSchema = z.object({
  planId: z.string().trim().min(1),
  sourcePage: z.string().trim().max(120).optional(),
  articleId: z.string().trim().max(120).optional(),
  articleTitle: z.string().trim().max(200).optional(),
  requestId: z.string().trim().max(80).optional(),
  contactName: z.string().trim().max(120).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactCompany: z.string().trim().max(120).optional(),
})

const boostSchema = z.object({
  articleId: z.string().trim().min(1),
  articleTitle: z.string().trim().min(3).max(200),
  durationDays: z.coerce.number().refine((value) => articleBoostDurations.includes(value as (typeof articleBoostDurations)[number]), "Select a supported duration."),
  homepagePriority: z.coerce.boolean(),
  trendingBoost: z.coerce.boolean(),
  sourcePage: z.string().trim().max(120).optional(),
  requestId: z.string().trim().max(80).optional(),
})

function resultFromError(error: unknown): ActionResult {
  const message = error instanceof Error ? error.message : "Unable to create a Stripe checkout session."
  return { ok: false, message }
}

function pickPlan(planId: string) {
  return (
    sponsoredPostPlans.find((plan) => plan.id === planId) ||
    businessAdvertisingPlans.find((plan) => plan.id === planId) ||
    eventPromotionPlans.find((plan) => plan.id === planId) ||
    premiumPromotedPostPlans.find((plan) => plan.id === planId)
  )
}

export async function createDonationCheckoutAction(input: DonationCheckoutInput): Promise<ActionResult> {
  try {
    const data = donationSchema.parse(input)
    const session = await createDonationSession(data)

    return { ok: true, message: "Donation checkout created.", session }
  } catch (error) {
    return resultFromError(error)
  }
}

export async function createSponsoredCheckoutAction(input: SponsoredCheckoutInput): Promise<ActionResult> {
  try {
    const data = sponsoredSchema.parse(input)
    const plan = pickPlan(data.planId)

    if (!plan) {
      throw new Error("Select a valid promotion package.")
    }

    const session = await createSponsoredCheckoutSession(data, plan)
    return { ok: true, message: "Promotion checkout created.", session }
  } catch (error) {
    return resultFromError(error)
  }
}

export async function createBusinessAdvertisingCheckoutAction(input: SponsoredCheckoutInput): Promise<ActionResult> {
  return createSponsoredCheckoutAction(input)
}

export async function createEventPromotionCheckoutAction(input: SponsoredCheckoutInput): Promise<ActionResult> {
  return createSponsoredCheckoutAction(input)
}

export async function createPremiumPromotedPostCheckoutAction(input: SponsoredCheckoutInput): Promise<ActionResult> {
  return createSponsoredCheckoutAction(input)
}

export async function createArticleBoostCheckoutAction(input: ArticleBoostInput): Promise<ActionResult> {
  try {
    const data = boostSchema.parse(input)
    const session = await createArticleBoostSession(data)

    return { ok: true, message: "Article boost checkout created.", session }
  } catch (error) {
    return resultFromError(error)
  }
}
