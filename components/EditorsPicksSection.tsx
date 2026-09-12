import { ArticleCard } from "./article-card"
import { Star } from "lucide-react"
import Link from "next/link"
import { t, type Locale } from "@/lib/i18n"

interface EditorsPicksSectionProps {
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
}

export default function EditorsPicksSection({ items, locale = "en" }: EditorsPicksSectionProps & { locale?: Locale }) {
  if (!items || items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          <h2 className="text-[1.6rem] font-bold tracking-[-0.03em] text-slate-950 dark:text-white">{locale === "rw" ? "Ibyatoranyijwe n'abanditsi" : "Editor's Picks"}</h2>
        </div>
        <Link 
          href={`/${locale}/articles?sort=editor_pick`}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          {t("allArticles", locale)}
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
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
            locale={locale}
          />
        ))}
      </div>
    </section>
  )
}

