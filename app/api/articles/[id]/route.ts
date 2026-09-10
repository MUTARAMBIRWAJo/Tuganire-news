import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

const editableFields = [
  "title",
  "slug",
  "excerpt",
  "content",
  "status",
  "category_id",
  "featured_image",
  "video_url",
  "videos",
  "article_type",
  "youtube_link",
  "seo_title",
  "seo_description",
  "seo_keywords",
] as const

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: "Invalid article id" }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const sb = url && serviceKey
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()

  const { data: existing, error: lookupError } = await sb
    .from("articles")
    .select("id, author_id, created_at, published_at, language, story_group_id")
    .eq("id", id)
    .single()

  if (lookupError || !existing) return NextResponse.json({ error: "Article not found" }, { status: 404 })

  const role = String(user.role || "").toLowerCase()
  const canEditAny = ["admin", "superadmin", "editor"].includes(role)
  if (!canEditAny && !(role === "reporter" && existing.author_id === user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const content = typeof body.content === "string" ? body.content.trim() : ""
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  for (const field of editableFields) {
    if (field in body) update[field] = body[field]
  }
  update.title = title
  update.content = content
  update.updated_at = new Date().toISOString()

  // Publication time is immutable after first publication. A draft may receive its
  // first publication timestamp only when the requested status becomes published.
  if (existing.published_at || update.status !== "published") {
    delete update.published_at
  } else {
    update.published_at = new Date().toISOString()
  }

  delete update.id
  delete update.created_at
  delete update.story_group_id
  delete update.author_id

  const { data: updated, error: updateError } = await sb
    .from("articles")
    .update(update)
    .eq("id", id)
    .select("id, created_at, published_at, updated_at, language, story_group_id, status, featured_image")
    .single()

  if (updateError || !updated) {
    console.error("Article update failed", updateError)
    return NextResponse.json({ error: "Unable to update article" }, { status: 500 })
  }

  const firstPublication = !existing.published_at && Boolean(updated.published_at)
  const timestampsPreserved = existing.created_at === updated.created_at &&
    (firstPublication || existing.published_at === updated.published_at)
  const identityPreserved = existing.story_group_id === updated.story_group_id
  if (!timestampsPreserved || !identityPreserved) {
    console.error("Article update verification failed", { id, existing, updated })
    return NextResponse.json({ error: "Article update verification failed" }, { status: 500 })
  }

  return NextResponse.json({ article: updated })
}
