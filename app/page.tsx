import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"
import HomepageEditorial from "@/components/home/HomepageEditorial"
import { homepageFallbackArticles, toHomepageArticle } from "@/lib/homepage-data"
import ErrorBoundary from '@/components/errors/ErrorBoundary'
import { getBreaking, getEditorsPicks, getFeaturedHero, getLatestArticles, getLatestByCategoryRows, getMostPopular, getPhotoGallery } from "@/lib/homeQueries"
import EditorsPicksSection from "@/components/EditorsPicksSection"
import MostPopularSection from "@/components/MostPopularSection"
import PhotoGallery from "@/components/PhotoGallery"
import CategoryFeatureSection from "@/components/home/CategoryFeatureSection"
import NewsroomIdentitySection from "@/components/home/NewsroomIdentitySection"
import StayUpdatedWidget from "@/components/payments/StayUpdatedWidget"
import AdsKeeperHero from '@/components/ads/AdsKeeperHero'
import ArticleAdsenseSlot from '@/components/ads/ArticleAdsenseSlot'
import AdvertisementSlot from '@/components/AdvertisementSlot'

export const revalidate = 30
export const dynamic = "force-dynamic"

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
    canonical: "https://www.tuganire.site/",
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
  let rows: any[] = []
  let editorsPicks: any[] = []
  let mostPopular: any[] = []
  let photoGallery: any[] = []
  let latestArticles: any[] = []

  try {
    ;[breaking, hero, rows, editorsPicks, mostPopular, photoGallery, latestArticles] = await Promise.all([
      getBreaking(10, language),
      getFeaturedHero(language),
      getLatestByCategoryRows(language),
      getEditorsPicks(6, language),
      getMostPopular(6, 7, language),
      getPhotoGallery(8, language),
      getLatestArticles(5, language),
    ])
  } catch (error) {
    console.error("Homepage data unavailable:", error)
  }

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

  const breakingSlugs = new Set((breaking as any[]).map((article) => article.slug).filter(Boolean))
  const homepageArticles = (latestArticles as any[]).map((article) => ({
    ...toHomepageArticle(article, language),
    breaking: Boolean(article.is_breaking || breakingSlugs.has(article.slug)),
  }))
  const availableArticles = homepageArticles.length ? homepageArticles : homepageFallbackArticles
  const homepageHero = hero ? { ...toHomepageArticle(hero, language, true), breaking: Boolean(hero.is_breaking || breakingSlugs.has(hero.slug)) } : availableArticles[0] || null
  const homepageMostRead = (mostPopular as any[]).map((article) => toHomepageArticle(article, language))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <SiteHeader
        showAdvertisement
        breakingItems={(breaking as any[]).map((b: any) => ({
          slug: b.slug,
          title: b.title,
        }))}
      />

      <main className="space-y-10 pb-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          name: "Tuganire News",
          url: "https://www.tuganire.site",
          description: "Verified reporting and public-interest journalism from Rwanda, East Africa and the diaspora.",
          areaServed: ["Rwanda", "East Africa"],
        }) }} />
        {homepageHero && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: homepageHero.title,
          description: homepageHero.excerpt,
          image: homepageHero.image ? [homepageHero.image] : undefined,
          datePublished: homepageHero.publishedAt || undefined,
          author: { "@type": "Organization", name: homepageHero.author },
          publisher: { "@type": "Organization", name: "Tuganire News", url: "https://www.tuganire.site" },
          mainEntityOfPage: `https://www.tuganire.site/${language}/articles/${homepageHero.slug}`,
        }) }} />}
        <ErrorBoundary>
          <HomepageEditorial articles={availableArticles} hero={homepageHero} mostRead={homepageMostRead.length ? homepageMostRead : availableArticles} locale={language} />
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

              <AdvertisementSlot placement="HOME_MIDDLE" />

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
              <AdvertisementSlot placement="HOME_BOTTOM" />
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
