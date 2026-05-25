import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Megaphone, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import SponsoredPostPayment from "@/components/payments/SponsoredPostPayment"

export const metadata: Metadata = {
  title: "Advertise",
  description: "Pay for business advertising on Tuganire News with secure Stripe Embedded Checkout.",
  alternates: { canonical: "/advertise" },
}

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 shadow-sm dark:border-brand-900 dark:bg-slate-900 dark:text-brand-300">
              <Megaphone className="size-4" />
              Business advertising
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Professional advertising that fits a modern news experience.</h1>
            <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Choose a polished placement for sidebar ads, homepage banners, or sponsored category visibility. Stripe handles payment securely, while we keep the layout clean and editorial.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#advertise-packages">
                  View packages
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact sales</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Trust-first placements", text: "Ads are prepared to avoid clutter and excessive interruptions." },
              { title: "Analytics ready", text: "Metadata is saved for future reporting and invoices." },
              { title: "AdSense friendly", text: "No aggressive popups or dark patterns." },
              { title: "Mobile responsive", text: "Layouts remain lightweight across devices." },
            ].map((item) => (
              <Card key={item.title} className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    {item.title}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="advertise-packages" className="mb-12">
          <SponsoredPostPayment
            mode="business_ad"
            heading="Choose a business advertising package"
            description="Select a clean, premium placement that matches the tone of a serious news site."
            sourcePage="/advertise"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            "Sidebar ads for consistent visibility across article pages.",
            "Homepage banners for campaigns that need reach without clutter.",
            "Sponsored category ads for brand-aligned editorial environments.",
          ].map((text) => (
            <Card key={text} className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <CardContent className="p-5 text-sm text-slate-600 dark:text-slate-300">{text}</CardContent>
            </Card>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
