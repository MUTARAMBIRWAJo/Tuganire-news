import { createClient } from "@/lib/supabase/server"

export type EditorialContentType = "magazine" | "research" | "story" | "history"
export type EditorialStatus = "draft" | "pending" | "published" | "rejected"
export type SupportedEditorialLanguage = "en" | "rw"

export interface EditorialRecord {
  id: string
  content_type: EditorialContentType
  title: string
  slug: string
  subtitle?: string | null
  summary?: string | null
  body?: string | null
  language: SupportedEditorialLanguage
  author_id?: string | null
  category?: string | null
  tags?: string[] | null
  status: EditorialStatus
  featured_image?: string | null
  social_image?: string | null
  seo_title?: string | null
  seo_description?: string | null
  canonical_url?: string | null
  reading_time?: number | null
  published_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  issue?: string | null
  edition?: string | null
  research_question?: string | null
  methodology?: string | null
  main_findings?: string | null
  why_it_matters_today?: string | null
  historical_date?: string | null
  historical_month?: number | null
  historical_day?: number | null
  historical_year?: number | null
  historical_location?: string | null
  historical_event?: string | null
  historical_context?: string | null
  what_happened?: string | null
  location?: string | null
  people_subjects?: string | null
  story_context?: string | null
  past_context?: string | null
  what_changed?: string | null
  related_story_ids?: string[] | null
  related_article_slugs?: string[] | null
  related_research_ids?: string[] | null
  metadata?: Record<string, unknown> | null
}

export interface EditorialSource {
  id: string
  editorial_content_id: string
  source_name?: string | null
  organization?: string | null
  url?: string | null
  publication_date?: string | null
  source_type?: string | null
  notes?: string | null
  sort_order?: number | null
}

export interface EditorialMedia {
  id: string
  editorial_content_id: string
  media_type: "image" | "video"
  storage_path?: string | null
  url?: string | null
  thumbnail_url?: string | null
  caption?: string | null
  alt_text?: string | null
  sort_order?: number | null
  is_featured?: boolean | null
}

export interface EditorialHomepageItem {
  id: string
  content_type: EditorialContentType
  title: string
  slug: string
  subtitle?: string | null
  summary?: string | null
  body?: string | null
  language: SupportedEditorialLanguage
  category?: string | null
  tags?: string[] | null
  status: EditorialStatus
  featured_image?: string | null
  social_image?: string | null
  published_at?: string | null
  reading_time?: number | null
  issue?: string | null
  edition?: string | null
  historical_date?: string | null
  author_name?: string | null
}

export function normalizeLanguage(value?: string | null): SupportedEditorialLanguage {
  return value === "rw" ? "rw" : "en"
}

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item"
}

