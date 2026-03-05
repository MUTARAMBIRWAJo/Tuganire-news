import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"
import BreakingNewsBar from "@/components/BreakingNewsBar"
import HeroSection from "@/components/editorial/HeroSection"
import FeaturedSideList from "@/components/editorial/FeaturedSideList"
import SectionBlock from "@/components/editorial/SectionBlock"
import TrendingRail from "@/components/TrendingRail"
import { getBreaking, getFeaturedHero, getTrending, getLatestByCategoryRows, getEditorsPicks, getMostPopular, getMostLiked, getMostCommented, getPhotoGallery, getLatestArticles } from "@/lib/homeQueries"
import EditorsPicksSection from "@/components/EditorsPicksSection"
import MostPopularSection from "@/components/MostPopularSection"
import MostLikedSection from "@/components/MostLikedSection"
import MostCommentedSection from "@/components/MostCommentedSection"
import NewsletterSignup from "@/components/NewsletterSignup"
import PhotoGallery from "@/components/PhotoGallery"
import WeatherWidget from "@/components/WeatherWidget"
import StockTicker from "@/components/StockTicker"
import AdvertisementMarquee from "@/components/AdvertisementMarquee"
import AdSenseHero from "@/components/ads/AdSenseHero"
import AdSenseSidebar from "@/components/ads/AdSenseSidebar"
import AdSenseBanner from "@/components/ads/AdSenseBanner"
import AdSenseInContent from "@/components/ads/AdSenseInContent"
import Script from "next/script"

export const revalidate = 120 // Revalidate every 2 minutes

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
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
}

export default async function HomePage() {
  const [breaking, hero, trending, rows, editorsPicks, mostPopular, mostLiked, mostCommented, photoGallery, latestArticles] = await Promise.all([
    getBreaking(10),
    getFeaturedHero(),
    getTrending(12),
    getLatestByCategoryRows(),
    getEditorsPicks(6),
    getMostPopular(6, 7), // Last 7 days
    getMostLiked(6),
    getMostCommented(6, 30),
    getPhotoGallery(8),
    getLatestArticles(6)
  ])

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

        {/* Hero Ad */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSenseHero adSlot="1234567890" className="mb-8" />
        </section>

        {/* Trending Rail */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrendingRail items={trending as any} />
        </section>

        {/* Category Sections using new SectionBlock */}
        {rows && (rows as any[]).length > 0 && (
          <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Latest by Category
              </h2>
              <AdSenseBanner adSlot="2345678901" className="w-auto" fullWidth={false} />
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
                <AdvertisementMarquee />
                
                {/* Google AdSense Vertical Ads */}
                <AdSenseSidebar adSlot="3456789012" className="mb-6" />
                
                {/* Additional Banner Ad */}
                <AdSenseBanner adSlot="4567890123" adFormat="vertical" className="mb-6" />
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
