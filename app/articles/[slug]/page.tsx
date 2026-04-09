import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Eye, ArrowLeft, MessageCircle, Clock3 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArticleCard } from "@/components/article-card"
import type { Metadata } from "next"
import Prose from "@/components/Prose"
import CommentsSection from "@/components/comments-section"
import RelatedArticles from "@/components/RelatedArticles"
import { ShareButton } from "@/components/ShareButton"
import { LikeButton } from "@/components/LikeButton"
import AdsKeeperHero from "@/components/ads/AdsKeeperHero"
import { formatReadingTime, wordCount as getWordCount } from "@/lib/readingTime"

export const revalidate = 300 // Revalidate every 5 minutes

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tuganire.site").replace(/\/+$/, "")

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published")
    .not("slug", "is", null)
    .order("published_at", { ascending: false })
    .limit(500)

  // Exclude slugs longer than 200 chars — filesystem limit is 255 bytes and Next.js appends
  // a '.segments' suffix during static generation, causing ENAMETOOLONG on some OS paths.
  return (data || [])
    .filter((a: any) => a?.slug && (a.slug as string).length <= 200)
    .map((a: any) => ({ slug: a.slug as string }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const canonicalUrl = `${siteUrl}/articles/${slug}`
  const res = await fetch(`${siteUrl}/api/public/articles/${slug}`, { next: { revalidate } })
  if (!res.ok) {
    return {
      title: "Article Not Found",
    }
  }
  const { article } = await res.json()

  const author = Array.isArray(article.author) ? article.author[0] : article.author
  const category = Array.isArray(article.category) ? article.category[0] : article.category

  const isVideo = (article as any)?.article_type === 'video' && !!(article as any)?.youtube_link
  return {
    title: (article as any)?.seo_title || article.title,
    description: article.excerpt || undefined,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      title: (article as any)?.seo_title || article.title,
      description: article.excerpt || undefined,
      type: isVideo ? "video.other" : "article",
      url: canonicalUrl,
      publishedTime: article.published_at || undefined,
      authors: author?.display_name ? [author.display_name] : undefined,
      images: article.featured_image ? [article.featured_image] : undefined,
      videos: isVideo ? [String((article as any).youtube_link)] as any : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: (article as any)?.seo_title || article.title,
      description: article.excerpt || undefined,
      images: article.featured_image ? [article.featured_image] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const res = await fetch(`${siteUrl}/api/public/articles/${slug}`, { next: { revalidate } })
  if (res.status === 404) return notFound()
  if (!res.ok) return notFound()
  const { article, media: mediaItems, related: finalRelated } = await res.json()

  // Increment view count (non-blocking via API route)
  fetch(`${siteUrl}/api/views/${slug}`, {
    method: "POST",
  }).catch(() => {
    // Silently fail if view counter doesn't work
  })

  // Tags (tolerant)
  const tagIds = article.article_tags?.map((at: any) => at.tag?.id).filter(Boolean) || []

  const author = Array.isArray(article.author) ? article.author[0] : article.author
  const category = Array.isArray(article.category) ? article.category[0] : article.category
  const tags = article.article_tags?.map((at: any) => at.tag).filter(Boolean) || []

  const isVideo = (article as any)?.article_type === 'video' && !!(article as any)?.youtube_link
  const wordCount = getWordCount(String(article.content || ""))
  const readingTimeLabel = formatReadingTime(String(article.content || ""))
  const toEmbedUrl = (url: string) => {
    try {
      const short = url.match(/^https?:\/\/youtu\.be\/([\w-]{6,})/i)
      if (short) return `https://www.youtube.com/embed/${short[1]}`
      const u = new URL(url)
      const v = u.searchParams.get("v")
      if (v) return `https://www.youtube.com/embed/${v}`
      return url.replace("watch?v=", "embed/")
    } catch {
      return url.replace("watch?v=", "embed/")
    }
  }

  // Generate JSON-LD structured data
  const canonicalUrl = `${siteUrl}/articles/${slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: "Tuganire News",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/placeholder-logo.png`,
        },
      },
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: article.title,
        description: article.excerpt || undefined,
        image: article.featured_image ? [article.featured_image] : undefined,
        datePublished: article.published_at || undefined,
        dateModified: article.updated_at || undefined,
        author: author?.display_name
          ? {
              "@type": "Person",
              name: author.display_name,
            }
          : undefined,
        publisher: {
          "@type": "Organization",
          "@id": `${siteUrl}#organization`,
          name: "Tuganire News",
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/placeholder-logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      },
      {
        "@type": "NewsArticle",
        "@id": `${canonicalUrl}#newsarticle`,
        headline: article.title,
        description: article.excerpt || undefined,
        image: article.featured_image ? [article.featured_image] : undefined,
        datePublished: article.published_at || undefined,
        dateModified: article.updated_at || undefined,
        articleSection: category?.name || undefined,
        wordCount: wordCount || undefined,
        author: author?.display_name
          ? {
              "@type": "Person",
              name: author.display_name,
            }
          : undefined,
        publisher: {
          "@type": "Organization",
          "@id": `${siteUrl}#organization`,
          name: "Tuganire News",
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/placeholder-logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      },
    ],
  }

  const shareUrl = canonicalUrl
  const shareText = article.title
  const articleAdWidgets = [
    { widgetId: "1992830", adHeightPx: 300 },
    { widgetId: "1992246", adHeightPx: 300 },
    { widgetId: "1992253", adHeightPx: 300 },
    { widgetId: "1992830", adHeightPx: 300 },
  ]

  // Extract image URLs from content as fallback
  const contentMatches: string[] = ((article.content || "").match(/https?:\/\/[^\s)]+\.(?:png|jpe?g|webp|gif)/gi) || []) as string[]
  const contentGallery: string[] = Array.from(new Set<string>(contentMatches)).slice(0, 6)
  const images = (mediaItems || []).filter((m: any) => m.media_type === "image").map((m: any) => ({ type: "image" as const, url: m.url, caption: m.caption }))
  const videos = (mediaItems || []).filter((m: any) => m.media_type === "video").map((m: any) => ({ type: "video" as const, url: m.url, caption: m.caption }))
  const audios = (mediaItems || []).filter((m: any) => m.media_type === "audio").map((m: any) => ({ type: "audio" as const, url: m.url, caption: m.caption }))
  const structuredGallery = [...images, ...videos, ...audios]
  const fallbackGallery = contentGallery.map((u) => ({ type: "image" as const, url: u, caption: undefined as string | undefined }))
  const gallery = (structuredGallery.length > 0 ? structuredGallery : fallbackGallery).slice(0, 6)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <SiteHeader />

      <main className="flex-1">
        <div className="max-w-6xl xl:max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <article className="max-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
            {/* Article Header */}
            <header className="mb-8">
              {category && (
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-block text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline mb-4"
                >
                  {category.name}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-headline leading-tight text-balance text-gray-900 dark:text-white">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-sm sm:text-base md:text-body leading-relaxed text-gray-700 dark:text-gray-300 mb-6 text-pretty">{article.excerpt}</p>
              )}
              <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                {author && (
                  <span className="flex items-center gap-2">
                    {author.avatar_url ? (
                      <Image
                        src={author.avatar_url}
                        alt={author.display_name || "Author"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    {author.display_name || "Anonymous"}
                  </span>
                )}
                {article.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                {article.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.published_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false
                    })}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {readingTimeLabel}
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {(article as any).comments_count || 0} comments
                </span>
                <span className="flex items-center gap-2">
                  <LikeButton slug={slug} initialCount={(article as any).likes_count || 0} />
                </span>
              </div>

              {isVideo && (
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href="#player"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Watch here
                  </a>
                  {(article as any)?.youtube_link && (
                    <a
                      href={String((article as any).youtube_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      Watch on YouTube
                    </a>
                  )}
                </div>
              )}
            </header>

            {/* Video or Featured Image */}
            {isVideo ? (
              <div id="player" className="mb-8 aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  className="w-full h-full"
                  src={toEmbedUrl(String((article as any).youtube_link))}
                  title={article.title}
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : article.featured_image && (
              <div className="mb-8 mx-auto flex justify-center items-center w-full max-w-full md:max-w-3xl lg:max-w-4xl p-2 sm:p-4 bg-gray-50 dark:bg-slate-800 rounded-lg sm:rounded-xl\">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="w-full h-auto object-contain rounded-lg sm:rounded-xl"
                  sizes="(max-width: 640px) calc(100vw - 16px), (max-width: 1024px) calc(100vw - 32px), 896px"
                />
              </div>
            )}

            {/* Article Content */}
            {article.content && (
              <>
                {/* Ads row - keep reader flow uninterrupted */}
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {articleAdWidgets.map((ad, index) => (
                    <AdsKeeperHero
                      key={`${ad.widgetId}-${index}`}
                      widgetId={ad.widgetId}
                      adHeightPx={ad.adHeightPx}
                    />
                  ))}
                </div>
                
                <Prose className="mb-12">
                  <div
                    className="prose-content"
                    dangerouslySetInnerHTML={{ __html: String(article.content || "") }}
                  />
                </Prose>
              </>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-8 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags:</span>
                {tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="rounded-full bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200 px-3 py-1 text-sm hover:bg-brand-200 dark:hover:bg-brand-800 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Share Buttons */}
            <div className="border-t border-b border-gray-200 dark:border-slate-800 py-6 mb-12 flex items-center justify-between flex-wrap gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share this article</span>
              <ShareButton articleId={article.id} url={shareUrl} title={shareText} size="md" />
            </div>

            {/* Author Bio */}
            {author && (
              <Card className="mb-12">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {author.avatar_url ? (
                      <Image
                        src={author.avatar_url}
                        alt={author.display_name || "Author"}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
                        {author.display_name || "Anonymous"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Article Author</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </article>

          {/* Related Articles */}
          {finalRelated && finalRelated.length > 0 && (
            <RelatedArticles articles={finalRelated} currentSlug={slug} />
          )}
        </div>
      </main>

      {/* Comments */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8">
        <div className="max-w-3xl md:max-w-4xl mx-auto">
          <CommentsSection slug={slug} />
        </div>
      </section>

      <SiteFooter />
    </div>
    </>
  )
}
