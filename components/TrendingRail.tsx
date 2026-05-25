import { ArticleCard } from '@/components/article-card';

export default function TrendingRail({ items }: { items: Array<{ id: string; slug: string; title: string; featured_image: string | null; category_slug: string; category_name: string; views_count?: number | null; author?: { display_name?: string; avatar_url?: string } | null; author_display_name?: string | null; author_avatar_url?: string | null; published_at?: string | null }> }) {
  if (!items?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">Trending stories</div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">What readers are following right now</h2>
        </div>
        <a href="/articles?sort=views_desc" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">View all</a>
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {items.map((a) => {
          const img = (a as any).featured_image || (a as any).image_url || (a as any).cover_image || (a as any).image || null;
          if (!img) {
            console.warn('[TrendingRail] Missing image for item', { id: (a as any).id, slug: (a as any).slug, title: (a as any).title });
          }
          return (
          <div key={a.id} className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-start">
            <ArticleCard
              compact
              imageHeightClass="h-[170px]"
              imageAspectClass="aspect-video"
              article={{
                id: a.id as any,
                slug: a.slug,
                title: a.title,
                excerpt: '',
                featured_image: img,
                published_at: (a as any).published_at ?? null,
                views_count: a.views_count ?? 0,
                author: (a as any).author ?? ((a as any).author_display_name ? { display_name: (a as any).author_display_name, avatar_url: (a as any).author_avatar_url } : undefined),
                category: { name: a.category_name, slug: a.category_slug } as any,
              } as any}
            />
          </div>
          )
        })}
      </div>
    </section>
  );
}


