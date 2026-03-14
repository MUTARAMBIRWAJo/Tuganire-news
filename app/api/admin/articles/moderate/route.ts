import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { validateArticleForPublishing } from "@/lib/editorialValidation"
import { calculateSeoScore } from "@/lib/seoScore"
import { checkAdsenseReadiness } from "@/lib/adsenseCheck"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser()
    if (!me || (me.role !== "admin" && me.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = req.headers.get("content-type") || ""
    let id = ""
    let action = ""
    if (contentType.includes("application/json")) {
      const body = await req.json()
      id = body?.id || ""
      action = body?.action || ""
    } else {
      const form = await req.formData()
      id = String(form.get("id") || "")
      action = String(form.get("action") || "")
    }

    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const sb = createServiceClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const status = action === "approve" ? "published" : "rejected"
    let existingPublishedAt: string | null = null

    if (status === "published") {
      const { data: article, error: findErr } = await sb
        .from("articles")
        .select("id, content, article_type, featured_image, title, published_at, seo_description, seo_title, seo_keywords")
        .eq("id", id)
        .maybeSingle()

      if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 })
      if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 })
      existingPublishedAt = (article as any).published_at || null

      const editorial = validateArticleForPublishing({
        title: String((article as any).seo_title || (article as any).title || ""),
        content: String((article as any).content || ""),
        featuredImage: String((article as any).featured_image || ""),
        metaDescription: String((article as any).seo_description || ""),
        articleType: String((article as any).article_type || "text"),
      })
      const seo = calculateSeoScore({
        title: String((article as any).title || ""),
        seoTitle: String((article as any).seo_title || ""),
        metaDescription: String((article as any).seo_description || ""),
        content: String((article as any).content || ""),
        featuredImage: String((article as any).featured_image || ""),
        keywords: Array.isArray((article as any).seo_keywords) ? (article as any).seo_keywords : [],
      })
      const adsense = checkAdsenseReadiness({
        title: String((article as any).title || ""),
        content: String((article as any).content || ""),
        metaDescription: String((article as any).seo_description || ""),
        featuredImage: String((article as any).featured_image || ""),
      })

      const blocking = [
        ...editorial.errors,
        ...(seo.score < 70 ? [`SEO score ${seo.score}/100 is below the minimum 70`] : []),
        ...(!adsense.ready ? adsense.issues : []),
      ]

      if (blocking.length > 0) {
        await sb.from("articles").update({ status: "draft" }).eq("id", id)
        return NextResponse.json({ error: `Article reverted to draft: ${blocking.join("; ")}` }, { status: 400 })
      }
    }

    const payload: any = { status }
    if (status === "published") {
      // Only set published_at for first-time publication; preserve original date on re-approval
      if (!existingPublishedAt) {
        payload.published_at = new Date().toISOString()
      }
    }

    const { error } = await sb
      .from("articles")
      .update(payload)
      .eq("id", id)
      .in("status", ["submitted", "pending", "draft"]) // safety: only update non-published

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id, status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
