import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/guards"

export async function GET(request: Request) {
  const me = await requireRole(["reporter", "admin", "superadmin"])

  const url = new URL(request.url)
  const range = (url.searchParams.get("range") || "30d").toLowerCase()

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30
  const supabase = await createClient()

  // First, get this reporter's article IDs
  const { data: myArticles, error: articlesError } = await supabase
    .from("articles")
    .select("id")
    .eq("author_id", me.id)

  if (articlesError) return NextResponse.json({ error: articlesError.message }, { status: 500 })
  const articleIds = (myArticles || []).map((a: any) => a.id).filter(Boolean)
  if (articleIds.length === 0) {
    // Still return an empty series with correct date range
    const today = new Date()
    const out: Array<{ date: string; views: number }> = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      out.push({ date: key, views: 0 })
    }
    return NextResponse.json({ points: out, range: days })
  }

  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  const sinceStr = since.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("article_views_daily")
    .select("view_date, views, article_id")
    .gte("view_date", sinceStr)
    .in("article_id", articleIds as any)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const map = new Map<string, number>()
  for (const row of data || []) {
    const d = row.view_date as string
    map.set(d, (map.get(d) || 0) + (Number(row.views) || 0))
  }

  const out: Array<{ date: string; views: number }> = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ date: key, views: map.get(key) || 0 })
  }

  return NextResponse.json({ points: out, range: days })
}
