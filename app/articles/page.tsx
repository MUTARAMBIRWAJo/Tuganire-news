"use client";
import { useEffect, useMemo, useState, Suspense } from 'react';
import ArticlesList from '@/components/ArticlesList';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import ArticleCardSkeleton from '@/components/ArticleCardSkeleton';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AdsKeeperFluid from '@/components/AdsKeeperFluid';

export default function ArticlesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  // UI state hydrated from URL
  const [q, setQ] = useState<string>(search.get('q') ?? '');
  const [category, setCategory] = useState<string | undefined>(search.get('category') ?? undefined);
  const [sort, setSort] = useState<string>(search.get('sort') ?? 'published_at_desc');
  const [page, setPage] = useState<number>(Number(search.get('page') ?? 0));
  const [pageSize, setPageSize] = useState<number>(Number(search.get('pageSize') ?? 12) || 12);
  const [infinite, setInfinite] = useState<boolean>((search.get('infinite') ?? '0') === '1');
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);

  // populate categories
  useEffect(() => {
    fetch('/api/public/categories')
      .then((r) => r.json())
      .then((json) => {
        const list = (json.categories || []).map((c: any) => ({ slug: c.slug, name: c.name }));
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  // persist to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (sort && sort !== 'published_at_desc') params.set('sort', sort);
    if (!infinite) {
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
    }
    if (infinite) params.set('infinite', '1');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, sort, page, pageSize, infinite]);

  const filters = useMemo(() => ({ q, category, sort, page: infinite ? undefined : page, pageSize: infinite ? undefined : pageSize }), [q, category, sort, page, pageSize, infinite]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="space-y-6 md:space-y-8 pb-16 max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8">
        <div className="px-0">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">All Articles</h1>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Search articles…"
              className="w-full max-w-xs rounded border px-3 py-2"
            />
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }} className="rounded border px-3 py-2">
              <option value="published_at_desc">Newest</option>
              <option value="published_at_asc">Oldest</option>
              <option value="views_desc">Most viewed</option>
            </select>
            <select value={category ?? ''} onChange={(e) => { setCategory(e.target.value || undefined); setPage(0); }} className="rounded border px-3 py-2">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))} className="rounded border px-3 py-2">
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={infinite} onChange={(e) => setInfinite(e.target.checked)} />
              Infinite scroll
            </label>
          </div>
        </div>

        {/* First Ad - After Search Filters */}
        <AdsKeeperFluid />

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ArticleCardSkeleton key={i} compact />
              ))}
            </div>
          }
        >
          <ArticlesList initialFilters={filters} infinite={infinite} pageSize={pageSize} />
        </Suspense>

        {/* Second Ad - After Articles List */}
        <AdsKeeperFluid />

        {!infinite && (
        <div className="flex items-center justify-between pt-4">
          <button
            className="px-3 py-2 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Page {page + 1}</span>
          <button
            className="px-3 py-2 rounded border"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

