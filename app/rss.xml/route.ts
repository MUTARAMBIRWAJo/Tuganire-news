import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const rawSite = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
// Normalize to avoid trailing slash issues
const siteUrl = rawSite.replace(/\/+$/, '');

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;
  return createClient(supabaseUrl, anonKey);
}

export async function GET() {
  const sb = createSupabaseClient();
  if (!sb) {
    const buildDate = new Date().toUTCString();
    const selfUrl = `${siteUrl}/rss.xml`;
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tuganire</title>
    <link>${siteUrl}</link>
    <description>Latest news from Tuganire</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <ttl>30</ttl>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
  </channel>
</rss>`;
    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
  }

  const { data, error } = await sb
    .from('articles')
    .select('slug,title,excerpt,published_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) return new NextResponse(error.message, { status: 500 });

  const items = data ?? [];
  const buildDate = new Date().toUTCString();
  const selfUrl = `${siteUrl}/rss.xml`;

  // Ensure excerpt is safe inside CDATA and trimmed
  const fmt = (s: string | null | undefined) => {
    if (!s) return '';
    return s.toString().replace(/\r\n|\r|\n/g, '\n').trim();
  };

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tuganire</title>
    <link>${siteUrl}</link>
    <description>Latest news from Tuganire</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <ttl>30</ttl>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
    ${items
      .map(
        (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteUrl}/articles/${a.slug}</link>
      <guid isPermaLink="true">${siteUrl}/articles/${a.slug}</guid>
      <pubDate>${a.published_at ? new Date(a.published_at).toUTCString() : ''}</pubDate>
      <description><![CDATA[${fmt(a.excerpt)}]]></description>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300'
    }
  });
}


