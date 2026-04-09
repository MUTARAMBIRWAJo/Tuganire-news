import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"
import BreakingNewsBar from "@/components/BreakingNewsBar"
import HeroSection from "@/components/editorial/HeroSection"
import FeaturedSideList from "@/components/editorial/FeaturedSideList"
import SectionBlock from "@/components/editorial/SectionBlock"
import TrendingRail from "@/components/TrendingRail"
import { getBreaking, getFeaturedHero, getTrending, getLatestByCategoryRows, getEditorsPicks, getMostPopular, getMostLiked, getMostCommented, getPhotoGallery, getLatestArticles, getLatestArticlesOffset } from "@/lib/homeQueries"
import EditorsPicksSection from "@/components/EditorsPicksSection"
import MostPopularSection from "@/components/MostPopularSection"
import MostLikedSection from "@/components/MostLikedSection"
import MostCommentedSection from "@/components/MostCommentedSection"
import LatestArticlesSection from "@/components/LatestArticlesSection"
import NewsletterSignup from "@/components/NewsletterSignup"
import PhotoGallery from "@/components/PhotoGallery"
import WeatherWidget from "@/components/WeatherWidget"
import StockTicker from "@/components/StockTicker"
import AdsKeeperHero from "@/components/ads/AdsKeeperHero"

export const revalidate = 30 // Revalidate every 30 seconds

export const metadata: Metadata = {
  title: "Tuganire News - Latest Breaking News, Stories & Analysis",
  description: "Stay informed with the latest breaking news, in-depth analysis, and exclusive stories from Tuganire News. Your trusted source for world news, politics, technology, sports, and culture.",
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
  const heroAds = [
    { widgetId: "1992830", adHeightPx: 300 },
    { widgetId: "1992830", adHeightPx: 300 },
    { widgetId: "1992830", adHeightPx: 300 },
    { widgetId: "1992830", adHeightPx: 300 },
  ]

  let breaking: any[] = []
  let hero: any = null
  let trending: any[] = []
  let rows: any[] = []
  let editorsPicks: any[] = []
  let mostPopular: any[] = []
  let mostLiked: any[] = []
  let mostCommented: any[] = []
  let photoGallery: any[] = []
  let latestArticles: any[] = []
  let latestArticlesOffset: any[] = []

  try {
    ;[
      breaking,
      hero,
      trending,
      rows,
      editorsPicks,
      mostPopular,
      mostLiked,
      mostCommented,
      photoGallery,
      latestArticles,
      latestArticlesOffset,
    ] = await Promise.all([
      getBreaking(10),
      getFeaturedHero(),
      getTrending(12),
      getLatestByCategoryRows(),
      getEditorsPicks(6),
      getMostPopular(6, 7),
      getMostLiked(6),
      getMostCommented(6, 30),
      getPhotoGallery(8),
      getLatestArticles(6),
      getLatestArticlesOffset(6, 6),
    ])
  } catch (error) {
    console.error("Homepage data unavailable:", error)
  }

  // Get side stories for hero section (latest 6 articles)
  const sideStories = (latestArticles as any[]).map((article: any) => ({
    slug: article.slug,
    title: article.title,
    featured_image: article.featured_image,
    published_at: article.published_at,
    views_count: article.views_count,
    categories: article.category,
  }))

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <BreakingNewsBar
        items={(breaking as any[]).map((b: any) => ({
          slug: b.slug,
          title: b.title,
        }))}
      />
      <SiteHeader />

      <main className="space-y-8">
        {/* Hero Section with Side Stories */}
        <section className="relative">
          <HeroSection item={hero as any} sideStories={sideStories as any} />
        </section>

        {/* Hero Ads Row */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {heroAds.map((ad, index) => (
              <AdsKeeperHero
                key={`${ad.widgetId}-${index}`}
                widgetId={ad.widgetId}
                adHeightPx={ad.adHeightPx}
              />
            ))}
          </div>
        </section>

        {/* Trending Rail */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrendingRail items={trending as any} />
        </section>

        {/* Latest Articles (7-12) */}
        {latestArticlesOffset && (latestArticlesOffset as any[]).length > 0 && (
          <LatestArticlesSection 
            items={latestArticlesOffset as any}
            title="More Latest Stories"
            subtitle="Continue reading more of the newest articles"
          />
        )}

        {/* Category Sections using new SectionBlock */}
        {rows && (rows as any[]).length > 0 && (
          <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Latest by Category</h2>
            </div>
            <div className="space-y-8">
              {(rows as any[]).map((categoryRow: any) => (
                <SectionBlock
                  key={categoryRow.category_slug}
                  title={categoryRow.category_name}
                  categorySlug={categoryRow.category_slug}
                  articles={categoryRow.articles || []}
                  showReadMore={true}
                  maxArticles={4}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sidebar Widgets Row */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-8">
              <EditorsPicksSection items={editorsPicks as any} />
              <MostPopularSection items={mostPopular as any} period="week" />
              <MostLikedSection items={mostLiked as any} />
              <MostCommentedSection items={mostCommented as any} />
              <PhotoGallery items={photoGallery as any} />
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-6 space-y-6">
                <WeatherWidget defaultLocation="Kigali" />
                <StockTicker symbols={["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]} />
              </div>
            </div>
          </div>
        </section>
        
        {/* Newsletter Signup */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
