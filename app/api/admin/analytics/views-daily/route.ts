import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

function isAdmin(role?: string | null) {
  const r = (role || "").toLowerCase()
  return r === "superadmin" || r === "admin"
}

export async function GET(request: Request) {
  const me = await getCurrentUser()
  if (!me || !isAdmin(me.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const range = (url.searchParams.get("range") || "30d").toLowerCase()
  const articleId = url.searchParams.get("articleId") || null

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30
  const supabase = await createClient()

  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  const sinceStr = since.toISOString().slice(0, 10)

  let query = supabase
    .from("article_views_daily")
    .select("view_date, views")
    .gte("view_date", sinceStr)

  if (articleId) query = query.eq("article_id", articleId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate by date (sum across articles if no articleId)
  const map = new Map<string, number>()
  for (const row of data || []) {
    const d = row.view_date as string
    map.set(d, (map.get(d) || 0) + (Number(row.views) || 0))
  }

  // Fill missing dates with 0
  const out: Array<{ date: string; views: number }> = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ date: key, views: map.get(key) || 0 })
  }

  return NextResponse.json({ points: out, range: days, articleId: articleId || null })
}
