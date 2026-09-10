import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { normalizeLanguage } from "@/lib/languages"

export const runtime = "nodejs"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Invalid article id" }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const requestedLanguage = typeof body.language === "string" ? body.language.trim().toLowerCase() : ""
  const targetLanguage = normalizeLanguage(requestedLanguage)
  const currentLanguage = normalizeLanguage(typeof body.currentLanguage === "string" ? body.currentLanguage : "")

  if (requestedLanguage !== "en" && requestedLanguage !== "rw") {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 })
  }

  if (targetLanguage === currentLanguage) {
    return NextResponse.json({ error: "The selected language must be different from the current language" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id, author_id, language, story_group_id, published_at, created_at, title")
    .eq("id", id)
    .single()

  if (articleError || !article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 })
  }

  const role = String(user.role || "").toLowerCase()
  const canEditAny = ["admin", "superadmin", "editor"].includes(role)
  if (!canEditAny) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (article.language && normalizeLanguage(article.language) === targetLanguage) {
    return NextResponse.json({ error: "Article is already classified under the selected language" }, { status: 400 })
  }

  if (article.story_group_id) {
    const { data: existingTarget, error: targetCheckError } = await supabase
      .from("articles")
      .select("id, language, story_group_id")
      .eq("story_group_id", article.story_group_id)
      .eq("language", targetLanguage)
      .neq("id", article.id)
      .maybeSingle()

    if (targetCheckError) {
      console.error("Language conflict lookup failed", targetCheckError)
      return NextResponse.json({ error: "Unable to verify language conflict" }, { status: 500 })
    }

    if (existingTarget) {
      return NextResponse.json(
        {
          error: "A translation already exists for this article group in the target language. Review the existing article before changing classification.",
          conflict: true,
          existingArticle: existingTarget,
        },
        { status: 409 }
      )
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("articles")
    .update({ language: targetLanguage })
    .eq("id", id)
    .select("id, language, story_group_id, published_at, created_at, title")
    .single()

  if (updateError || !updated) {
    if (updateError?.code === "23505") {
      return NextResponse.json(
        {
          error: "A translation already exists for this article group in the target language. Review the existing article before changing classification.",
          conflict: true,
        },
        { status: 409 }
      )
    }
    console.error("Language change failed", updateError)
    return NextResponse.json({ error: "Unable to update article language" }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    article: updated,
    previousLanguage: normalizeLanguage(article.language),
    newLanguage: updated.language,
    message: "Article language changed successfully.",
  })
}
