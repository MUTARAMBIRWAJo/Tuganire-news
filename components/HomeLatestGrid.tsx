"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, MessageCircle, ArrowRight } from "lucide-react"
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton"

type Article = any

export default function HomeLatestGrid({ title = "Latest News" }: { title?: string }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Article[]>([])

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      try {
        const r = await fetch(`/api/public/articles?page=0&pageSize=8`, { signal: controller.signal })
        if (!r.ok) throw new Error(`Failed to load latest articles: ${r.status}`)
        const json = await r.json()
        if (!controller.signal.aborted) setItems(json.items || [])
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('[HomeLatestGrid] fetch error:', err)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    run()
    return () => controller.abort()
  }, [])

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Link 
          href="/articles" 
          className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {loading ? (
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ArticleCardSkeleton key={i} compact />)}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((article: any, index: number) => {
            const img = article?.featured_image || article?.image_url || article?.cover_image || article?.image || null
            const author = Array.isArray(article.author) ? article.author[0] : article.author
            const category = Array.isArray(article.category) ? article.category[0] : article.category
            
            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group flex gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
              >
                {img && (
                  <div className="relative flex-shrink-0 w-32 overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]">
                    <Image
                      src={img}
                      alt={article.title}
                      fill
                      className="w-full h-full object-cover object-center rounded-lg transition-transform duration-300"
                      loading="lazy"
                      sizes="128px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {category && (
                      <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        {category.name}
                      </span>
                    )}
                    {article.published_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(article.published_at)}
                      </span>
                    )}
                    {/* Views removed for public */}
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {article.comments_count ?? 0}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
