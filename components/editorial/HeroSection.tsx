import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight } from 'lucide-react'
import FeaturedSideList from './FeaturedSideList'

interface HeroSectionProps {
  item?: {
    slug: string
    title: string
    excerpt: string | null
    featured_image: string | null
    published_at: string | null
    views_count?: number | null
    categories?: { name: string; slug: string } | null
    authors?: { display_name: string | null; avatar_url: string | null } | null
  } | null
  sideStories?: Array<{
    slug: string
    title: string
    featured_image: string | null
    published_at: string | null
    views_count?: number | null
    categories?: { name: string; slug: string } | null
  }>
}

export default function HeroSection({ item, sideStories = [] }: HeroSectionProps) {
  if (!item) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Large Hero - 65% width (3/5 columns) */}
        <div className="lg:col-span-3">
          <article className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            
            {/* Hero Image - 16:9 aspect ratio */}
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900">
              {item.featured_image ? (
                <Image
                  src={item.featured_image}
                  alt={item.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="(max-width: 768px) 100vw, 65vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <span className="text-lg">No Image Available</span>
                </div>
              )}
              
              {/* Category Badge Overlay */}
              {item.categories?.name && (
                <Link
                  href={`/category/${item.categories.slug}`}
                  className="absolute top-4 left-4 px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full text-sm font-semibold text-slate-900 dark:text-white hover:bg-white transition-colors"
                >
                  {item.categories.name}
                </Link>
              )}
            </div>

            {/* Hero Content */}
            <div className="p-6 lg:p-8">
              <div className="space-y-4">
                {/* Title - 3 lines max */}
                <h1 className="text-headline leading-tight line-clamp-3 tracking-editorial">
                  <Link
                    href={`/articles/${item.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.title}
                  </Link>
                </h1>

                {/* Description - 2 lines max */}
                {item.excerpt && (
                  <p className="text-lg text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {item.authors?.display_name && (
                    <div className="flex items-center gap-2">
                      {item.authors.avatar_url ? (
                        <Image
                          src={item.authors.avatar_url}
                          alt={item.authors.display_name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span>{item.authors.display_name}</span>
                    </div>
                  )}

                  {item.published_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                  )}


                </div>

                {/* Read More CTA */}
                <Link
                  href={`/articles/${item.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors group-hover:shadow-lg"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        </div>

        {/* Side Stories - 35% width (2/5 columns) */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <FeaturedSideList items={sideStories} />
          </div>
        </div>
      </div>
    </section>
  )
}
