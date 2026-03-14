import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small"

const sb = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    // Naive intent extraction for category keywords
    const lower = message.toLowerCase()
    const categoryHints = [
      "politics",
      "business",
      "sports",
      "technology",
      "tech",
      "entertainment",
      "health",
      "world",
      "rwanda",
    ]
    const hinted = categoryHints.find((c) => lower.includes(c))

    // Fetch relevant articles (keyword + recency)
    const now = new Date().toISOString()
    let query = sb
      .from("articles")
      .select("id, slug, title, excerpt, content, featured_image, category:category_id(name,slug), published_at")
      .eq("status", "published")
      .lte("published_at", now)
      .order("published_at", { ascending: false })
      .limit(12)

    // Build broad keyword filter across multiple fields
    const kw = hinted || message.trim()
    if (kw) {
      const like = `%${kw}%`
      query = query.or(
        [
          `title.ilike.${like}`,
          `excerpt.ilike.${like}`,
          `content.ilike.${like}`,
          `slug.ilike.${like}`,
        ].join(",")
      )
    }

    let { data: articles, error } = await query
    if (error) {
      return NextResponse.json({ items: [], note: "I couldn't fetch articles right now. Please try another topic or try again later." }, { status: 200 })
    }
    // Fallback to latest if no matches
    if (!articles || articles.length === 0) {
      const retry = await sb
        .from("articles")
        .select("id, slug, title, excerpt, content, featured_image, category:category_id(name,slug), published_at")
        .eq("status", "published")
        .lte("published_at", now)
        .order("published_at", { ascending: false })
        .limit(8)
      articles = retry.data || []
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL || ""
    let items = (articles || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      url: a.slug ? `${site}/article/${a.slug}` : null,
      excerpt: a.excerpt || null,
      // tags omitted (column may not exist in schema)
      category: Array.isArray(a.category) ? a.category[0]?.name : a.category?.name,
      content: a.content || "",
    }))

    // Semantic search enhancement using embeddings (best-effort)
    try {
      // 1) Get embedding for the user's message
      const embRes = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: OPENAI_EMBED_MODEL, input: message.slice(0, 2000) }),
      })
      if (embRes.ok) {
        const embJson = await embRes.json()
        const queryEmbedding: number[] = embJson?.data?.[0]?.embedding || []

        if (Array.isArray(queryEmbedding) && queryEmbedding.length > 0) {
          // 2) Fetch a candidate set of recent articles (wider set for semantic ranking)
          const { data: recent } = await sb
            .from("articles")
            .select("id, slug, title, excerpt, content, published_at")
            .eq("status", "published")
            .lte("published_at", now)
            .order("published_at", { ascending: false })
            .limit(150)

          const ids = (recent || []).map((r: any) => r.id)
          if (ids.length > 0) {
            // 3) Fetch embeddings for those articles
            const { data: embeds } = await sb
              .from("article_embeddings")
              .select("article_id, embedding")
              .in("article_id", ids)

            // 4) Compute cosine similarity client-side and pick top N
            const byId = new Map<string, any>((recent || []).map((r: any) => [r.id, r]))

            function cosine(a: number[], b: number[]) {
              if (!a || !b || a.length !== b.length) return -1
              let dot = 0, na = 0, nb = 0
              for (let i = 0; i < a.length; i++) {
                const x = a[i] || 0
                const y = b[i] || 0
                dot += x * y
                na += x * x
                nb += y * y
              }
              const denom = Math.sqrt(na) * Math.sqrt(nb)
              return denom ? dot / denom : -1
            }

            const scored = (embeds || [])
              .map((e: any) => ({ id: e.article_id, score: cosine(queryEmbedding, e.embedding as number[]) }))
              .filter((s) => s.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, 12)
              .map((s) => byId.get(s.id))
              .filter(Boolean)

            if (scored.length > 0) {
              items = scored.map((a: any) => ({
                id: a.id,
                title: a.title,
                url: a.slug ? `${site}/article/${a.slug}` : null,
                excerpt: a.excerpt || null,
                category: undefined,
                content: a.content || "",
              }))
            }
          }
        }
      }
    } catch {
      // Ignore embedding/semantic failures and keep keyword/recency results
    }

    // Optional: merge tag-based matches if a 'tags' column exists (text[])
    if (items.length < 5 && kw) {
      try {
        // Probe tags column existence by attempting a minimalist select
        const probe = await sb.from("articles").select("id,tags").limit(1)
        if (!probe.error) {
          const { data: byTags } = await sb
            .from("articles")
            .select("id, slug, title, excerpt, content, published_at")
            .contains("tags", [kw])
            .eq("status", "published")
            .lte("published_at", now)
            .order("published_at", { ascending: false })
            .limit(20)
          const existing = new Set(items.map((i) => i.id))
          for (const a of byTags || []) {
            if (!existing.has(a.id)) {
              items.push({
                id: a.id,
                title: a.title,
                url: a.slug ? `${site}/article/${a.slug}` : null,
                excerpt: a.excerpt || null,
                category: undefined,
                content: a.content || "",
              })
            }
          }
        }
      } catch {
        // ignore tag path if schema not present
      }
    }

    // Build prompt
    const prompt = `You are a helpful news assistant for a Rwandan news site. The user asked: "${message}".\nSummarize and select the most relevant 5 items from the list below. For each item, give a 1-2 sentence summary. If the query mentions a category, prioritize it. Return JSON with an array 'items' of {title, summary, url, tags}. Here is the data: ${JSON.stringify(
      items
    ).slice(0, 10000)}`

    const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You summarize and structure news results." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    })

    let summaries: { title: string; summary: string; url: string | null }[] = []
    try {
      if (llmRes.ok) {
        const data = await llmRes.json()
        const content: string = data.choices?.[0]?.message?.content || ""
        try {
          const parsed = JSON.parse(content)
          if (Array.isArray(parsed.items)) {
            summaries = parsed.items
          }
        } catch {
          // ignore JSON parse error, will fallback below
        }
      }
    } catch {
      // ignore LLM/network errors
    }

    // Fallback summaries from DB excerpts if LLM path failed
    if (summaries.length === 0) {
      summaries = items.slice(0, 5).map((i) => ({ title: i.title, summary: i.excerpt || "", url: i.url }))
    }

    return NextResponse.json({ query: message, items: summaries })
  } catch (e: any) {
    return NextResponse.json({ items: [], note: "I'm having trouble answering right now. Please try again in a moment." }, { status: 200 })
  }
}
