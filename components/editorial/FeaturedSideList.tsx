import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'

interface FeaturedSideListProps {
  items?: Array<{
    slug: string
    title: string
    featured_image: string | null
    published_at: string | null
    views_count?: number | null
    categories?: { name: string; slug: string } | null
  }>
}

export default function FeaturedSideList({ items = [] }: FeaturedSideListProps) {
  if (!items.length) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <article
          key={item.slug}
          className="group bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          <Link href={`/articles/${item.slug}`} className="flex gap-4 p-4">
            {/* Image - 4:3 aspect ratio, fixed height */}
            <div className="relative w-24 h-18 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-900">
              {item.featured_image ? (
                <Image
                  src={item.featured_image}
                  alt={item.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <span className="text-xs">No img</span>
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="space-y-2">
                {/* Category */}
                {item.categories?.name && (
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {item.categories.name}
                  </span>
                )}

                {/* Title - 2 lines max */}
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                {item.published_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.published_at)}</span>
                  </div>
                )}

              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}
