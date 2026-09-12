import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Eye, MessageCircle, Clock3 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArticleCard } from "@/components/article-card"
import type { Metadata } from "next"
import Prose from "@/components/Prose"
import CommentsSection from "@/components/comments-section"
import RelatedArticles from "@/components/RelatedArticles"
import { ShareButton } from "@/components/ShareButton"
import { LikeButton } from "@/components/LikeButton"
import AdsKeeperMarqueeRow from "@/components/ads/AdsKeeperMarqueeRow"
import ArticleProgressBar from "@/components/articles/ArticleProgressBar"
import ArticleShareRail from "@/components/articles/ArticleShareRail"
import ArticleAdsenseSlot from "@/components/ads/ArticleAdsenseSlot"
import ArticleBreadcrumbs from "@/components/article-breadcrumbs"
import ArticleTableOfContents from "@/components/article-table-of-contents"
import ErrorBoundary from '@/components/errors/ErrorBoundary'
import AuthorProfileCard from "@/components/articles/AuthorProfileCard"
import { formatReadingTime, wordCount as getWordCount } from "@/lib/readingTime"
import { enableGoogleAdsenseArticleSlot } from "@/lib/feature-flags"
import { getSponsoredLabel, getFactCheckLabel, socialLinksFromAuthor } from "@/lib/editorialTrust"
import { t } from "@/lib/i18n"
import { getArticleBySlug, normalizeLanguage } from "@/lib/articleQueries"
import { GET as getPublicArticle } from "@/app/api/public/articles/[slug]/route"

export const revalidate = 300 // Revalidate every 5 minutes

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tuganire.site").replace(/\/+$/, "")

type HeadingLevel = 2 | 3 | 4

interface ArticleHeading {
  id: string
  text: string
  level: HeadingLevel
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim()
}

