import Link from "next/link"
import { ArrowUpRight, TrendingUp } from "lucide-react"
import { categoryHref } from "@/lib/category-utils"
import { categoryLabel, t, type Locale } from "@/lib/i18n"
import { formatArticleDate } from "@/lib/content"

interface MostPopularSectionProps {
  items: Array<any>
  period?: "day" | "week" | "month"
  locale?: Locale
}

export default function MostPopularSection({ items, period = "week", locale = "en" }: MostPopularSectionProps) {
  if (!items?.length) return null

  const periodLabel = {
    day: locale === "rw" ? "Uyu munsi" : "Today",
    week: locale === "rw" ? "Muri iki cyumweru" : "This week",
    month: locale === "rw" ? "Muri uku kwezi" : "This month",
  }[period]

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-900/40 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400"><TrendingUp className="size-4" />{t("popular", locale)}</div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{t("whatReadersAreReading", locale)}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{periodLabel}</p>
          </div>
          <Link href={`/${locale}/articles?sort=views_desc`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">{t("allArticles", locale)} <ArrowUpRight className="size-4" /></Link>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {items.slice(0, 6).map((article, index) => (
            <article key={article.id || article.slug} className="grid gap-3 py-4 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-center">
              <div className="text-2xl font-black tabular-nums text-slate-300 dark:text-slate-700">{String(index + 1).padStart(2, "0")}</div>
              <div className="min-w-0">
                {article.category && <Link href={categoryHref(article.category.slug, locale)} className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">{categoryLabel(article.category, locale)}</Link>}
                <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400 sm:text-lg"><Link href={`/${locale}/articles/${article.slug}`}>{article.title}</Link></h3>
                {article.published_at && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatArticleDate(article.published_at, locale)}</p>}
              </div>
              {Number(article.views_count) > 0 && <div className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">{article.views_count} views</div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
