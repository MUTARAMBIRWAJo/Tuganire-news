"use client"

import { useMemo, useState, useTransition } from "react"
import { BadgeCheck, Globe2, Megaphone, Newspaper, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import Checkout from "@/components/payments/Checkout"
import PricingCards from "@/components/payments/PricingCards"
import {
  articleBoostDurations,
  businessAdvertisingPlans,
  eventPromotionPlans,
  premiumPromotedPostPlans,
  sponsoredPostPlans,
} from "@/lib/payment-config"
import {
  createArticleBoostCheckoutAction,
  createBusinessAdvertisingCheckoutAction,
  createEventPromotionCheckoutAction,
  createPremiumPromotedPostCheckoutAction,
  createSponsoredCheckoutAction,
} from "@/app/actions/stripe"
import type { PricingPlan } from "@/types/payment"

type PaymentMode =
  | "sponsored_post"
  | "featured_homepage"
  | "premium_breaking"
  | "business_ad"
  | "event_promotion"
  | "premium_promoted_post"
  | "article_boost"

interface SponsoredPostPaymentProps {
  mode: PaymentMode
  heading: string
  description: string
  sourcePage?: string
  articleId?: string
  articleTitle?: string
}

function modeConfig(mode: PaymentMode) {
  switch (mode) {
    case "business_ad":
      return {
        icon: Megaphone,
        plans: businessAdvertisingPlans,
        action: createBusinessAdvertisingCheckoutAction,
        ctaLabel: "Select ad package",
      }
    case "event_promotion":
      return {
        icon: Globe2,
        plans: eventPromotionPlans,
        action: createEventPromotionCheckoutAction,
        ctaLabel: "Select event package",
      }
    case "premium_promoted_post":
      return {
        icon: BadgeCheck,
        plans: premiumPromotedPostPlans,
        action: createPremiumPromotedPostCheckoutAction,
        ctaLabel: "Select promoted post",
      }
    case "featured_homepage":
    case "premium_breaking":
    case "sponsored_post":
    default:
      return {
        icon: Newspaper,
        plans: sponsoredPostPlans,
        action: createSponsoredCheckoutAction,
        ctaLabel: "Select promotion package",
      }
  }
}

export default function SponsoredPostPayment({
  mode,
  heading,
  description,
  sourcePage = "/promote",
  articleId,
  articleTitle,
}: SponsoredPostPaymentProps) {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string>("")
  const [contactName, setContactName] = useState<string>("")
  const [contactEmail, setContactEmail] = useState<string>("")
  const [contactCompany, setContactCompany] = useState<string>("")
  const [durationDays, setDurationDays] = useState<number>(7)
  const [homepagePriority, setHomepagePriority] = useState<boolean>(true)
  const [trendingBoost, setTrendingBoost] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const { icon: Icon, plans, action, ctaLabel } = useMemo(() => modeConfig(mode), [mode])

  const articleBoostAmount = useMemo(() => {
    return 35 + durationDays * 12 + (homepagePriority ? 45 : 0) + (trendingBoost ? 35 : 0)
  }, [durationDays, homepagePriority, trendingBoost])

  const beginCheckout = (plan: PricingPlan) => {
    setError("")
    setSelectedPlan(plan)

    startTransition(async () => {
      const result = await action({
        planId: plan.id,
        sourcePage,
        articleId,
        articleTitle,
        requestId: crypto.randomUUID(),
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactCompany: contactCompany || undefined,
      })

      if (!result.ok || !result.session) {
        setError(result.message)
        return
      }

      setClientSecret(result.session.clientSecret)
    })
  }

  const beginArticleBoostCheckout = () => {
    setError("")
    if (!articleId || !articleTitle) {
      setError("Provide an article ID and title from the dashboard before boosting the story.")
      return
    }

    startTransition(async () => {
      const result = await createArticleBoostCheckoutAction({
        articleId,
        articleTitle,
        durationDays,
        homepagePriority,
        trendingBoost,
        sourcePage,
        requestId: crypto.randomUUID(),
      })

      if (!result.ok || !result.session) {
        setError(result.message)
        return
      }

      setClientSecret(result.session.clientSecret)
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            <Icon className="size-4" />
            Monetization package
          </div>
          <CardTitle>{heading}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "article_boost" ? (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="space-y-2">
                  <Label htmlFor="boost-duration">Duration</Label>
                  <Select value={String(durationDays)} onValueChange={(value) => setDurationDays(Number(value))}>
                    <SelectTrigger id="boost-duration" className="w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {articleBoostDurations.map((days) => (
                        <SelectItem key={days} value={String(days)}>
                          {days} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                  <span>
                    <span className="block font-medium text-slate-900 dark:text-white">Homepage priority</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Place the story higher on the homepage feed.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={homepagePriority}
                    onChange={(event) => setHomepagePriority(event.target.checked)}
                    className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                  <span>
                    <span className="block font-medium text-slate-900 dark:text-white">Trending section boost</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Enable secondary visibility in trending modules.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={trendingBoost}
                    onChange={(event) => setTrendingBoost(event.target.checked)}
                    className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="article-id">Article ID</Label>
                    <Input id="article-id" value={articleId || ""} readOnly placeholder="Open this page from an article editor to prefill" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="article-title">Article title</Label>
                    <Input id="article-title" value={articleTitle || ""} readOnly placeholder="Prefilled from the editor" />
                  </div>
                </div>

                <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-950/30 dark:text-brand-100">
                  Estimated checkout total: <span className="font-semibold">${articleBoostAmount.toFixed(2)}</span>
                </div>

                <Button onClick={beginArticleBoostCheckout} disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      Creating checkout
                    </>
                  ) : (
                    "Boost article"
                  )}
                </Button>
              </div>

              <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Boosting includes</div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex gap-2"><Sparkles className="mt-0.5 size-4 text-brand-600" />Higher editorial visibility</li>
                  <li className="flex gap-2"><Sparkles className="mt-0.5 size-4 text-brand-600" />Homepage and trending toggles</li>
                  <li className="flex gap-2"><Sparkles className="mt-0.5 size-4 text-brand-600" />Metadata prepared for analytics tracking</li>
                  <li className="flex gap-2"><Sparkles className="mt-0.5 size-4 text-brand-600" />No aggressive popups or disruptive ad units</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <Label htmlFor="contact-name">Contact name</Label>
                  <Input id="contact-name" className="mt-2" value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Optional" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <Label htmlFor="contact-email">Contact email</Label>
                  <Input id="contact-email" type="email" className="mt-2" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="Optional" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-2">
                  <Label htmlFor="contact-company">Company</Label>
                  <Input id="contact-company" className="mt-2" value={contactCompany} onChange={(event) => setContactCompany(event.target.value)} placeholder="Optional advertiser or sponsor name" />
                </div>
              </div>

              <PricingCards plans={plans} selectedPlanId={selectedPlan?.id} onSelect={beginCheckout} ctaLabel={ctaLabel} />
            </>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </CardContent>
      </Card>

      <Checkout
        clientSecret={clientSecret}
        title="Secure Stripe checkout"
        description="Embedded checkout is used so the page remains on-brand, fast, and mobile friendly."
      />
    </div>
  )
}
