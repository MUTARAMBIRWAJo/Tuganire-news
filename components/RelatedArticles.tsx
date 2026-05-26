import { ArticleCard } from "./article-card"
import { Link2 } from "lucide-react"
import Link from "next/link"

interface RelatedArticle {
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
}

interface RelatedArticlesProps {
  articles: RelatedArticle[]
  currentSlug?: string
}

export default function RelatedArticles({ articles, currentSlug }: RelatedArticlesProps) {
  // Filter out current article if provided
  const filteredArticles = currentSlug 
    ? articles.filter(article => article.slug !== currentSlug)
    : articles

  if (!filteredArticles || filteredArticles.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 border-t border-slate-200 dark:border-slate-700 mt-12">
      <div className="mb-6 flex items-center gap-3">
        <Link2 className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-bold">Related Articles</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.slice(0, 6).map((article) => (
          <ArticleCard
            key={article.id}
            article={{
              id: article.id,
              slug: article.slug,
              title: article.title,
              excerpt: article.excerpt,
              featured_image: article.featured_image,
              published_at: article.published_at,
              views_count: article.views_count ?? 0,
              comments_count: article.comments_count ?? 0,
              category: (article.category as any) || undefined,
              author: (article.author as any) || undefined,
            } as any}
            compact
          />
        ))}
      </div>
    </section>
  )
}

