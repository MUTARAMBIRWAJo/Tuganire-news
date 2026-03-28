import { ArticleCard } from "./article-card"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

interface MostCommentedSectionProps {
  items: Array<{
    id: string
    slug: string
    title: string
    excerpt: string | null
    featured_image: string | null
    published_at: string | null
    comments_count?: number | null
    views_count?: number | null
    likes_count?: number | null
    category?: { name: string; slug: string } | null
    author?: { display_name: string | null; avatar_url: string | null } | null
  }>
}

export default function MostCommentedSection({ items }: MostCommentedSectionProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-sky-200 dark:border-slate-700 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500 rounded-lg">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Most Commented</h2>
            <p className="text-sm text-sky-700 dark:text-sky-300 font-medium">Stories driving the most discussion</p>
          </div>
        </div>
        <Link
          href="/articles?sort=comments_desc"
          className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium"
        >
          View All
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <div
            key={article.id}
            className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-sky-100 dark:border-slate-700"
          >
            <ArticleCard
              article={{
                id: article.id,
                slug: article.slug,
                title: article.title,
                excerpt: article.excerpt,
                featured_image: article.featured_image,
                published_at: article.published_at,
                likes_count: article.likes_count ?? 0,
                comments_count: article.comments_count ?? 0,
                category: (article as any).category || undefined,
                author: (article as any).author || undefined,
              } as any}
              compact
            />
          </div>
        ))}
      </div>
    </section>
  )
}
