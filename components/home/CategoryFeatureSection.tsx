"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { ArticleCard } from "@/components/article-card"
import { categoryHref } from "@/lib/category-utils"
import { categoryLabel, t, type Locale } from "@/lib/i18n"

interface CategoryFeatureSectionProps {
  title: string
  categorySlug: string
  articles: Array<any>
  variant?: "lead" | "grid" | "split" | "list"
  locale?: Locale
}

export default function CategoryFeatureSection({ title, categorySlug, articles, variant = "lead", locale = "en" }: CategoryFeatureSectionProps) {
  if (!articles?.length) return null

  const [featured, ...secondary] = articles.slice(0, variant === "grid" ? 3 : variant === "list" ? 4 : 3)
  const isSports = /sport|football|amavubi/i.test(`${title} ${categorySlug}`)

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`${isSports ? "border-[#00A651]/30 bg-[linear-gradient(135deg,rgba(0,166,81,0.06),transparent_48%),white] dark:bg-[linear-gradient(135deg,rgba(0,166,81,0.12),transparent_48%),#020617]" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"} border-y py-8 sm:py-10`}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] ${isSports ? "text-[#008a45] dark:text-[#46d58b]" : "text-brand-600 dark:text-brand-400"}`}><span className={`size-1.5 rounded-full ${isSports ? "bg-[#FAD201]" : "bg-current"}`} />{isSports ? t("matchdayDesk", locale) : t("category", locale)}</div>
          <h2 className="mt-1 text-[1.65rem] font-bold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-[1.9rem]">{categoryLabel({ name: title, slug: categorySlug }, locale)}</h2>
          {isSports && <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">{t("sportsDescription", locale)}</p>}
        </div>
        <Link href={categoryHref(categorySlug, locale)} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          {t("readMore", locale)}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {variant === "grid" ? (
        <div className="grid items-start gap-5 sm:grid-cols-3">
          {[featured, ...secondary].map((article) => <ArticleCard key={article.slug || article.id} article={article} variant="standard" locale={locale} />)}
        </div>
      ) : variant === "list" ? (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {[featured, ...secondary].map((article) => <ArticleCard key={article.slug || article.id} article={article} variant="horizontal" locale={locale} />)}
        </div>
      ) : (
        <div className={variant === "split" ? "grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]" : "grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)]"}>
          <ArticleCard article={featured} variant="featured" locale={locale} priority />
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {secondary.map((article) => <ArticleCard key={article.slug || article.id} article={article} variant="compact" locale={locale} imageAspectClass="aspect-[4/3]" />)}
          </div>
        </div>
      )}
    </motion.section>
  )
}
