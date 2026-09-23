import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock3, Eye, MessageCircle, Heart } from "lucide-react"
import type { Article } from "@/lib/types"
import { categoryLabel, type Locale } from "@/lib/i18n"
import { cleanArticlePreview, formatArticleDate } from "@/lib/content"
import { formatReadingTime } from "@/lib/readingTime"

function badgeClassesForCategory(input?: { name?: string; slug?: string } | null) {
  const key = (input?.slug || input?.name || "").toString().toLowerCase()
  if (key.includes("polit")) return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
  if (key.includes("sport")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
  if (key.includes("tech") || key.includes("sci")) return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
  if (key.includes("entertain") || key.includes("culture")) return "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200"
  if (key.includes("business") || key.includes("market")) return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
  return "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200"
}

function categoryText(input: Article["category"] | string | null | undefined) {
  if (typeof input === "string") return input
  return input?.name || input?.slug || "News"
}

interface ArticleCardProps {
  article: Article
  variant?: "standard" | "featured" | "compact" | "horizontal" | "ranked"
  compact?: boolean
  imageHeightClass?: string
  imageAspectClass?: string
  priority?: boolean
  locale?: Locale
}

function EditorialImage({ article, aspectClass, sizes, priority = false }: { article: Article; aspectClass: string; sizes: string; priority?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${aspectClass}`}>
      {article.featured_image ? (
        <Image src={article.featured_image} alt={article.title || "Article image"} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading={priority ? "eager" : "lazy"} priority={priority} sizes={sizes} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,#e2e8f0,#f8fafc)] px-4 text-center text-slate-500 dark:bg-[linear-gradient(135deg,#1e293b,#0f172a)] dark:text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Tuganire News</span>
          <span className="text-xs">{categoryText(article.category as Article["category"] | string | null)}</span>
        </div>
      )}
    </div>
  )
}

export function ArticleCard({ article, variant, compact = false, imageHeightClass, imageAspectClass, priority = false, locale }: ArticleCardProps) {
  const category = article.category
  const author = article.author
  const authorName = (author as any)?.display_name ?? (author as any)?.full_name ?? (author as any)?.name
  const language = article.language === "rw" || article.language === "en" ? article.language : locale || "en"
  const displayLocale = locale || language
  const activeVariant = variant || (compact ? "compact" : "standard")
  const excerpt = cleanArticlePreview(article.excerpt || article.content, activeVariant === "featured" ? 180 : activeVariant === "standard" ? 130 : 90)
  const articlePath = `/${language}/articles/${article.slug}`
  const views = Number((article as any)?.views_count ?? 0)
  const comments = Number((article as any)?.comments_count ?? (article as any)?.comment_count ?? 0)
  const likes = Number((article as any)?.likes_count ?? 0)
  const isBreaking = Boolean((article as any)?.is_breaking)
  const isSponsored = Boolean((article as any)?.is_sponsored || (article as any)?.sponsored)

  if (activeVariant === "horizontal") {
    return (
      <article className="group grid gap-4 border-b border-slate-200 py-5 dark:border-slate-800 sm:grid-cols-[220px_minmax(0,1fr)]">
        <Link href={articlePath} className="relative block aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <EditorialImage article={article} aspectClass="h-full w-full" sizes="(max-width: 640px) 100vw, 220px" priority={priority} />
        </Link>
        <div className="min-w-0">
          {category && <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">{categoryLabel(category, displayLocale)}</span>}
          <h3 className="mt-1 line-clamp-3 text-lg font-bold leading-snug text-slate-950 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 sm:text-xl"><Link href={articlePath}>{article.title}</Link></h3>
          {excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{excerpt}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {authorName && <span>By {authorName}</span>}
            {article.published_at && <span>{formatArticleDate(article.published_at, displayLocale)}</span>}
            {article.content && <span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{formatReadingTime(article.content)}</span>}
          </div>
        </div>
      </article>
    )
  }

  if (activeVariant === "ranked") {
    return (
      <article className="group grid grid-cols-[42px_96px_minmax(0,1fr)] items-start gap-3 border-b border-slate-200 py-4 dark:border-slate-800">
        <div className="text-2xl font-black tabular-nums text-slate-300 dark:text-slate-700" aria-hidden="true">{String((article as any).rank || 1).padStart(2, "0")}</div>
        <Link href={articlePath} className="relative block aspect-[4/3] overflow-hidden rounded-md bg-slate-100 dark:bg-slate-900"><EditorialImage article={article} aspectClass="h-full w-full" sizes="96px" /></Link>
        <div className="min-w-0">
          {category && <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">{categoryLabel(category, displayLocale)}</span>}
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400"><Link href={articlePath}>{article.title}</Link></h3>
          {article.published_at && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatArticleDate(article.published_at, displayLocale)}</p>}
        </div>
      </article>
    )
  }

  if (activeVariant === "compact") {
    return (
      <Link
        href={articlePath}
        className="group flex self-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_24px_-20px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_34px_-22px_rgba(37,99,235,0.28)] dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
      >
        <EditorialImage article={article} aspectClass={(imageAspectClass || "aspect-[4/3]") + (imageHeightClass ? ` ${imageHeightClass}` : "")} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw" priority={priority} />
        <div className="flex flex-col p-4 sm:p-4">
          {category && (
            <span className={`mb-2 inline-flex w-fit items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${badgeClassesForCategory(category)}`}>
              {categoryLabel(category, displayLocale)}
            </span>
          )}
          <h3 className="line-clamp-3 text-[1.02rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 sm:text-[1.12rem]">
            {article.title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {authorName && <span className="truncate">{authorName}</span>}
            {article.published_at && <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" />{formatArticleDate(article.published_at, displayLocale)}</span>}
          </div>
        </div>
      </Link>
    )
  }

  const isFeatured = activeVariant === "featured"

  return (
    <article className="group self-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_32px_-26px_rgba(15,23,42,0.36)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_22px_42px_-28px_rgba(37,99,235,0.28)] dark:border-slate-700 dark:bg-slate-900">
      <Link href={articlePath} className="block">
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <EditorialImage article={article} aspectClass="h-full w-full" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={priority} />
            {category && (
              <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-sm ${badgeClassesForCategory(category)}`}>
                  {categoryLabel(category, displayLocale)}
                </span>
                {isBreaking && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm"><span className="size-1.5 animate-pulse rounded-full bg-white" />Live</span>}
              </div>
            )}
          </div>
        <div className={isFeatured ? "p-5 sm:p-7" : "p-4 sm:p-5"}>
          <h3 className={`${isFeatured ? "text-xl sm:text-2xl line-clamp-3" : "text-base sm:text-lg line-clamp-2"} font-bold leading-snug tracking-[-0.01em] text-slate-950 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400`}>
            {article.title}
          </h3>
          {excerpt && <p className={`${isFeatured ? "mt-3 text-base leading-7 line-clamp-3" : "mt-2 text-sm leading-6 line-clamp-2"} text-slate-600 dark:text-slate-300`}>{excerpt}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {authorName && <span>{authorName}</span>}
            {article.published_at && <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" />{formatArticleDate(article.published_at, displayLocale)}</span>}
            {article.content && isFeatured && <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{formatReadingTime(article.content)}</span>}
            {isSponsored && <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Sponsored</span>}
          </div>

          {isFeatured && (views > 0 || comments > 0 || likes > 0) && <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            {views > 0 && <span className="inline-flex items-center gap-1.5"><Eye className="size-3.5" />{views} views</span>}
            {comments > 0 && <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-3.5" />{comments} comments</span>}
            {likes > 0 && <span className="inline-flex items-center gap-1.5"><Heart className="size-3.5" />{likes} likes</span>}
          </div>}
        </div>
      </Link>
    </article>
  )
}

