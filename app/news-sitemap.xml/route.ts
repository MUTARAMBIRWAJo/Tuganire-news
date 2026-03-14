import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const revalidate = 1800 // 30 minutes

function createServiceClientLocal() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const sb = createServiceClientLocal()
  let articles: any[] = []

  if (sb) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data } = await sb
      .from("articles")
      .select("title, slug, published_at")
      .eq("status", "published")
      .gte("published_at", fortyEightHoursAgo)
      .not("slug", "is", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(1000)
    articles = data || []
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tuganire.site").replace(/\/+$/, "")

  const urlEntries = articles
    .map((article: any) => {
      const pubDate = new Date(article.published_at).toISOString()
      const title = escapeXml(article.title || "")
      return `  <url>
    <loc>${siteUrl}/articles/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Tuganire Today &amp; Tomorrow</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
      "X-Robots-Tag": "noindex",
    },
  })
}
