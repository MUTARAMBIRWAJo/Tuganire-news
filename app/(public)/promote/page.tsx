import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Rocket, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import SponsoredPostPayment from "@/components/payments/SponsoredPostPayment"
import PromoteArticleButton from "@/components/payments/PromoteArticleButton"
import { buildAuthLoginHref, buildAuthSignUpHref } from "@/lib/auth-redirect"

export const metadata: Metadata = {
  title: "Promote",
  description: "Boost sponsored news, featured homepage articles, premium promoted posts, and event promotions.",
  alternates: { canonical: "/promote" },
}

interface PromotePageProps {
  searchParams?: {
    articleId?: string
    articleTitle?: string
  }
}

export default function PromotePage({ searchParams }: PromotePageProps) {
  const articleId = searchParams?.articleId || ""
  const articleTitle = searchParams?.articleTitle || ""
  const loginHref = buildAuthLoginHref("/dashboard")
  const signUpHref = buildAuthSignUpHref("/dashboard")

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 shadow-sm dark:border-brand-900 dark:bg-slate-900 dark:text-brand-300">
              <Rocket className="size-4" />
              Sponsored publishing
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Boost an article or sponsor a story without turning the site into a storefront.</h1>
            <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Use clean promotion packages for sponsored news, featured homepage placement, premium promoted posts, and event visibility. The flow is Stripe-powered, embedded, and designed for a modern newsroom.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#boost-article">
                  Boost an article
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={loginHref}>Open dashboard</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href={signUpHref}>Create account</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Sponsored stories", text: "Promote articles with editorial review and a sponsored label." },
              { title: "Homepage priority", text: "Move important stories higher without intrusive ad behavior." },
              { title: "Trending boosts", text: "Enable stronger visibility for time-sensitive stories." },
              { title: "Event packages", text: "Support conferences and launches with premium placements." },
            ].map((item) => (
              <Card key={item.title} className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <Sparkles className="size-4 text-emerald-600" />
                    {item.title}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="boost-article" className="mb-12">
          <SponsoredPostPayment
            mode="article_boost"
            heading="Boost article"
            description="Pick a duration and optional priority flags for homepage and trending visibility."
            sourcePage="/promote"
            articleId={articleId}
            articleTitle={articleTitle}
          />
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <SponsoredPostPayment
            mode="sponsored_post"
            heading="Sponsored news and article publishing"
            description="Select a sponsored story package for editorially reviewed paid content."
            sourcePage="/promote"
            articleId={articleId}
            articleTitle={articleTitle}
          />

          <SponsoredPostPayment
            mode="premium_promoted_post"
            heading="Premium promoted posts"
            description="High-trust promoted posts for thought leadership and brand campaigns."
            sourcePage="/promote"
            articleId={articleId}
            articleTitle={articleTitle}
          />
        </section>

        <section className="mt-12">
          <SponsoredPostPayment
            mode="event_promotion"
            heading="Event promotion packages"
            description="Promote conferences, launches, and newsroom partnerships with a polished event package."
            sourcePage="/promote"
            articleId={articleId}
            articleTitle={articleTitle}
          />
        </section>

        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            "Save payment metadata for future invoices and campaign tracking.",
            "Embedded checkout keeps the experience fast and consistent across devices.",
            "Use Boost Article from the dashboard to prefill the article ID and title.",
          ].map((text) => (
            <Card key={text} className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <CardContent className="p-5 text-sm text-slate-600 dark:text-slate-300">{text}</CardContent>
            </Card>
          ))}
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PromoteArticleButton articleId={articleId || "new-article"} articleTitle={articleTitle || "Open promotion workflow"} />
          <Button variant="outline" asChild>
            <Link href="/contact">Talk to the sales team</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
