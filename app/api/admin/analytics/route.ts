import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const me = await getCurrentUser()
    if (!me || (me.role !== "admin" && me.role !== "superadmin")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const supabase = await createClient()

    const [articles, reporters] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }),
      supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "reporter"),
    ])

    let commentsCount = 0
    try {
      const { count } = await supabase.from("comments").select("*", { count: "exact", head: true })
      commentsCount = count || 0
    } catch {
      commentsCount = 0
    }

    const [published, draft, pending] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ])

    return NextResponse.json({
      ok: true,
      metrics: {
        articles: articles.count || 0,
        reporters: reporters.count || 0,
        comments: commentsCount,
        published: published.count || 0,
        draft: draft.count || 0,
        pending: pending.count || 0,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 })
  }
}
