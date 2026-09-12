import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Calendar } from "lucide-react"
import { categoryHref } from "@/lib/category-utils"
import { categoryLabel, t, type Locale } from "@/lib/i18n"
import { formatArticleDate } from "@/lib/content"

type TrendingItem = {
  id: string
  slug: string
  title: string
  featured_image: string | null
  category_slug: string
  category_name: string
  views_count?: number | null
  published_at?: string | null
}

export default function TrendingRail({ items, locale = "en" }: { items: TrendingItem[]; locale?: Locale }) {
  if (!items?.length) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">{t("trending", locale)}</div>
          <h2 className="mt-1 text-[1.6rem] font-bold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-[1.8rem]">
            {locale === "rw" ? "Ibyo abasomyi bakurikira ubu" : "What readers are following right now"}
          </h2>
        </div>
        <Link href={`/${locale}/articles?sort=views_desc`} className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 sm:inline-flex">
          {t("allArticles", locale)} <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-x-8 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5">
        {items.slice(0, 5).map((item, index) => (
          <article key={item.id} className="group flex gap-3 py-4 first:pt-5 sm:px-1 lg:block lg:py-5 lg:first:pt-5">
            <div className="flex size-10 shrink-0 items-start justify-center text-3xl font-black leading-none text-slate-200 dark:text-slate-700 lg:mb-3">{String(index + 1).padStart(2, "0")}</div>
            <div className="min-w-0 flex-1">
              {item.featured_image && <Link href={`/${locale}/articles/${item.slug}`} className="relative mb-3 block aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900"><Image src={item.featured_image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="(max-width: 1024px) 128px, 18vw" /></Link>}
              <Link href={categoryHref(item.category_slug, locale)} className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">{categoryLabel({ name: item.category_name, slug: item.category_slug }, locale)}</Link>
              <h3 className="mt-1 line-clamp-3 text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400"><Link href={`/${locale}/articles/${item.slug}`}>{item.title}</Link></h3>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {item.published_at && <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{formatArticleDate(item.published_at, locale)}</span>}
                {Number(item.views_count) > 0 && <span>{item.views_count} views</span>}
              </div>
            </div>
          </article>
        ))}
      </div>

      <Link href={`/${locale}/articles?sort=views_desc`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 sm:hidden">
        {t("allArticles", locale)} <ArrowUpRight className="size-4" />
      </Link>
    </section>
  )
}