export function getTodayInHistoryMatch(date = new Date()) {
  return {
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
}

export async function getHomepageEditorial(locale: "en" | "rw" = "en", limit = 4) {
  const supabase = await createClient()
  const language = normalizeLanguage(locale)

  const selectColumns = "id, content_type, title, slug, subtitle, summary, body, language, category, tags, status, featured_image, social_image, published_at, reading_time, issue, edition, historical_date, author_id"

  const primaryQuery = supabase
    .from("editorial_content")
    .select(selectColumns)
    .eq("status", "published")
    .eq("language", language)

  let result = await primaryQuery
    .order("content_priority", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (result.error && /content_priority|does not exist|column .* not found/i.test(String(result.error.message || ""))) {
    result = await primaryQuery
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit)
  }

  if (result.error) {
    console.error("getHomepageEditorial error", result.error)
    return [] as EditorialHomepageItem[]
  }

  return (result.data || []).map((item) => ({
    id: item.id,
    content_type: item.content_type,
    title: item.title,
    slug: item.slug,
    subtitle: item.subtitle,
    summary: item.summary,
    body: item.body,
    language: normalizeLanguage(item.language),
    category: item.category,
    tags: item.tags || [],
    status: item.status,
    featured_image: item.featured_image,
    social_image: item.social_image,
    published_at: item.published_at,
    reading_time: item.reading_time,
    issue: item.issue,
    edition: item.edition,
    historical_date: item.historical_date,
    author_name: null,
  })) as EditorialHomepageItem[]
}

export async function getEditorialBySlug(contentType: EditorialContentType, slug: string) {
  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from("editorial_content")
    .select("*")
    .eq("content_type", contentType)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()

  if (error) {
    console.error("getEditorialBySlug error", error)
    return null
  }

  if (!item) return null

  const [{ data: sources }, { data: media }] = await Promise.all([
    supabase.from("editorial_sources").select("*").eq("editorial_content_id", item.id).order("sort_order", { ascending: true }),
    supabase.from("editorial_media").select("*").eq("editorial_content_id", item.id).order("sort_order", { ascending: true }),
  ])

  return { ...item, sources: sources || [], media: media || [] }
}

export async function listEditorialContent(type?: EditorialContentType) {
  const supabase = await createClient()
  let query = supabase.from("editorial_content").select("*").order("published_at", { ascending: false, nullsFirst: false })
  if (type) query = query.eq("content_type", type)
  const { data, error } = await query
  if (error) {
    console.error("listEditorialContent error", error)
    return [] as EditorialRecord[]
  }
  return (data || []) as EditorialRecord[]
}

export async function listPublishedEditorialContent(type?: EditorialContentType, language?: SupportedEditorialLanguage, limit?: number) {
  const supabase = await createClient()
  let query = supabase
    .from("editorial_content")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })

  if (type) query = query.eq("content_type", type)
  if (language) query = query.eq("language", normalizeLanguage(language))
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) {
    console.error("listPublishedEditorialContent error", error)
    return [] as EditorialRecord[]
  }

  return (data || []) as EditorialRecord[]
}

export async function getTodayInHistoryEntry(language: SupportedEditorialLanguage = "en") {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("editorial_content")
    .select("*")
    .eq("status", "published")
    .eq("content_type", "history")
    .eq("language", normalizeLanguage(language))
    .order("published_at", { ascending: false, nullsFirst: false })

  if (error || !data?.length) {
    return null
  }

  const today = getTodayInHistoryMatch(new Date())
  const match = data.find((item) => Number(item.historical_month ?? 0) === today.month && Number(item.historical_day ?? 0) === today.day)
  return (match || data[0]) as EditorialRecord | null
}

export async function saveEditorialContent(payload: Partial<EditorialRecord> & { sources?: Partial<EditorialSource>[]; media?: Partial<EditorialMedia>[]; id?: string }) {
  const supabase = await createClient()
  const { sources, media, id, ...rest } = payload
  const editorialPayload = {
    ...rest,
    tags: rest.tags || [],
    related_story_ids: rest.related_story_ids || [],
    related_article_slugs: rest.related_article_slugs || [],
    related_research_ids: rest.related_research_ids || [],
    metadata: rest.metadata || {},
    content_type: rest.content_type || "story",
    language: normalizeLanguage(rest.language as string | undefined),
  }

  let record: EditorialRecord | null = null
  if (id) {
    const { data, error } = await supabase.from("editorial_content").update(editorialPayload).eq("id", id).select().single()
    if (error) throw error
    record = data as EditorialRecord
  } else {
    const { data, error } = await supabase.from("editorial_content").insert(editorialPayload).select().single()
    if (error) throw error
    record = data as EditorialRecord
  }

  if (!record) throw new Error("Editorial content could not be saved.")

  if (sources) {
    await supabase.from("editorial_sources").delete().eq("editorial_content_id", record.id)
    if (sources.length > 0) {
      await supabase.from("editorial_sources").insert(sources.map((source, index) => ({ ...source, editorial_content_id: record.id, sort_order: index })))
    }
  }

  if (media) {
    await supabase.from("editorial_media").delete().eq("editorial_content_id", record.id)
    if (media.length > 0) {
      await supabase.from("editorial_media").insert(media.map((item, index) => ({ ...item, editorial_content_id: record.id, sort_order: index })))
    }
  }

  return record
}
