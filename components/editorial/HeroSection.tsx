import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, User } from "lucide-react"

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

  const secondaryStories = sideStories.slice(0, 4)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
        <span className="h-2 w-2 rounded-full bg-brand-500" />
        Top story
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-32px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950">
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
            {item.featured_image ? (
              <Image
                src={item.featured_image}
                alt={item.title}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                priority
                sizes="(max-width: 1024px) 100vw, 62vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <span className="text-lg">No image available</span>
              </div>
            )}

            {item.categories?.name && (
              <Link
                href={`/category/${item.categories.slug}`}
                className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 backdrop-blur dark:bg-slate-950/95 dark:text-white"
              >
                {item.categories.name}
              </Link>
            )}
          </div>

          <div className="space-y-4 p-6 sm:p-8">
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              <Link href={`/articles/${item.slug}`} className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                {item.title}
              </Link>
            </h1>

            {item.excerpt && (
              <p className="max-w-3xl text-pretty text-lg leading-8 text-slate-600 dark:text-slate-300">{item.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              {item.authors?.display_name && (
                <div className="flex items-center gap-2">
                  {item.authors.avatar_url ? (
                    <Image
                      src={item.authors.avatar_url}
                      alt={item.authors.display_name}
                      width={24}
                      height={24}
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

            <Link
              href={`/articles/${item.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-brand-600 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-200"
            >
              Read full story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {secondaryStories.map((story) => (
            <article
              key={story.slug}
              className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              <Link href={`/articles/${story.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {story.featured_image ? (
                    <Image
                      src={story.featured_image}
                      alt={story.title}
                      fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 1024px) 50vw, 24vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                  {story.categories?.name && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 backdrop-blur dark:bg-slate-950/90 dark:text-white">
                      {story.categories.name}
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <h3 className="line-clamp-3 text-base font-semibold leading-snug text-slate-950 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 sm:text-lg">
                    {story.title}
                  </h3>

                  {story.published_at && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(story.published_at)}</span>
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
