import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Eye } from 'lucide-react'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  views_count: number | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  author: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
  comments_count: number
}

interface LatestArticlesSectionProps {
  items: Article[]
}

export default function LatestArticlesSection({ items }: LatestArticlesSectionProps) {
  if (!items || items.length === 0) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Latest Articles
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Stay updated with our newest stories and breaking news
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((article) => (
          <article
            key={article.id}
            className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image */}
            <div className="relative aspect-[3/2] overflow-hidden bg-slate-100 dark:bg-slate-900">
              {article.featured_image ? (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <span>No Image</span>
                </div>
              )}

              {/* Category Badge */}
              {article.category?.name && (
                <Link
                  href={`/category/${article.category.slug}`}
                  className="absolute top-3 left-3 px-2 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-900 dark:text-white hover:bg-white transition-colors"
                >
                  {article.category.name}
                </Link>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4">
              {/* Title */}
              <h3 className="text-lg font-bold line-clamp-2 mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Link href={`/articles/${article.slug}`}>
                  {article.title}
                </Link>
              </h3>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-col gap-3 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                <div className="flex flex-wrap items-center gap-3">
                  {article.author?.display_name && (
                    <span className="flex items-center gap-1">
                      {article.author.avatar_url ? (
                        <Image
                          src={article.author.avatar_url}
                          alt={article.author.display_name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span className="truncate">{article.author.display_name}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {article.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.published_at)}
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views_count ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Read More Link */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <Link
                href={`/articles/${article.slug}`}
                className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
