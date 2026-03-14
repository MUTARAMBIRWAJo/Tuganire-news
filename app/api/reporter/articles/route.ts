import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = (url.searchParams.get("q") || "").trim()
    const status = (url.searchParams.get("status") || "").trim()
    const category = (url.searchParams.get("category") || "").trim()
    const from = (url.searchParams.get("from") || "").trim()
    const to = (url.searchParams.get("to") || "").trim()
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1)
    const pageSize = Math.max(1, Math.min(50, parseInt(url.searchParams.get("pageSize") || "10", 10) || 10))
    const fromIdx = (page - 1) * pageSize
    const toIdx = fromIdx + pageSize - 1

    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = await createClient()
    let list = supabase
      .from("articles")
      .select(
        `id, title, excerpt, status, is_featured, article_type, views_count, created_at, category_id,
         category:categories(name)`,
        { count: "exact" }
      )
      .eq("author_id", me.id)

    if (q) list = list.ilike("title", `%${q}%`)
    if (status) list = list.eq("status", status)
    if (category) list = list.eq("category_id", Number(category))
    if (from) list = list.gte("created_at", new Date(from).toISOString())
    if (to) list = list.lte("created_at", new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString())

    const { data, count, error } = await list.order("created_at", { ascending: false }).range(fromIdx, toIdx)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Ensure count is always a number
    const totalCount = typeof count === 'number' ? count : 0;
    
    return NextResponse.json({ 
      items: Array.isArray(data) ? data : [], 
      count: totalCount, 
      page, 
      pageSize 
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}
