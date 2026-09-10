import Image from "next/image"
import Link from "next/link"
import { Calendar, Eye, User, MessageCircle, Heart, ArrowUpRight } from "lucide-react"
import { ShareButton } from "@/components/ShareButton"
import type { Article } from "@/lib/types"
import { categoryLabel, t, type Locale } from "@/lib/i18n"

function badgeClassesForCategory(input?: { name?: string; slug?: string } | null) {
  const key = (input?.slug || input?.name || "").toString().toLowerCase()
  if (key.includes("polit")) return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
  if (key.includes("sport")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
  if (key.includes("tech") || key.includes("sci")) return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
  if (key.includes("entertain") || key.includes("culture")) return "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200"
  if (key.includes("business") || key.includes("market")) return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
  return "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200"
}

interface ArticleCardProps {
  article: Article
  compact?: boolean
  imageHeightClass?: string
  imageAspectClass?: string
  locale?: Locale
}

export function ArticleCard({ article, compact = false, imageHeightClass, imageAspectClass, locale }: ArticleCardProps) {
  const category = article.category
  const author = article.author
  const authorName = (author as any)?.display_name ?? (author as any)?.full_name ?? (author as any)?.name
  const language = article.language === "rw" ? "rw" : "en"
  const displayLocale = locale || language
  const articlePath = `/${language}/articles/${article.slug}`
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${articlePath}`

  const views = Number((article as any)?.views_count ?? 0)
  const comments = Number((article as any)?.comments_count ?? (article as any)?.comment_count ?? 0)
  const likes = Number((article as any)?.likes_count ?? 0)

  if (compact) {
    return (
      <Link
        href={articlePath}
        className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_14px_24px_-20px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_34px_-22px_rgba(37,99,235,0.28)] dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
      >
        {article.featured_image && (
          <div className={"relative overflow-hidden bg-slate-100 dark:bg-slate-800 " + (imageAspectClass || "aspect-[4/3]") + (imageHeightClass ? ` ${imageHeightClass}` : "")}>
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>
        )}
        <div className="flex flex-1 flex-col p-4 sm:p-4">
          {category && (
            <span className={`mb-2 inline-flex w-fit items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${badgeClassesForCategory(category)}`}>
              {categoryLabel(category, displayLocale)}
            </span>
          )}
          <h3 className="line-clamp-3 text-[1.02rem] font-bold leading-snug tracking-[-0.02em] text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 sm:text-[1.18rem]">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{article.excerpt}</p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <div className="flex min-w-0 items-center gap-2">
              {author && (
                <span className="flex items-center gap-1.5 truncate">
                  {author.avatar_url ? (
                    <Image src={author.avatar_url} alt={authorName || "Author"} width={16} height={16} className="rounded-full" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span className="truncate">{authorName || t("author", displayLocale)}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 tabular-nums"><Eye className="h-3.5 w-3.5" />{views}</span>
              <span className="inline-flex items-center gap-1 tabular-nums"><MessageCircle className="h-3.5 w-3.5" />{comments}</span>
            </div>
          </div>

          {article.published_at && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <ShareButton url={shareUrl} title={article.title} size="sm" />
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <article className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_32px_-26px_rgba(15,23,42,0.36)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_22px_42px_-28px_rgba(37,99,235,0.28)] dark:border-slate-700 dark:bg-slate-900">
      <Link href={articlePath} className="block">
        {article.featured_image && (
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {category && (
              <div className="absolute left-4 top-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeClassesForCategory(category)}`}>
                  {categoryLabel(category, displayLocale)}
                </span>
              </div>
            )}
          </div>
        )}
        <div className="p-5 sm:p-6">
          {article.excerpt && <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">Analysis</p>}
          <h3 className="text-[1.32rem] font-black leading-[1.12] tracking-[-0.03em] text-slate-950 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 sm:text-[1.58rem]">
            {article.title}
          </h3>
          {article.excerpt && <p className="mt-3 line-clamp-3 text-base leading-7 text-slate-600 dark:text-slate-300">{article.excerpt}</p>}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <div className="flex items-center gap-3">
              {author && (
                <span className="inline-flex items-center gap-2">
                  {author.avatar_url ? (
                    <Image src={author.avatar_url} alt={authorName || "Author"} width={20} height={20} className="rounded-full" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{authorName || "Anonymous"}</span>
                </span>
              )}
              {article.published_at && (
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 font-medium text-brand-600 dark:text-brand-400">
              Read story <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{views}</span>
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" />{comments}</span>
            <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" />{likes}</span>
            <ShareButton url={shareUrl} title={article.title} size="sm" />
          </div>
        </div>
      </Link>
    </article>
  )
}

