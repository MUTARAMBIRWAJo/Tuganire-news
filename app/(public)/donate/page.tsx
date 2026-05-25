import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Heart, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import DonationCard from "@/components/payments/DonationCard"

export const metadata: Metadata = {
  title: "Donate",
  description: "Support independent journalism at Tuganire News with a secure Stripe Embedded Checkout donation.",
  alternates: { canonical: "/donate" },
}

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 shadow-sm dark:border-brand-900 dark:bg-slate-900 dark:text-brand-300">
              <Heart className="size-4" />
              Journalism support
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Help fund independent reporting that stays fast, credible, and ad-light.</h1>
            <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Donations support field reporting, editorial review, multilingual publishing, and newsroom tools that keep Tuganire News trustworthy and accessible.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#donate-form">
                  Support journalism
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Learn about the newsroom</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Transparent", text: "No aggressive upsells or hidden fees." },
              { title: "Fast", text: "Embedded checkout keeps the page lightweight." },
              { title: "Trustworthy", text: "Supports editorial standards and moderation." },
              { title: "Mobile friendly", text: "Optimized for small screens and low CLS." },
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

        <section id="donate-form" className="mb-12">
          <DonationCard sourcePage="/donate" />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            "Your contribution helps cover original reporting and fact-checking.",
            "Payments are handled by Stripe using a secure embedded checkout flow.",
            "You can support once or return whenever you want to back the newsroom again.",
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
