import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Calendar } from "lucide-react"
import { categoryLabel, t, type Locale } from "@/lib/i18n"
import { cleanExcerpt, formatArticleDate } from "@/lib/content"

interface LatestNewsSectionProps {
  items: Array<any>
  locale: Locale
}

export default function LatestNewsSection({ items, locale }: LatestNewsSectionProps) {
  if (!items.length) return null

  const [lead, ...secondary] = items.slice(0, 5)

  return (
    <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">{t("latestNews", locale)}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {locale === "rw" ? "Amakuru agezweho" : "What just happened"}
            </h2>
          </div>
          <Link href={`/${locale}/articles`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            {t("allArticles", locale)} <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
          <article className="group grid gap-5 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <Link href={`/${locale}/articles/${lead.slug}`} className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
              {lead.featured_image ? (
                <Image src={lead.featured_image} alt={lead.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, 45vw" />
              ) : <div className="flex h-full items-center justify-center text-sm text-slate-500">{t("noArticles", locale)}</div>}
            </Link>
            <div className="flex flex-col justify-center">
              {lead.category && <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">{categoryLabel(lead.category, locale)}</span>}
              <h3 className="text-balance text-2xl font-bold leading-tight tracking-tight text-slate-950 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 sm:text-3xl">
                <Link href={`/${locale}/articles/${lead.slug}`}>{lead.title}</Link>
              </h3>
              {cleanExcerpt(lead.excerpt) && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{cleanExcerpt(lead.excerpt)}</p>}
              {lead.published_at && <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Calendar className="size-3.5" />{formatArticleDate(lead.published_at, locale)}</p>}
            </div>
          </article>

          <div className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800 lg:border-t-0">
            {secondary.map((article) => (
              <article key={article.id || article.slug} className="group grid grid-cols-[104px_minmax(0,1fr)] gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[128px_minmax(0,1fr)]">
                <Link href={`/${locale}/articles/${article.slug}`} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                  {article.featured_image ? <Image src={article.featured_image} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="128px" /> : <div className="h-full" />}
                </Link>
                <div className="min-w-0">
                  {article.category && <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">{categoryLabel(article.category, locale)}</span>}
                  <h3 className="mt-1 line-clamp-3 text-base font-bold leading-snug text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    <Link href={`/${locale}/articles/${article.slug}`}>{article.title}</Link>
                  </h3>
                  {article.published_at && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatArticleDate(article.published_at, locale)}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
