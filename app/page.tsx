import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"
import HeroSection from "@/components/editorial/HeroSection"
import TrendingRail from "@/components/TrendingRail"
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

export default async function HomePage() {
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
      getBreaking(10),
      getFeaturedHero(),
      getTrending(10),
      getLatestByCategoryRows(),
      getEditorsPicks(6),
      getMostPopular(6, 7),
      getPhotoGallery(8),
      getLatestArticles(5),
    ])
  } catch (error) {
    console.error("Homepage data unavailable:", error)
  }

  const sideStories = (latestArticles as any[]).map((article: any) => ({
    slug: article.slug,
    title: article.title,
    featured_image: article.featured_image,
    published_at: article.published_at,
    views_count: article.views_count,
    categories: article.category,
  }))

  const categoryTargets = [
    { title: "Politics", keywords: ["politics", "political"] },
    { title: "Sports", keywords: ["sports", "sport"] },
    { title: "Business", keywords: ["business", "market", "economy"] },
    { title: "Entertainment", keywords: ["entertainment", "culture", "lifestyle"] },
    { title: "Technology", keywords: ["technology", "tech", "science"] },
    { title: "World", keywords: ["world", "international", "global"] },
  ]

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
        articles: row.articles,
      }
    })
    .filter(Boolean) as Array<{ title: string; categorySlug: string; articles: any[] }>

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <SiteHeader
        breakingItems={(breaking as any[]).map((b: any) => ({
          slug: b.slug,
          title: b.title,
        }))}
      />

      <main className="space-y-8 pb-16">
        <ErrorBoundary>
          <HeroSection item={hero as any} sideStories={sideStories.slice(0, 4) as any} />
        </ErrorBoundary>

        <ErrorBoundary>
          <TrendingRail items={trending as any} />
        </ErrorBoundary>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="space-y-10">
              {categorySections.map((section) => (
                <ErrorBoundary key={section.categorySlug}>
                  <CategoryFeatureSection
                    title={section.title}
                    categorySlug={section.categorySlug}
                    articles={section.articles}
                  />
                </ErrorBoundary>
              ))}

              <ErrorBoundary>
                <EditorsPicksSection items={editorsPicks as any} />
              </ErrorBoundary>
              <ErrorBoundary>
                <ArticleAdsenseSlot />
              </ErrorBoundary>
              <ErrorBoundary>
                <MostPopularSection items={mostPopular as any} period="week" />
              </ErrorBoundary>
              <ErrorBoundary>
                <PhotoGallery items={photoGallery as any} title="Video / Photo Gallery" />
              </ErrorBoundary>
              <NewsroomIdentitySection />
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
