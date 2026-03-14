import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tuganire.site").replace(/\/+$/, "")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [
      {
        url: `${siteUrl}/`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 1,
      },
    ]
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  const [{ data: categories }, { data: articles }] = await Promise.all([
    supabase.from("categories").select("slug, updated_at").order("slug").limit(1000),
    supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5000),
  ])

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]

  const categoryUrls: MetadataRoute.Sitemap = (categories || [])
    .filter((category: any) => category?.slug)
    .map((category: any) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }))

  const articleUrls: MetadataRoute.Sitemap = (articles || [])
    .filter((article: any) => article?.slug)
    .map((article: any) => ({
      url: `${siteUrl}/articles/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : article.published_at ? new Date(article.published_at) : now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))

  return [...staticUrls, ...categoryUrls, ...articleUrls]
}
