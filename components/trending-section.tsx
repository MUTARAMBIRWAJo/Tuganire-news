"use client"

import { useState } from "react"
import useSWR from "swr"
import { supabase } from "@/lib/supabaseClient"
import { ArticleCard } from "./article-card"
import { TrendingUp } from "lucide-react"

const fetcher = async () => {
  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      slug,
      title,
      excerpt,
      featured_image,
      views_count,
      published_at,
      category:categories(id, name, slug),
      author:app_users(id, display_name, avatar_url)
    `)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("views_count", { ascending: false })
    .limit(5)
  
  if (error) throw error
  return data || []
}

export function TrendingSection() {
  const { data: trendingArticles, error } = useSWR("trending-articles", fetcher, {
    refreshInterval: 60000, // Refresh every minute
  })

  if (error || !trendingArticles || trendingArticles.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {trendingArticles.map((article: any) => {
            const author = Array.isArray(article.author) ? article.author[0] : article.author
            const category = Array.isArray(article.category) ? article.category[0] : article.category
            return (
              <ArticleCard
                key={article.id}
                article={{
                  ...article,
                  author: author || undefined,
                  category: category || undefined,
                  views_count: undefined,
                }}
                compact
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

