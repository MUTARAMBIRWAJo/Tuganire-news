import ArticlesList from '@/components/ArticlesList';
import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tuganire.site').replace(/\/+$/, '');

export const revalidate = 120;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tag = params.slug.replace(/-/g, ' ')
  const title = `Tag: ${tag}`
  const description = `Latest news and stories tagged ${tag} on Tuganire News.`
  return {
    title,
    description,
    alternates: {
      canonical: `/tag/${params.slug}`,
    },
    openGraph: {
      title: `${title} - Tuganire News`,
      description,
      url: `${siteUrl}/tag/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Tuganire News`,
      description,
    },
  }
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  return (
    <main className="space-y-6 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold">Tag: {params.slug}</h1>
      </div>
      <ArticlesList initialFilters={{ tag: params.slug }} />
    </main>
  );
}


