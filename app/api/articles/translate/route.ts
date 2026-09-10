import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { generateStoryGroupId, isMultilingualSchemaError, normalizeArticleLanguage } from "@/lib/articleTranslations"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser()
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { sourceArticleId, targetLanguage } = await req.json()
    if (!sourceArticleId) {
      return NextResponse.json({ error: "sourceArticleId is required" }, { status: 400 })
    }

    const normalizedTarget = normalizeArticleLanguage(targetLanguage)
    if (!normalizedTarget || (normalizedTarget !== "en" && normalizedTarget !== "rw")) {
      return NextResponse.json({ error: "Unsupported target language" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: sourceArticle, error: sourceError } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, content, status, category_id, featured_image, author_id, language, story_group_id")
      .eq("id", sourceArticleId)
      .single()

    if (sourceError || !sourceArticle) {
      if (isMultilingualSchemaError(sourceError)) {
        return NextResponse.json({ error: "Multilingual schema not applied. Run the article migration in Supabase before creating translations." }, { status: 400 })
      }
      return NextResponse.json({ error: "Source article not found" }, { status: 404 })
    }

    if (!sourceArticle.story_group_id) {
      const groupId = generateStoryGroupId()
      const { error: updateError } = await supabase
        .from("articles")
        .update({ story_group_id: groupId })
        .eq("id", sourceArticle.id)

      if (updateError) {
        if (isMultilingualSchemaError(updateError)) {
          return NextResponse.json({ error: "Multilingual schema not applied. Run the article migration in Supabase before creating translations." }, { status: 400 })
        }
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      sourceArticle.story_group_id = groupId
    }

    if (normalizeArticleLanguage(sourceArticle.language) === normalizedTarget) {
      return NextResponse.json({ error: "Source and target language must differ" }, { status: 400 })
    }

    const { data: existingTranslation, error: lookupError } = await supabase
      .from("articles")
      .select("id, title, slug, status, language, story_group_id")
      .eq("story_group_id", sourceArticle.story_group_id)
      .eq("language", normalizedTarget)
      .maybeSingle()

    if (lookupError) {
      if (isMultilingualSchemaError(lookupError)) {
        return NextResponse.json({ error: "Multilingual schema not applied. Run the article migration in Supabase before creating translations." }, { status: 400 })
      }
      return NextResponse.json({ error: lookupError.message }, { status: 500 })
    }

    if (existingTranslation) {
      return NextResponse.json({ article: existingTranslation, existing: true }, { status: 200 })
    }

    const baseTitle = (sourceArticle.title || "Untitled article").trim()
    const targetSlug = `${(baseTitle || "article").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "article"}-${normalizedTarget}`

    const translationPayload = {
      title: `${baseTitle}${normalizedTarget === "rw" ? " - Kinyarwanda" : " - English"}`,
      slug: targetSlug,
      excerpt: sourceArticle.excerpt || null,
      content: sourceArticle.content || "",
      status: "draft",
      category_id: sourceArticle.category_id || null,
      featured_image: sourceArticle.featured_image || null,
      author_id: sourceArticle.author_id || me.id,
      language: normalizedTarget,
      story_group_id: sourceArticle.story_group_id,
      article_type: "text",
      seo_title: null,
      seo_description: null,
      seo_keywords: null,
      is_featured: false,
      is_breaking: false,
      is_editor_pick: false,
    }

    const { data: createdArticle, error: insertError } = await supabase
      .from("articles")
      .insert(translationPayload)
      .select("id, title, slug, status, language, story_group_id")
      .single()

    if (insertError) {
      if (isMultilingualSchemaError(insertError)) {
        return NextResponse.json({ error: "Multilingual schema not applied. Run the article migration in Supabase before creating translations." }, { status: 400 })
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ article: createdArticle, existing: false }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Translation failed" }, { status: 500 })
  }
}
