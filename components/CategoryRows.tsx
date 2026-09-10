import Link from 'next/link';
import { ArticleCard } from '@/components/article-card';
import { categoryHref } from '@/lib/category-utils';

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
};

export default function CategoryRows({ rows, categoryOrder }: { rows: Row[]; categoryOrder?: string[] }) {
  if (!rows?.length) return null;

  const grouped = rows.reduce<Record<string, Row[]>>((acc, r) => {
    const key = r.category_slug ?? 'uncategorized';
    acc[key] ||= [];
    acc[key].push(r);
    return acc;
  }, {});

  const keys = categoryOrder?.length ? categoryOrder.filter((k) => grouped[k]) : Object.keys(grouped);

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="space-y-10">
        {keys.map((slug) => {
          const articles = grouped[slug]!.slice(0, 4);
          const categoryName = articles[0]?.category_name ?? 'Uncategorized';
          return (
            <div key={slug}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold">{categoryName}</h2>
                <Link href={categoryHref(slug)} className="text-sm text-blue-600 hover:underline">
                  Read more
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {articles.map((a) => {
                  const img = (a as any).featured_image || (a as any).image_url || (a as any).cover_image || (a as any).image || null
                  if (!img) {
                    console.warn('[CategoryRows] Missing image for item', { id: (a as any).id, slug: (a as any).slug, title: (a as any).title })
                  }
                  return (
                    <ArticleCard
                      key={a.id}
                      compact
                      imageHeightClass="h-[180px]"
                      imageAspectClass="aspect-[4/3]"
                      article={{
                        id: a.id as any,
                        slug: a.slug as any,
                        title: a.title,
                        excerpt: (a as any).excerpt || (a as any).summary || '',
                        featured_image: img,
                        published_at: (a as any).published_at ?? (a as any).created_at ?? null,
                        views_count: (a as any).views_count ?? (a as any).view_count ?? 0,
                        author: (a as any).author
                          ? (a as any).author as any
                          : ((a as any).author_display_name || (a as any).author_name
                              ? { display_name: (a as any).author_display_name || (a as any).author_name, avatar_url: (a as any).author_avatar_url } as any
                              : undefined),
                        category: (a as any).category_slug
                          ? ({ name: (a as any).category_name || 'Category', slug: (a as any).category_slug } as any)
                          : undefined,
                      } as any}
                    />
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


