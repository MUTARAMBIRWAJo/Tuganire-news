import Image from "next/image"
import Link from "next/link"
import { Calendar, Eye, User, MessageCircle, Heart } from "lucide-react"
import { ShareButton } from "@/components/ShareButton"
import type { Article } from "@/lib/types"

function badgeClassesForCategory(input?: { name?: string; slug?: string } | null) {
  const key = (input?.slug || input?.name || "").toString().toLowerCase()
  // simple mapping; falls back to brand colors
  if (key.includes("polit")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  if (key.includes("sport")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
  if (key.includes("tech") || key.includes("sci")) return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
  if (key.includes("entertain") || key.includes("culture")) return "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200"
  if (key.includes("business") || key.includes("market")) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
  return "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200"
}

interface ArticleCardProps {
  article: Article
  compact?: boolean
  imageHeightClass?: string
  imageAspectClass?: string
}

export function ArticleCard({ article, compact = false, imageHeightClass, imageAspectClass }: ArticleCardProps) {
  const category = article.category
  const author = article.author
  const authorName = (author as any)?.display_name ?? (author as any)?.full_name ?? (author as any)?.name
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/articles/${article.slug}`

  if (compact) {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none motion-safe:hover-raise border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-brand-500/10 hover:border-brand-200 dark:hover:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20"
      >
        {article.featured_image && (
          <div
            className={
              "relative w-full overflow-hidden rounded-xl " +
              (imageAspectClass || "aspect-[4/3]") +
              (imageHeightClass ? ` ${imageHeightClass}` : "")
            }
          >
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="w-full h-full object-cover object-center rounded-lg"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
            />
          </div>
        )}
        <div className="p-3 flex-1 flex flex-col">
          {category && (
            <span className={`inline-block px-2 py-1 ${badgeClassesForCategory(category)} text-xs font-semibold rounded mb-2 w-fit tracking-wide uppercase`}>
              {category.name}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-sm sm:text-base leading-snug tracking-tight">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-1 mb-2">{article.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center gap-3">
              {author && (
                <span className="flex items-center gap-1">
                  {author.avatar_url ? (
                    <Image
                      src={author.avatar_url}
                      alt={authorName || "Author"}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="truncate">{authorName || "Anonymous"}</span>
                </span>
              )}
              <span className="flex items-center gap-1 tabular-nums">
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                {Number.isFinite(Number((article as any).comments_count ?? (article as any).comment_count)) ? ((article as any).comments_count ?? (article as any).comment_count) : 0}
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                {Number.isFinite(Number((article as any).likes_count)) ? (article as any).likes_count : 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                {article.published_at ? new Date(article.published_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
              <ShareButton url={shareUrl} title={article.title} size="sm" />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <article className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none motion-safe:hover-raise border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-brand-500/10 hover:border-brand-200 dark:hover:border-brand-700 focus-visible:outline-none">
      <Link href={`/articles/${article.slug}`}>
        {article.featured_image && (
          <div className="relative w-full overflow-hidden rounded-xl aspect-[4/3] md:aspect-video">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              loading="lazy"
              className="w-full h-full object-cover object-center rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-6 sm:p-7">
          {category && (
            <span className={`inline-block px-3 py-1 ${badgeClassesForCategory(category)} text-sm font-semibold rounded-full mb-3 tracking-wide uppercase`}>
              {category.name}
            </span>
          )}
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 md:line-clamp-3 lg:line-clamp-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight tracking-tight">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-base text-gray-700 dark:text-gray-300 mb-5 line-clamp-3 md:line-clamp-4 lg:line-clamp-5">{article.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-sm sm:text-[15px] text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              {author && (
                <span className="flex items-center gap-2">
                  {author.avatar_url ? (
                    <Image
                      src={author.avatar_url}
                      alt={authorName || "Author"}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  {authorName || "Anonymous"}
                </span>
              )}
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  {new Date(article.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Views removed for public cards */}
              <span className="flex items-center gap-1 tabular-nums font-medium">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                {Number.isFinite(Number((article as any).comments_count ?? (article as any).comment_count)) ? ((article as any).comments_count ?? (article as any).comment_count) : 0}
              </span>
              <span className="flex items-center gap-1 tabular-nums font-medium">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {Number.isFinite(Number((article as any).likes_count)) ? (article as any).likes_count : 0}
              </span>
              <ShareButton url={shareUrl} title={article.title} size="sm" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

