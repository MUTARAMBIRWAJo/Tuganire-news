"use client"
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ArticleCard } from '@/components/article-card'
import ArticleCardSkeleton from '@/components/ArticleCardSkeleton'
import { usePathname } from 'next/navigation'
import { categoryLabel, getLocaleFromPath, t } from '@/lib/i18n'

type CatRes = { categories: Array<{ id: string; name: string; slug: string; articles: any[] }> }

export default function CategoriesPage() {
  const [data, setData] = useState<CatRes | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)
  const locale = getLocaleFromPath(usePathname())

  useEffect(() => {
    async function run() {
      try {
        // Use localhost for development, fallback to env var for production
        const base = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
        const res = await fetch(`${base}/api/public/categories?lang=${locale}`)
        if (res.ok && isMountedRef.current) {
          const json = (await res.json()) as CatRes
          setData(json)
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Error fetching categories:', error)
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }
    
    run()
    
    return () => {
      isMountedRef.current = false
    }
  }, [locale])

  const categories = data?.categories || []

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8">
          <h1 className="text-headline leading-tight mb-6">{t("categories", locale)}</h1>

          <div className="space-y-12">
            {loading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <section key={i}>
                    <div className="flex items-baseline justify-between mb-4">
                      <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <ArticleCardSkeleton key={j} compact />
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}

            {!loading && categories.map((cat) => (
              <section key={cat.id}>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-subheadline leading-tight">{categoryLabel(cat, locale)}</h2>
                  <Link href={`/${locale}/category/${cat.slug}`} className="text-sm text-brand-600 hover:underline">{t("readMore", locale)}</Link>
                </div>
                {cat.articles.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-4">
                    {cat.articles.slice(0, 4).map((article: any) => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        variant="compact"
                        locale={locale}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-slate-200 dark:border-slate-800 p-6 text-slate-600 dark:text-slate-300">
                    {t("noArticles", locale)}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
