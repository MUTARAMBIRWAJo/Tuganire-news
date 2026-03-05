import { createClient } from '@supabase/supabase-js';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import ArticlesList from '@/components/ArticlesList';
import AdSenseFluid from '@/components/AdSenseFluid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = createClient(supabaseUrl, anonKey);

export const revalidate = 120;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { data: cat } = await sb.from('categories').select('id, name, slug').eq('slug', params.slug).maybeSingle();

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
          <AdSenseFluid adSlot="5121245254" />
        </div>
        
        {/* Articles List */}
        <div className="py-8">
          <ArticlesList initialFilters={{ category: params.slug }} />
        </div>
        
        {/* Second Ad - After Articles List */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <AdSenseFluid adSlot="5121245254" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}


