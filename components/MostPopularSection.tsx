import { ArticleCard } from "./article-card"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

interface MostPopularSectionProps {
  items: Array<{
    id: string
    slug: string
    title: string
    excerpt: string | null
    featured_image: string | null
    published_at: string | null
    views_count?: number | null
    comments_count?: number | null
    category?: { name: string; slug: string } | null
    author?: { display_name: string | null; avatar_url: string | null } | null
  }>
  period?: "day" | "week" | "month"
}

export default function MostPopularSection({ items, period = "week" }: MostPopularSectionProps) {
  if (!items || items.length === 0) return null

  const periodLabels = {
    day: "Today",
    week: "This Week",
    month: "This Month"
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-orange-200 dark:border-slate-700 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Most Popular</h2>
            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">{periodLabels[period]}</p>
          </div>
        </div>
        <Link 
          href="/articles?sort=views_desc" 
          className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
        >
          View All
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article, index) => {
          const rank = index + 1
          const rankColors = [
            "bg-gradient-to-br from-yellow-400 to-orange-500", // #1
            "bg-gradient-to-br from-gray-300 to-gray-400",     // #2
            "bg-gradient-to-br from-amber-600 to-amber-700",   // #3
          ]
          
          return (
            <div key={article.id} className="relative group">
              {/* Ranking badge */}
              <div className={`absolute -top-3 -left-3 z-20 ${rank <= 3 ? rankColors[rank - 1] : "bg-gray-500"} text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg`}>
                {rank}
              </div>
              
              {/* Popular indicator */}
              {rank === 1 && (
                <div className="absolute top-2 right-2 z-20 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  🔥 Hot
                </div>
              )}
              
              <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-orange-100 dark:border-slate-700">
                <ArticleCard
                  article={{
                    id: article.id,
                    slug: article.slug,
                    title: article.title,
                    excerpt: article.excerpt,
                    featured_image: article.featured_image,
                    published_at: article.published_at,
                    comments_count: article.comments_count ?? 0,
                    category: (article.category as any) || undefined,
                    author: (article.author as any) || undefined,
                  } as any}
                  compact
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

