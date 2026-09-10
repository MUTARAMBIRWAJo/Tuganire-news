import { ArticleCard } from '@/components/article-card';
import { categoryHref } from '@/lib/category-utils';
import { categoryLabel, t, type Locale } from '@/lib/i18n';

export default function TrendingRail({ items, locale = "en" }: { items: Array<{ id: string; slug: string; title: string; featured_image: string | null; category_slug: string; category_name: string; views_count?: number | null; author?: { display_name?: string; avatar_url?: string } | null; author_display_name?: string | null; author_avatar_url?: string | null; published_at?: string | null }>; locale?: Locale }) {
  if (!items?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">{t("trending", locale)}</div>
          <h2 className="mt-1 text-[1.6rem] font-bold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-[1.8rem]">{locale === "rw" ? "Ibyo abasomyi bakurikira ubu" : "What readers are following right now"}</h2>
        </div>
        <a href={`/${locale}/articles?sort=views_desc`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">{t("allArticles", locale)}</a>
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
                category: { name: categoryLabel({ name: a.category_name, slug: a.category_slug }, locale), slug: a.category_slug } as any,
              } as any}
              locale={locale}
            />
          </div>
          )
        })}
      </div>
    </section>
  );
}


