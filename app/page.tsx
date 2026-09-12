import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"
import HeroSection from "@/components/editorial/HeroSection"
import TrendingRail from "@/components/TrendingRail"
import LatestNewsSection from "@/components/home/LatestNewsSection"
import ErrorBoundary from '@/components/errors/ErrorBoundary'
import { getBreaking, getEditorsPicks, getFeaturedHero, getLatestArticles, getLatestByCategoryRows, getMostPopular, getPhotoGallery, getTrending } from "@/lib/homeQueries"
import EditorsPicksSection from "@/components/EditorsPicksSection"
import MostPopularSection from "@/components/MostPopularSection"
import PhotoGallery from "@/components/PhotoGallery"
import CategoryFeatureSection from "@/components/home/CategoryFeatureSection"
import NewsroomIdentitySection from "@/components/home/NewsroomIdentitySection"
import StayUpdatedWidget from "@/components/payments/StayUpdatedWidget"
import AdsKeeperHero from '@/components/ads/AdsKeeperHero'
import ArticleAdsenseSlot from '@/components/ads/ArticleAdsenseSlot'

export const revalidate = 30

export const metadata: Metadata = {
  title: "Tuganire News - Latest Breaking News, Stories & Analysis",
  description:
    "Stay informed with the latest breaking news, in-depth analysis, and exclusive stories from Tuganire News. Your trusted source for world news, politics, technology, sports, and culture.",
  keywords: ["news", "breaking news", "latest news", "world news", "politics", "technology", "sports", "culture"],
  openGraph: {
    title: "Tuganire News - Latest Breaking News & Stories",
    description: "Stay informed with the latest breaking news, in-depth analysis, and exclusive stories.",
    type: "website",
    locale: "en_US",
    siteName: "Tuganire News",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuganire News - Latest Breaking News",
    description: "Stay informed with the latest breaking news and stories.",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
}

export default async function HomePage({
  params,
}: {
  params?: Promise<{ lang?: string }>
} = {}) {
  const resolved = await params
  const language = resolved?.lang === "rw" ? "rw" : "en"

  let breaking: any[] = []
  let hero: any = null
  let trending: any[] = []
  let rows: any[] = []
  let editorsPicks: any[] = []
  let mostPopular: any[] = []
  let photoGallery: any[] = []
  let latestArticles: any[] = []

  try {
    ;[breaking, hero, trending, rows, editorsPicks, mostPopular, photoGallery, latestArticles] = await Promise.all([
      getBreaking(10, language),
      getFeaturedHero(language),
      getTrending(10, language),
      getLatestByCategoryRows(language),
      getEditorsPicks(6, language),
      getMostPopular(6, 7, language),
      getPhotoGallery(8, language),
      getLatestArticles(5, language),
    ])
  } catch (error) {
    console.error("Homepage data unavailable:", error)
  }

  const sideStories = (latestArticles as any[])
    .filter((article: any) => article.slug !== hero?.slug)
    .map((article: any) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    featured_image: article.featured_image,
    published_at: article.published_at,
    views_count: article.views_count,
    categories: article.category,
    }))

  const categoryTargets = [
    { title: "Politics", keywords: ["politics", "political"], variant: "lead" as const },
    { title: "Business", keywords: ["business", "market", "economy"], variant: "grid" as const },
    { title: "Technology", keywords: ["technology", "tech", "science"], variant: "list" as const },
    { title: "Sports", keywords: ["sports", "sport"], variant: "split" as const },
    { title: "World", keywords: ["world", "international", "global"], variant: "grid" as const },
    { title: "Entertainment", keywords: ["entertainment", "culture", "lifestyle"], variant: "split" as const },
  ]

  const excludedHomeStories = new Set([
    hero?.slug,
    ...(latestArticles as any[]).slice(0, 2).map((article: any) => article.slug),
  ].filter(Boolean))

  const normalizedRows = (rows as any[])
    .map((row) => ({
      ...row,
      matchKey: `${String(row.category_name || "").toLowerCase()} ${String(row.category_slug || "").toLowerCase()}`,
    }))
    .filter((row) => row.articles?.length)

  const categorySections = categoryTargets
    .map((target) => {
      const row = normalizedRows.find((entry) => target.keywords.some((keyword) => entry.matchKey.includes(keyword)))
      if (!row) return null
      return {
        title: target.title,
        categorySlug: row.category_slug,
        variant: target.variant,
        articles: row.articles.filter((article: any) => !excludedHomeStories.has(article.slug)),
      }
    })
    .filter(Boolean) as Array<{ title: string; categorySlug: string; variant: "lead" | "grid" | "split" | "list"; articles: any[] }>

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <SiteHeader
        breakingItems={(breaking as any[]).map((b: any) => ({
          slug: b.slug,
          title: b.title,
        }))}
      />

      <main className="space-y-10 pb-20">
        <ErrorBoundary>
          <HeroSection item={hero as any} sideStories={sideStories.slice(0, 4) as any} locale={language} />
        </ErrorBoundary>

        <ErrorBoundary>
          <LatestNewsSection items={latestArticles as any} locale={language} />
        </ErrorBoundary>

        <ErrorBoundary>
          <TrendingRail items={trending as any} locale={language} />
        </ErrorBoundary>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="space-y-10">
              {categorySections.slice(0, 2).map((section) => (
                <ErrorBoundary key={section.categorySlug}>
                  <CategoryFeatureSection
                    title={section.title}
                    categorySlug={section.categorySlug}
                    articles={section.articles}
                    variant={section.variant}
                    locale={language}
                  />
                </ErrorBoundary>
              ))}

              <div className="grid gap-10 xl:grid-cols-2">
                {categorySections.slice(2).map((section) => (
                  <ErrorBoundary key={section.categorySlug}>
                    <CategoryFeatureSection
                      title={section.title}
                      categorySlug={section.categorySlug}
                      articles={section.articles}
                      variant={section.variant}
                      locale={language}
                    />
                  </ErrorBoundary>
                ))}
              </div>

              <ErrorBoundary>
                <EditorsPicksSection items={editorsPicks as any} locale={language} />
              </ErrorBoundary>
              <ErrorBoundary>
                <ArticleAdsenseSlot />
              </ErrorBoundary>
              <ErrorBoundary>
                <MostPopularSection items={mostPopular as any} period="week" locale={language} />
              </ErrorBoundary>
              <ErrorBoundary>
                <PhotoGallery items={photoGallery as any} title={language === "rw" ? "Amafoto n'amashusho" : "Video / Photo Gallery"} />
              </ErrorBoundary>
              <NewsroomIdentitySection locale={language} />
            </div>

            <div className="lg:sticky lg:top-24">
              <div className="space-y-6">
                <AdsKeeperHero className="mb-4" widgetId="1992246" adHeightPx={260} />
                <StayUpdatedWidget />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
