import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { validateArticleForPublishing } from "@/lib/editorialValidation"
import { calculateSeoScore } from "@/lib/seoScore"
import { checkAdsenseReadiness } from "@/lib/adsenseCheck"

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
    if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!["reporter", "admin", "superadmin"].includes(String(me.role || ""))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = await createClient()
    const { data: rows, error: selErr } = await supabase
      .from("articles")
      .select("id, status, title, slug, published_at, content, article_type, featured_image, seo_description, seo_title, seo_keywords")
      .eq("id", id)
      .eq("author_id", me.id)
      .limit(1)
    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 })
    const row = rows?.[0]
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const current = String(row.status || "").toLowerCase()
    const next = current === "draft" ? "submitted" : current === "submitted" ? "published" : "published"

    const patch: any = { status: next }

    if (next === "published") {
      const editorial = validateArticleForPublishing({
        title: String((row as any).seo_title || row.title || ""),
        content: String((row as any).content || ""),
        featuredImage: String((row as any).featured_image || ""),
        metaDescription: String((row as any).seo_description || ""),
        articleType: String((row as any).article_type || "text"),
      })
      const seo = calculateSeoScore({
        title: String(row.title || ""),
        seoTitle: String((row as any).seo_title || ""),
        metaDescription: String((row as any).seo_description || ""),
        content: String((row as any).content || ""),
        featuredImage: String((row as any).featured_image || ""),
        keywords: Array.isArray((row as any).seo_keywords) ? (row as any).seo_keywords : [],
      })
      const adsense = checkAdsenseReadiness({
        title: String(row.title || ""),
        content: String((row as any).content || ""),
        metaDescription: String((row as any).seo_description || ""),
        featuredImage: String((row as any).featured_image || ""),
      })

      const blocking = [
        ...editorial.errors,
        ...(seo.score < 70 ? [`SEO score ${seo.score}/100 is below the minimum 70`] : []),
        ...(!adsense.ready ? adsense.issues : []),
      ]

      if (blocking.length > 0) {
        await supabase.from("articles").update({ status: "draft" }).eq("id", id).eq("author_id", me.id)
        return NextResponse.json(
          { error: `Article reverted to draft: ${blocking.join("; ")}` },
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
