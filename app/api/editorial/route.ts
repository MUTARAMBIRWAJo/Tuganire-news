import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { toSlug } from "@/lib/editorial"

const allowedTypes = ["magazine", "research", "story", "history"] as const

export async function POST(request: Request) {
  const payload = await request.json()

  try {
    const { content_type, title, slug, ...rest } = payload
    const type = allowedTypes.includes(content_type) ? content_type : "story"
    const normalizedSlug = (slug || title || "editorial-item").trim()
    const finalSlug = toSlug(normalizedSlug)
    const supabase = await createClient()

    const { data: existing } = await supabase.from("editorial_content").select("id").eq("slug", finalSlug).maybeSingle()
    if (existing) {
      return NextResponse.json({ error: "A published or draft editorial item already uses this slug." }, { status: 409 })
    }

    const { data, error } = await supabase.from("editorial_content").insert({
      content_type: type,
      title: title || "Untitled editorial item",
      slug: finalSlug,
      language: rest.language || "en",
      status: rest.status || "draft",
      category: rest.category || null,
      tags: Array.isArray(rest.tags) ? rest.tags : [],
      summary: rest.summary || null,
      body: rest.body || null,
      subtitle: rest.subtitle || null,
      issue: rest.issue || null,
      edition: rest.edition || null,
      research_question: rest.research_question || null,
      methodology: rest.methodology || null,
      main_findings: rest.main_findings || null,
      why_it_matters_today: rest.why_it_matters_today || null,
      historical_date: rest.historical_date || null,
      historical_location: rest.historical_location || null,
      historical_event: rest.historical_event || null,
      historical_context: rest.historical_context || null,
      what_happened: rest.what_happened || null,
      location: rest.location || null,
      people_subjects: rest.people_subjects || null,
      story_context: rest.story_context || null,
      featured_image: rest.featured_image || null,
      social_image: rest.social_image || null,
      author_id: rest.author_id || null,
      published_at: rest.published_at || null,
      seo_title: rest.seo_title || null,
      seo_description: rest.seo_description || null,
      canonical_url: rest.canonical_url || null,
      reading_time: rest.reading_time || 4,
    }).select().single()

    if (error) throw error

    return NextResponse.json({ ok: true, data }, { status: 201 })
  } catch (error) {
    console.error("editorial create failed", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save editorial content" }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("editorial_content").select("*").order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}
