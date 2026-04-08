import Image from "next/image"
import Link from "next/link"
import { Calendar, Eye, User, MessageCircle, Heart } from "lucide-react"
import { ShareButton } from "@/components/ShareButton"
import type { Article } from "@/lib/types"

function badgeClassesForCategory(input?: { name?: string; slug?: string } | null) {
  const key = (input?.slug || input?.name || "").toString().toLowerCase()
  if (key.includes("polit")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  if (key.includes("sport")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
  if (key.includes("tech") || key.includes("sci")) return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
  if (key.includes("entertain") || key.includes("culture")) return "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200"
  if (key.includes("business") || key.includes("market")) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
  return "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200"
}

interface ArticleCardProps {
  article: Article
  variant?: 'featured' | 'compact' | 'grid'
  showExcerpt?: boolean
  className?: string
}

export function ArticleCard({ 
  article, 
  variant = 'grid', 
  showExcerpt = true,
  className = ""
}: ArticleCardProps) {
  const category = article.category
  const author = article.author
  const authorName = (author as any)?.display_name ?? (author as any)?.full_name ?? (author as any)?.name
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/articles/${article.slug}`

  // Compact variant for side lists
  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className={`group flex gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all duration-200 h-full ${className}`}
      >
        {/* Fixed aspect ratio image container - 4:3 */}
        <div className="relative w-20 h-15 flex-shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-900">
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-contain object-center p-1"
              loading="lazy"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-xs">No img</span>
            </div>
          )}
        </div>

        {/* Content container */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div className="space-y-1 flex-1">
            {category && (
              <span className={`inline-block px-2 py-0.5 ${badgeClassesForCategory(category)} category-badge rounded w-fit`}>
                {category.name}
              </span>
            )}
            <h3 className="text-title leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h3>
          </div>

          {/* Metadata - always at bottom */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
            {author && (
              <span className="flex items-center gap-1 truncate max-w-[120px]">
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
            {article.published_at && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>{new Date(article.published_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false
                })}</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Featured variant for section headers
  if (variant === 'featured') {
    return (
      <article className={`group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 h-full flex flex-col ${className}`}>
        <Link href={`/articles/${article.slug}`} className="flex flex-col h-full">
          {/* 16:9 aspect ratio container - object-contain for full image visibility */}
          <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
            {article.featured_image ? (
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-contain object-center p-2"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span className="text-lg">No Image Available</span>
              </div>
            )}
          </div>

          {/* Card body - flex grow to push metadata to bottom */}
          <div className="p-5 flex flex-col flex-1">
            {category && (
              <span className={`inline-block px-3 py-1 ${badgeClassesForCategory(category)} category-badge rounded-full`}>
                {category.name}
              </span>
            )}
            <h3 className="text-subheadline leading-tight line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
              {article.title}
            </h3>
            {showExcerpt && article.excerpt && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            
            {/* Metadata section - mt-auto ensures it's always at bottom */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-auto">
              <div className="flex items-center gap-3">
                {author && (
                  <span className="flex items-center gap-1.5">
                    {author.avatar_url ? (
                      <Image
                        src={author.avatar_url}
                        alt={authorName || "Author"}
                        width={16}
                        height={16}
                        className="rounded-full flex-shrink-0"
                      />
                    ) : (
                      <User className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{authorName || "Anonymous"}</span>
                  </span>
                )}
                {article.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{new Date(article.published_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false
                    })}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <ShareButton url={shareUrl} title={article.title} size="sm" />
              </div>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // Default grid variant - completely layout stable
  return (
    <article className={`group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 h-full flex flex-col ${className}`}>
      <Link href={`/articles/${article.slug}`} className="flex flex-col h-full">
        {/* 16:9 aspect ratio container - object-cover for consistent image display */}
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover object-center"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Card body - flex grow to push metadata to bottom */}
        <div className="p-4 flex flex-col flex-1">
          {category && (
            <span className={`inline-block px-2 py-1 ${badgeClassesForCategory(category)} text-xs font-semibold rounded mb-2 w-fit tracking-wide uppercase`}>
              {category.name}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
            {article.title}
          </h3>
          {showExcerpt && article.excerpt && (
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          
          {/* Metadata section - mt-auto ensures it's always at bottom */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center gap-2">
              {author && (
                <span className="flex items-center gap-1">
                  {author.avatar_url ? (
                    <Image
                      src={author.avatar_url}
                      alt={authorName || "Author"}
                      width={14}
                      height={14}
                      className="rounded-full flex-shrink-0"
                    />
                  ) : (
                    <User className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="truncate max-w-20">{authorName || "Anonymous"}</span>
                </span>
              )}
              {article.published_at && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span>{new Date(article.published_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                  })}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ShareButton url={shareUrl} title={article.title} size="sm" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Grid container component for layout-stable article grids
export function ArticleGrid({ 
  children, 
  className = "",
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: { 
  children: React.ReactNode
  className?: string
  cols?: { mobile: number; tablet: number; desktop: number }
}) {
  const gridClasses = [
    `grid-cols-${cols.mobile}`,
    `md:grid-cols-${cols.tablet}`,
    `lg:grid-cols-${cols.desktop}`,
    'gap-4',
    'lg:gap-6',
    'auto-rows-fr' // Equal row heights
  ].join(' ')

  return (
    <div className={`grid ${gridClasses} ${className}`}>
      {children}
    </div>
  )
}
