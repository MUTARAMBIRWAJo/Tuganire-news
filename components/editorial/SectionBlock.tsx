import Link from 'next/link'
import { ArticleCard, ArticleGrid } from './ArticleCard'
import { categoryHref } from '@/lib/category-utils'

interface SectionBlockProps {
  title: string
  categorySlug: string
  articles: any[]
  showReadMore?: boolean
  maxArticles?: number
}

export default function SectionBlock({ 
  title, 
  categorySlug, 
  articles, 
  showReadMore = true,
  maxArticles = 4 
}: SectionBlockProps) {
  if (!articles?.length) return null

  const displayArticles = articles.slice(0, maxArticles)

  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-subheadline leading-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        {showReadMore && (
          <Link 
            href={categoryHref(categorySlug)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Read more →
          </Link>
        )}
      </div>

      {/* Divider Line */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6"></div>

      {/* 4-column grid layout with equal heights */}
      <ArticleGrid 
        cols={{ mobile: 1, tablet: 2, desktop: 4 }}
        className="gap-6"
      >
        {displayArticles.map((article) => (
          <ArticleCard 
            key={article.slug || article.id} 
            article={article} 
            variant="grid"
            showExcerpt={true}
            className="h-full"
          />
        ))}
      </ArticleGrid>
    </section>
  )
}
