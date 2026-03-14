import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient as createServiceClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

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

    if (status === "published") {
      const { data: article, error: findErr } = await sb
        .from("articles")
        .select("id, content, article_type")
        .eq("id", id)
        .maybeSingle()

      if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 })
      if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 })

      if (String((article as any).article_type || "text") !== "video") {
        const words = wordCountFromHtml(String((article as any).content || ""))
        if (words < 600) {
          return NextResponse.json(
            { error: `Cannot publish article with fewer than 600 words. Current count: ${words}` },
            { status: 400 },
          )
        }
      }
    }

    const payload: any = { status }
    if (status === "published") payload.published_at = new Date().toISOString()

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
