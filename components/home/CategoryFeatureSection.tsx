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
  locale?: Locale
}

export default function CategoryFeatureSection({ title, categorySlug, articles, locale = "en" }: CategoryFeatureSectionProps) {
  if (!articles?.length) return null

  const [featured, ...secondary] = articles.slice(0, 5)

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">{t("category", locale)}</div>
          <h2 className="mt-1 text-[1.65rem] font-bold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-[1.9rem]">{categoryLabel({ name: title, slug: categorySlug }, locale)}</h2>
        </div>
        <Link href={categoryHref(categorySlug)} className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          {t("readMore", locale)}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)]">
        <div>
          <ArticleCard article={featured} locale={locale} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {secondary.map((article) => (
            <ArticleCard key={article.slug || article.id} article={article} compact locale={locale} imageHeightClass="h-[150px]" imageAspectClass="aspect-[4/3]" />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
