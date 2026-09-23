import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import ArticlesList from '@/components/ArticlesList';
import EmptyCategoryState from '@/components/EmptyCategoryState';
import AdsKeeperFluid from '@/components/AdsKeeperFluid';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import { t } from '@/lib/i18n';
import AdvertisementSlot from '@/components/AdvertisementSlot';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tuganire.site').replace(/\/+$/, '');

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang?: string }> }): Promise<Metadata> {
  const resolved = await params
  const raw = decodeURIComponent(resolved.slug || '')
  const fallbackName = raw.replace(/-/g, ' ')
  let categoryName = fallbackName

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    // case-insensitive slug lookup
    const slug = raw.trim()
    const { data: cat } = await sb.from('categories').select('name').ilike('slug', slug).maybeSingle();
    if (cat?.name) categoryName = cat.name
  }

  const title = `${categoryName} News`
  const description = `Read the latest ${categoryName} stories and updates on Tuganire News.`
  const language = resolved?.lang === 'rw' ? 'rw' : 'en'
  const canonicalPath = `/${language}/category/${resolved.slug}`
  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${title} - Tuganire News`,
      description,
      url: `${siteUrl}${canonicalPath}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Tuganire News`,
      description,
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string; lang?: string }> }) {
  const resolved = await params
  const raw = decodeURIComponent(resolved.slug || '')
  const language = resolved.lang === 'rw' ? 'rw' : 'en'
  let cat: { id?: number; name?: string; slug?: string } | null = null
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const slug = raw.trim()
    const { data } = await sb.from('categories').select('id, name, slug').ilike('slug', slug).maybeSingle();
    cat = data
    if (!cat) {
      const nameLookup = raw.replace(/-/g, ' ').trim()
      const { data: byName } = await sb.from('categories').select('id, name, slug').ilike('name', nameLookup).maybeSingle();
      if (byName) cat = byName
    }
  }

  const categoryName = cat?.name ?? 'Category'

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <div className="news-shell py-12 sm:py-16">
            <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
              {t("section", language)}
            </div>
            <h1 className="mb-3 text-[2.1rem] font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-[2.8rem]">
              {categoryName}
            </h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              {language === "rw" ? `Reba amakuru, isesengura n'inkuru z'abaturage muri ${categoryName.toLowerCase()}.` : `Browse the latest reporting, analysis, and community updates in ${categoryName.toLowerCase()}.`}
            </p>
          </div>
        </div>

        <div className="news-shell py-8">
          <AdvertisementSlot placement="CATEGORY_TOP" />
          <AdsKeeperFluid />
        </div>

        <div className="pb-12">
          <ErrorBoundary>
            <ArticlesList
              initialFilters={{ category: resolved.slug, lang: language }}
              emptyFallback={<EmptyCategoryState title={`No articles in ${categoryName}`} message={`There are currently no published articles in ${categoryName}. Check back later or explore other sections.`} />}
            />
          </ErrorBoundary>
          <AdvertisementSlot placement="CATEGORY_MIDDLE" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}


