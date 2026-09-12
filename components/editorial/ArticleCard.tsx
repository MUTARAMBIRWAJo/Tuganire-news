import type React from "react"
import type { Article } from "@/lib/types"
import type { Locale } from "@/lib/i18n"
import { ArticleCard as SharedArticleCard } from "@/components/article-card"

type EditorialVariant = "featured" | "compact" | "grid"

interface ArticleCardProps {
  article: Article
  variant?: EditorialVariant
  showExcerpt?: boolean
  className?: string
  locale?: Locale
}

export function ArticleCard({ article, variant = "grid", locale }: ArticleCardProps) {
  return (
    <SharedArticleCard
      article={article}
      variant={variant === "grid" ? "standard" : variant}
      locale={locale}
    />
  )
}

export function ArticleGrid({
  children,
  className = "",
  cols = { mobile: 1, tablet: 2, desktop: 3 },
}: {
  children: React.ReactNode
  className?: string
  cols?: { mobile: number; tablet: number; desktop: number }
}) {
  const gridClasses = [
    `grid-cols-${cols.mobile}`,
    `md:grid-cols-${cols.tablet}`,
    `lg:grid-cols-${cols.desktop}`,
    "gap-4",
    "lg:gap-6",
  ].join(" ")

  return <div className={`grid ${gridClasses} ${className}`}>{children}</div>
}
