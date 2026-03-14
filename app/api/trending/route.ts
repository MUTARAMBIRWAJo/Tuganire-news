import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Trending score formula:
 * score = (views * 0.5) + (likes * 1.5) + (freshness_factor * 100)
 *
 * Freshness factor:
 * 0–6  hours: 1.0
 * 6–24 hours: 0.8
 * 1–2  days:  0.6
 * 2–7  days:  0.3
 * >7   days:  0.1
 */
function freshnessScore(publishedAt: string): number {
  const ageMs = Date.now() - new Date(publishedAt).getTime()
  const h = ageMs / (1000 * 3600)
  if (h < 6) return 1.0
  if (h < 24) return 0.8
  if (h < 48) return 0.6
  if (h < 168) return 0.3
  return 0.1
}

export async function GET(req: Request) {
  const sb = getServiceClient()
  if (!sb) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  const url = new URL(req.url)
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10) || 10))

  try {
    // Fetch recent published articles (last 7 days) sorted by views for efficiency
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    const { data, error } = await sb
      .from("articles")
      .select(
        `id, slug, title, excerpt, featured_image, published_at,
         views_count, likes_count,
         category:categories(name, slug),
         author:app_users(display_name, avatar_url)`,
      )
      .eq("status", "published")
      .not("slug", "is", null)
      .not("published_at", "is", null)
      .gte("published_at", sevenDaysAgo)
      .order("views_count", { ascending: false })
      .limit(200)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const articleIds = (data || []).map((article: any) => article.id)
    const [sharesRes, completionRes] = articleIds.length
      ? await Promise.all([
          sb.from("article_share_events").select("article_id").in("article_id", articleIds),
          sb.from("article_reading_completion").select("article_id, completed").in("article_id", articleIds),
        ])
      : [{ data: [] as any[] }, { data: [] as any[] }]

    const shareCounts = new Map<string, number>()
    for (const row of sharesRes.data || []) {
      shareCounts.set(String((row as any).article_id), (shareCounts.get(String((row as any).article_id)) || 0) + 1)
    }

    const completionMap = new Map<string, { total: number; completed: number }>()
    for (const row of completionRes.data || []) {
      const key = String((row as any).article_id)
      const prev = completionMap.get(key) || { total: 0, completed: 0 }
      prev.total += 1
      if ((row as any).completed) prev.completed += 1
      completionMap.set(key, prev)
    }

    const scored = (data || []).map((article: any) => {
      const views = Number(article.views_count) || 0
      const likes = Number(article.likes_count) || 0
      const shares = shareCounts.get(String(article.id)) || 0
      const completion = completionMap.get(String(article.id))
      const completionRate = completion && completion.total > 0 ? completion.completed / completion.total : 0
      const freshness = freshnessScore(article.published_at)
      const trending_score = Math.round(((views * 0.5) + (likes * 1.5) + (shares * 2) + (completionRate * 25) + (freshness * 100)) * 100) / 100
      return { ...article, shares_count: shares, reading_completion_rate: completionRate, trending_score }
    })

    scored.sort((a: any, b: any) => b.trending_score - a.trending_score)

    return NextResponse.json({ articles: scored.slice(0, limit) })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
