import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

// Service client preferred to allow writes
const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

export async function POST(req: Request) {
  try {
    const { date } = (await req.json().catch(() => ({}))) as { date?: string }
    const digestDate = date ? new Date(date) : new Date()
    const dStr = new Date(Date.UTC(digestDate.getUTCFullYear(), digestDate.getUTCMonth(), digestDate.getUTCDate())).toISOString().slice(0,10)

    const now = new Date().toISOString()
    // Fetch top 5 by views or latest
    const { data: articles, error } = await sb
      .from("articles")
      .select("id, slug, title, excerpt, content, featured_image, views_count, published_at")
      .eq("status", "published")
      .lte("published_at", now)
      .order("views_count", { ascending: false, nullsFirst: true })
      .order("published_at", { ascending: false })
      .limit(10)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const site = process.env.NEXT_PUBLIC_SITE_URL || ""
    const items = (articles || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      url: a.slug ? `${site}/article/${a.slug}` : null,
      excerpt: a.excerpt || "",
      content: a.content || "",
    }))

    const prompt = `Create a concise daily digest for a news site highlighting the top 5 stories with 2-3 sentence summaries each. Return strict JSON: { summary: string, items: [{ title, summary, url }] }. Data: ${JSON.stringify(items).slice(0, 12000)}`

    const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You generate concise daily news digests. Respond ONLY with valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    })

    if (!llmRes.ok) {
      const t = await llmRes.text()
      return NextResponse.json({ error: `LLM error: ${t}` }, { status: 502 })
    }

    const data = await llmRes.json()
    const contentText: string = data.choices?.[0]?.message?.content || ""

    let parsed: any
    try { parsed = JSON.parse(contentText) } catch { parsed = { summary: "", items: items.slice(0,5).map(i=>({ title: i.title, summary: i.excerpt, url: i.url })) } }

    // Upsert daily_digest for the date
    const { data: existing } = await sb
      .from("daily_digest")
      .select("id")
      .eq("digest_date", dStr)
      .maybeSingle()

    const payload = {
      digest_date: dStr,
      summary: parsed.summary || "",
      articles: parsed.items || [],
    }

    if (existing?.id) {
      const { error: uerr } = await sb.from("daily_digest").update(payload).eq("id", existing.id)
      if (uerr) return NextResponse.json({ error: uerr.message }, { status: 500 })
      return NextResponse.json({ ok: true, updated: true, digest: { id: existing.id, ...payload } })
    } else {
      const { data: created, error: ierr } = await sb.from("daily_digest").insert(payload).select().single()
      if (ierr) return NextResponse.json({ error: ierr.message }, { status: 500 })
      return NextResponse.json({ ok: true, created: true, digest: created })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
