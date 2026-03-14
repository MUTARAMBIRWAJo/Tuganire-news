import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from",
  "up","is","it","as","be","this","that","was","are","into","via","his","her","its",
  "are","were","has","have","had","not","all","can","will","just","more","about",
  "their","they","what","when","who","how","also","than","then","now","new","out",
  "two","one","get","got","day","days","says","said","we","our","your","my","only",
])

function extractKeywords(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 25)
}

export async function POST(req: Request) {
  const sb = getServiceClient()
  if (!sb) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { title, content, currentArticleId } = body

    const keywords = extractKeywords(`${title || ""} ${content || ""}`)
    if (!keywords.length) return NextResponse.json({ suggestions: [] })

    // Fetch recent published articles to score by keyword overlap
    const { data, error } = await sb
      .from("articles")
      .select("id, slug, title, excerpt, featured_image, category:categories(name, slug)")
      .eq("status", "published")
      .not("slug", "is", null)
      .order("published_at", { ascending: false })
      .limit(150)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const scored = (data || [])
      .filter((a: any) => a.id !== currentArticleId)
      .map((article: any) => {
        const articleKws = extractKeywords(article.title || "")
        const titleText = String(article.title || "").toLowerCase()
        const overlap = keywords.filter(
          (kw) => articleKws.includes(kw) || titleText.includes(kw),
        ).length
        return { ...article, relevance: overlap }
      })
      .filter((a: any) => a.relevance > 0)
      .sort((a: any, b: any) => b.relevance - a.relevance)
      .slice(0, 5)

    if (currentArticleId && scored.length > 0) {
      await sb.from("article_internal_link_recommendations").delete().eq("article_id", currentArticleId)
      await sb.from("article_internal_link_recommendations").insert(
        scored.map((article: any) => ({
          article_id: currentArticleId,
          recommended_article_id: article.id,
          relevance_score: article.relevance,
          source: "keyword-match",
        })),
      )
    }

    const suggestions = scored.map(({ relevance: _r, ...article }: any) => article)

    return NextResponse.json({ suggestions })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