function slugifyHeading(value: string) {
  return stripHtml(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section"
}

function buildArticleHeadings(html: string): ArticleHeading[] {
  const matches = Array.from(html.matchAll(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi))
  const seen = new Map<string, number>()

  return matches.map((match) => {
    const level = Number(match[1]) as HeadingLevel
    const text = stripHtml(match[3])
    const baseId = slugifyHeading(text)
    const currentCount = seen.get(baseId) ?? 0
    seen.set(baseId, currentCount + 1)

    return {
      level,
      text,
      id: currentCount === 0 ? baseId : `${baseId}-${currentCount + 1}`,
    }
  })
}

function injectHeadingIds(html: string) {
  const seen = new Map<string, number>()

  return html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level: string, attrs: string, inner: string) => {
    if (/\sid\s*=/.test(attrs)) return full

    const text = stripHtml(inner)
    const baseId = slugifyHeading(text)
    const currentCount = seen.get(baseId) ?? 0
    seen.set(baseId, currentCount + 1)
    const id = currentCount === 0 ? baseId : `${baseId}-${currentCount + 1}`

    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`
  })
}

type ArticleContentBlock =
  | { type: "html"; key: string; html: string }
  | { type: "slot"; key: string }

function buildArticleContentBlocks(html: string, insertAfterParagraph: number): ArticleContentBlock[] {
  const paragraphMatches = Array.from(html.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi))

  if (insertAfterParagraph < 2 || paragraphMatches.length < 2) {
    return [{ type: "html", key: "article-content", html }]
  }

  const targetParagraph = paragraphMatches.length >= 3 ? Math.min(3, insertAfterParagraph) : 2
  let lastIndex = 0
  let paragraphCount = 0
  let buffer = ""
  let slotInserted = false
  const blocks: ArticleContentBlock[] = []

  for (const match of paragraphMatches) {
    const matchIndex = match.index ?? 0
    buffer += html.slice(lastIndex, matchIndex) + match[0]
    lastIndex = matchIndex + match[0].length
    paragraphCount += 1

    if (!slotInserted && paragraphCount === targetParagraph) {
      blocks.push({ type: "html", key: `article-content-${blocks.length}`, html: buffer })
      blocks.push({ type: "slot", key: "article-adsense-slot" })
      buffer = ""
      slotInserted = true
    }
  }

  buffer += html.slice(lastIndex)
  if (buffer.trim()) {
    blocks.push({ type: "html", key: `article-content-${blocks.length}`, html: buffer })
  }

  return blocks.length > 0 ? blocks : [{ type: "html", key: "article-content", html }]
}

interface ArticlePageProps {
  params: Promise<{ slug: string; lang?: string }>
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
  const { slug, lang } = await params
  const language = normalizeLanguage(lang)
  const canonicalUrl = `${siteUrl}/${language}/articles/${slug}`
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      title: "Article Not Found",
    }
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { data: article } = await getArticleBySlug(sb, slug, language)
  if (!article) {
    return { title: "Article Not Found" }
  }

  const alternateLanguages: Record<string, string> = {}
  if (article?.story_group_id) {
    const { data: translations } = await sb
      .from("articles")
      .select("slug, language")
      .eq("story_group_id", article.story_group_id)
      .eq("status", "published")
    for (const translation of translations || []) {
      if (translation.language === "en" || translation.language === "rw") {
        alternateLanguages[translation.language] = `${siteUrl}/${translation.language}/articles/${translation.slug}`
      }
    }
  }

  const author = Array.isArray(article.author) ? article.author[0] : article.author
  const category = Array.isArray(article.category) ? article.category[0] : article.category

  const isVideo = (article as any)?.article_type === 'video' && !!(article as any)?.youtube_link
  return {
    title: (article as any)?.seo_title || article.title,
    description: article.excerpt || undefined,
    alternates: {
      canonical: `/${language}/articles/${slug}`,
      languages: alternateLanguages,
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
  const { slug, lang } = await params
  const language = lang === 'rw' ? 'rw' : 'en'
  const ui = language as "en" | "rw"
  const articleAds = [
    { widgetId: "1992246", adHeightPx: 300 },
    { widgetId: "1992253", adHeightPx: 300 },
    { widgetId: "1992830", adHeightPx: 300 },
    { widgetId: "1998800", adHeightPx: 300 },
  ]

  const res = await getPublicArticle(
    new Request(`http://internal/api/public/articles/${encodeURIComponent(slug)}?lang=${language}`),
    { params: Promise.resolve({ slug }) },
  )
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

  const sponsoredLabel = getSponsoredLabel(article)
  const factCheckLabel = getFactCheckLabel(article)
  const authorSameAs = socialLinksFromAuthor(author).map((s: any) => s.href)

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
  const canonicalUrl = `${siteUrl}/${language}/articles/${slug}`
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
        inLanguage: language,
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
        inLanguage: language,
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
  const articleContentHtml = injectHeadingIds(String(article.content || ""))
  const articleTocHeadings = buildArticleHeadings(articleContentHtml)
  const articleContentBlocks = enableGoogleAdsenseArticleSlot
    ? buildArticleContentBlocks(articleContentHtml, 3)
    : [{ type: "html" as const, key: "article-content", html: articleContentHtml }]

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
      <ArticleProgressBar />
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <article className="min-w-0">
            <ArticleBreadcrumbs
              categoryName={category?.name}
              categorySlug={category?.slug}
              articleTitle={article.title}
              locale={ui}
            />

            <header className="mb-10 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80 sm:p-7">
              {category && (
                <Link
                  href={`/${language}/category/${category.slug}`}
                  className="mb-4 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                >
                  {category.name}
                </Link>
              )}
              <h1 className="max-w-[15ch] text-balance text-[clamp(1rem,2.1vw,2.3rem)] font-black leading-[1.04] tracking-[-0.04em] text-slate-950 dark:text-white sm:leading-[1.08] lg:max-w-[18ch]">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:mt-5 sm:text-lg sm:leading-8">{article.excerpt}</p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2.5 text-[11px] text-slate-500 dark:text-slate-400 sm:gap-x-4 sm:text-sm">
                {author && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                    {author.avatar_url ? (
                      <Image src={author.avatar_url} alt={author.display_name || "Author"} width={20} height={20} className="rounded-full" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    {author.display_name || t("author", ui)}
                  </span>
                )}
                {article.published_at && (
                  <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                )}
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{readingTimeLabel}</span>
                <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" />{(article as any).comments_count || 0} {t("comments", ui)}</span>
                <span className="inline-flex items-center gap-2"><LikeButton slug={slug} initialCount={(article as any).likes_count || 0} /></span>
              </div>

              {isVideo && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a href="#player" className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 dark:bg-brand-500 dark:text-slate-950 dark:hover:bg-brand-400">{t("readArticle", ui)}</a>
                  {(article as any)?.youtube_link && (
                    <a href={String((article as any).youtube_link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Watch on YouTube</a>
                  )}
                </div>
              )}
            </header>

            {isVideo ? (
              <div id="player" className="mb-8 overflow-hidden rounded-[24px] border border-slate-200 bg-black shadow-[0_18px_40px_-28px_rgba(15,23,42,0.8)] dark:border-slate-700">
                <div className="aspect-video w-full">
                  <iframe className="h-full w-full" src={toEmbedUrl(String((article as any).youtube_link))} title={article.title} frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
              </div>
            ) : article.featured_image && (
              <div className="mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-2 shadow-[0_18px_38px_-32px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 sm:p-3">
                <div className="relative overflow-hidden rounded-[20px]">
                  <Image src={article.featured_image} alt={article.title} width={1200} height={800} loading="lazy" className="h-auto w-full object-cover" sizes="(max-width: 640px) calc(100vw - 20px), (max-width: 1024px) calc(100vw - 52px), 880px" />
                </div>
              </div>
            )}

            {article.content && (
              <>
                <div className="mb-8 lg:hidden">
                  <ArticleShareRail url={shareUrl} title={shareText} slug={slug} />
                </div>

                <ErrorBoundary>
                  <div className="mt-8 lg:mt-10">
                    <ArticleTableOfContents headings={articleTocHeadings} />
                  </div>
                </ErrorBoundary>

                <Prose className="prose prose-slate prose-lg mx-auto mb-12 max-w-3xl prose-img:rounded-2xl prose-a:text-brand-700 prose-a:no-underline hover:prose-a:underline dark:prose-invert dark:prose-a:text-brand-400 md:mb-14">
                  {articleContentBlocks.map((block) =>
                    block.type === "slot" ? (
                      <ArticleAdsenseSlot key={block.key} />
                    ) : (
                      <div key={block.key} className="prose-content" dangerouslySetInnerHTML={{ __html: block.html }} />
                    ),
                  )}
                </Prose>
              </>
            )}

            {finalRelated && finalRelated.length > 0 && (
              <section className="mb-12 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">{t("newsroom", ui)}</div>
                    <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{t("relatedArticles", ui)}</h2>
                  </div>
                </div>
                <ErrorBoundary>
                  <RelatedArticles articles={finalRelated} currentSlug={slug} locale={ui} />
                </ErrorBoundary>
              </section>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-8 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("tags", ui)}:</span>
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
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("share", ui)} {t("articles", ui).toLowerCase()}</span>
              <ShareButton articleId={article.id} url={shareUrl} title={shareText} size="md" />
            </div>

            {/* Author Bio */}
            {author && (
              <Card className="mb-12 border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-6 sm:p-8">
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
                        {author.display_name || t("author", ui)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("author", ui)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <ErrorBoundary>
              <ArticleShareRail url={shareUrl} title={shareText} slug={slug} />
            </ErrorBoundary>

            <ErrorBoundary>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">Advertising</div>
                <AdsKeeperMarqueeRow ads={articleAds} className="mb-0" intervalMs={10000} />
              </div>
            </ErrorBoundary>
          </aside>
          </div>
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
