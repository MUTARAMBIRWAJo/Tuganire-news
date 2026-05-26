"use client";
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useEffect, useMemo, useRef } from 'react';
import ArticleCardSkeleton from '@/components/ArticleCardSkeleton';
import { ArticleCard } from '@/components/article-card';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Filters = {
  category?: string;
  tag?: string;
  author?: string;
  q?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (typeof filters.page === 'number') params.set('page', String(filters.page));
  if (typeof filters.pageSize === 'number') params.set('pageSize', String(filters.pageSize));
  if (filters.category) params.set('category', filters.category);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.author) params.set('author', filters.author);
  if (filters.q) params.set('q', filters.q);
  if (filters.sort) params.set('sort', filters.sort);
  return params.toString();
}

export default function ArticlesList({ initialFilters, pageSize = 12, infinite = true, emptyFallback }: { initialFilters?: Filters; pageSize?: number; infinite?: boolean; emptyFallback?: React.ReactNode }) {
  const controlled = typeof initialFilters?.page === 'number' && typeof initialFilters?.pageSize === 'number';

  // Controlled single-page mode (respects page & pageSize from parent)
  const singleKey = useMemo(() => {
    if (!controlled) return null;
    const qs = buildQuery({ ...initialFilters! });
    return `/api/public/articles?${qs}`;
  }, [controlled, initialFilters]);

  const { data: singleData, isLoading: singleLoading, error: singleError } = useSWR(controlled ? singleKey : null, fetcher, { revalidateOnFocus: false });

  // Infinite mode (fallback)
  const getKey = (pageIndex: number, prev: any) => {
    if (controlled) return null; // disabled
    if (prev && prev.items && prev.items.length === 0) return null;
    const qs = buildQuery({ ...initialFilters, page: pageIndex, pageSize });
    return `/api/public/articles?${qs}`;
  };
  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, { revalidateOnFocus: false });

  const items = controlled
    ? ((singleData?.items ?? []) as Array<any>)
    : (((data?.flatMap((d) => d?.items ?? []) ?? []) as Array<any>).filter(Boolean));
  const total = controlled ? (singleData?.total ?? 0) : (data?.[0]?.total ?? 0);
  const isLoading = controlled ? singleLoading : (isValidating && (data?.length ?? 0) === 0);
  const isLoadingMore = !controlled && isValidating && size > 0;
  const isEnd = controlled ? items.length >= total : items.length >= total;

  // Infinite scroll with sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (controlled || !infinite) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !isLoadingMore && !isEnd) {
        setSize((s) => s + 1);
      }
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [controlled, infinite, isLoadingMore, isEnd, setSize]);

  if ((controlled && singleError) || (!controlled && error)) return <div className="px-4">Failed to load.</div>;

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400 font-medium">{total ? `Showing ${items.length} of ${total} articles` : null}</div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: pageSize }).map((_, i) => <ArticleCardSkeleton key={i} />)
          : items.length === 0
          ? (emptyFallback ?? <div className="col-span-full text-center text-sm text-gray-600 dark:text-gray-400">No articles found.</div>)
          : items.map((a, idx) => (
              <ArticleCard 
                key={a?.id ?? idx} 
                article={{
                  id: a?.id,
                  slug: a?.slug,
                  title: a?.title ?? '',
                  excerpt: a?.excerpt,
                  featured_image: a?.featured_image,
                  published_at: a?.published_at,
                  status: a?.status,
                  views_count: a?.views_count,
                  comments_count: a?.comments_count,
                  likes_count: a?.likes_count,
                  category: a?.category,
                  author: a?.author,
                  content: a?.content,
                  created_at: a?.created_at,
                  updated_at: a?.updated_at,
                  article_type: a?.article_type,
                  youtube_link: a?.youtube_link,
                } as any}
                compact={true}
              />
            ))}
      </div>
      {/* Controls */}
      {!controlled && (
        <div className="mt-8 flex flex-col items-center gap-4">
          {!isEnd && !infinite && (
            <button
              type="button"
              onClick={() => setSize(size + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
          {infinite && <div ref={sentinelRef} className="h-10" />}
          {isEnd && <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">You reached the end of articles.</div>}
        </div>
      )}
    </section>
  );
}


