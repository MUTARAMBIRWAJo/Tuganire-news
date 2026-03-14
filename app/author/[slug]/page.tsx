import { createClient } from '@supabase/supabase-js';
import ArticlesList from '@/components/ArticlesList';
import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tuganire.site').replace(/\/+$/, '');

export const revalidate = 120;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let authorName = 'Author'

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: author } = await sb
      .from('app_users')
      .select('display_name')
      .eq('id', params.slug)
      .maybeSingle();
    if (author?.display_name) authorName = author.display_name
  }

  const title = `${authorName} Articles`
  const description = `Browse published stories by ${authorName} on Tuganire News.`
  return {
    title,
    description,
    alternates: {
      canonical: `/author/${params.slug}`,
    },
    openGraph: {
      title: `${title} - Tuganire News`,
      description,
      url: `${siteUrl}/author/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Tuganire News`,
      description,
    },
  }
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  // Author id is UUID. Support /author/[id]
  let author: { id?: string; display_name?: string; avatar_url?: string | null } | null = null
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data } = await sb
      .from('app_users')
      .select('id, display_name, avatar_url')
      .eq('id', params.slug)
      .maybeSingle();
    author = data
  }

  return (
    <main className="space-y-6 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold">{author?.display_name ?? 'Author'}</h1>
      </div>
      <ArticlesList initialFilters={{ author: author?.id ?? params.slug }} />
    </main>
  );
}


