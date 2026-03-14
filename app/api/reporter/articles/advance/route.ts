import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

function wordCountFromHtml(htmlOrText: string) {
  const plain = (htmlOrText || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim()
  if (!plain) return 0
  return plain.split(/\s+/).filter(Boolean).length
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = await createClient()
    const { data: rows, error: selErr } = await supabase
      .from("articles")
      .select("id, status, title, slug, published_at, content, article_type")
      .eq("id", id)
      .eq("author_id", me.id)
      .limit(1)
    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 })
    const row = rows?.[0]
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const current = String(row.status || "").toLowerCase()
    const next = current === "draft" ? "submitted" : current === "submitted" ? "published" : "published"

    const patch: any = { status: next }

    if (next === "published" && String((row as any).article_type || "text") !== "video") {
      const words = wordCountFromHtml(String((row as any).content || ""))
      if (words < 600) {
        return NextResponse.json(
          { error: `Cannot publish article with fewer than 600 words. Current count: ${words}` },
          { status: 400 },
        )
      }
    }

    if (next === "published") {
      if (!row.published_at) {
        patch.published_at = new Date().toISOString()
      }
      if (!row.slug || String(row.slug).trim() === "") {
        const base = String(row.title || "").toLowerCase()
          .normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-")
        let candidate = base || `article-${id}`
        const { data: existing } = await supabase
          .from("articles")
          .select("slug")
          .ilike("slug", `${candidate}%`)
        if (existing && existing.length) {
          let i = 1
          const set = new Set(existing.map((e: any) => String(e.slug)))
          while (set.has(candidate)) {
            candidate = `${base}-${++i}`
          }
        }
        patch.slug = candidate
      }
    }

    const { error: updErr } = await supabase.from("articles").update(patch).eq("id", id).eq("author_id", me.id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, next })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}
