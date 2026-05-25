"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { ArticleCard } from "@/components/article-card"

interface CategoryFeatureSectionProps {
  title: string
  categorySlug: string
  articles: Array<any>
}

export default function CategoryFeatureSection({ title, categorySlug, articles }: CategoryFeatureSectionProps) {
  if (!articles?.length) return null

  const [featured, ...secondary] = articles.slice(0, 5)

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">Category</div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{title}</h2>
        </div>
        <Link href={`/category/${categorySlug}`} className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          More
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)]">
        <div>
          <ArticleCard article={featured} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {secondary.map((article) => (
            <ArticleCard key={article.slug || article.id} article={article} compact imageHeightClass="h-[150px]" imageAspectClass="aspect-[4/3]" />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
