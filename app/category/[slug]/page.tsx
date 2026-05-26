import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import ArticlesList from '@/components/ArticlesList';
import EmptyCategoryState from '@/components/EmptyCategoryState';
import AdsKeeperFluid from '@/components/AdsKeeperFluid';
import ErrorBoundary from '@/components/errors/ErrorBoundary';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tuganire.site').replace(/\/+$/, '');

export const revalidate = 120;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const fallbackName = params.slug.replace(/-/g, ' ')
  let categoryName = fallbackName

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: cat } = await sb.from('categories').select('name').eq('slug', params.slug).maybeSingle();
    if (cat?.name) categoryName = cat.name
  }

  const title = `${categoryName} News`
  const description = `Read the latest ${categoryName} stories and updates on Tuganire News.`
  return {
    title,
    description,
    alternates: {
      canonical: `/category/${params.slug}`,
    },
    openGraph: {
      title: `${title} - Tuganire News`,
      description,
      url: `${siteUrl}/category/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Tuganire News`,
      description,
    },
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  let cat: { id?: number; name?: string; slug?: string } | null = null
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data } = await sb.from('categories').select('id, name, slug').eq('slug', params.slug).maybeSingle();
    cat = data
  }

  // If Supabase is configured and the category wasn't found, return 404
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !cat) {
    return notFound()
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white dark:bg-slate-950">
        {/* Category Header */}
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              {cat?.name ?? 'Category'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Browse all articles in {cat?.name ?? 'this category'}
            </p>
          </div>
        </div>
        
        {/* First Ad - After Category Header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <AdsKeeperFluid />
        </div>
        
        {/* Articles List */}
        <div className="py-8">
          <ErrorBoundary>
            <ArticlesList initialFilters={{ category: params.slug }} emptyFallback={<EmptyCategoryState title={`No articles in ${cat?.name ?? 'this category'}`} message={`There are currently no published articles in ${cat?.name ?? 'this category'}. Check back later or explore other sections.`} />} />
          </ErrorBoundary>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}


