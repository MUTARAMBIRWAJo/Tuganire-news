"use client";
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import ArticlesList from '@/components/ArticlesList';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { t } from '@/lib/i18n';
import AdvertisementSlot from '@/components/AdvertisementSlot';

export default function SearchPage({ lang }: { lang?: string }) {
  const routeParams = useParams<{ lang?: string }>()
  const currentLang = lang || routeParams?.lang || 'en'
  const locale = currentLang === 'rw' ? 'rw' : 'en'
  const [q, setQ] = useState('');
  const filters = useMemo(() => ({ q, sort: 'published_at_desc', lang: currentLang === 'rw' ? 'rw' : 'en' }), [q, currentLang]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="pb-16">
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <div className="news-shell py-10 sm:py-14">
            <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
              <Sparkles className="h-3.5 w-3.5" />
              {t("discoverStories", locale)}
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">{t("search", locale)}</h1>
            <div className="relative w-full max-w-3xl">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchPlaceholder", locale)}
                aria-label={t("search", locale)}
                className="w-full rounded-full border border-slate-200 bg-white py-4 pl-12 pr-4 text-base text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
              />
            </div>
          </div>
        </section>

        <div className="news-shell py-8">
          <AdvertisementSlot placement="SEARCH_TOP" />
          <ArticlesList initialFilters={filters} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}


