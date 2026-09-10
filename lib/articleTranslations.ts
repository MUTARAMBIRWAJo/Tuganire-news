export type SupportedStoryLanguage = "en" | "rw"

export function isMultilingualSchemaError(error: any): boolean {
  const message = String(
    error?.message || error?.details || error?.hint || error || ""
  )

  return /Could not find the 'language' column|Could not find the 'story_group_id' column|column .*language.*does not exist|column .*story_group_id.*does not exist/i.test(message)
}

/**
 * Checks if the multilingual schema is available.
 * If the schema is not available, this will throw an error to prevent
 * creating articles without language and story_group_id.
 */
export async function ensureMultilingualSchema(supabaseClient: any): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from("articles")
      .select("id, language, story_group_id")
      .limit(1)

    if (error && isMultilingualSchemaError(error)) {
      throw new Error(
        "Multilingual database schema is not available. " +
        "The 'language' and 'story_group_id' columns must exist on the articles table. " +
        "Please apply the migration: supabase/migrations/20260901_multilingual_articles.sql"
      )
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Multilingual database schema")) {
      throw error
    }
    if (isMultilingualSchemaError(error)) {
      throw new Error(
        "Multilingual database schema is not available. " +
        "The 'language' and 'story_group_id' columns must exist on the articles table. " +
        "Please apply the migration: supabase/migrations/20260901_multilingual_articles.sql"
      )
    }
  }
}

/**
 * Builds article payload with required multilingual fields.
 * All articles MUST have language and story_group_id.
 * This is not optional.
 */
export function buildArticlePayload(
  payload: Record<string, any>,
  language: string,
  storyGroupId: string
): Record<string, any> {
  if (!language || !storyGroupId) {
    throw new Error("buildArticlePayload requires both language and storyGroupId")
  }

  const next = { ...payload }
  next.language = normalizeArticleLanguage(language)
  next.story_group_id = storyGroupId

  return next
}

export function normalizeArticleLanguage(value?: string | null): SupportedStoryLanguage {
  const candidate = (value || "").trim().toLowerCase()
  if (candidate === "rw") return "rw"
  return "en"
}

export function getTargetLanguage(currentLanguage?: string | null): SupportedStoryLanguage | null {
  const language = normalizeArticleLanguage(currentLanguage)
  return language === "en" ? "rw" : language === "rw" ? "en" : null
}

export function generateStoryGroupId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `story-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

export function buildTranslationSlug(sourceSlug?: string | null, targetLanguage?: string | null, fallbackTitle?: string) {
  const base = ((sourceSlug || fallbackTitle || "article") as string)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180)

  const suffix = normalizeArticleLanguage(targetLanguage) === "rw" ? "-rw" : "-en"
  const candidate = base ? `${base}${suffix}` : `article${suffix}`

  return candidate.replace(/-+/g, "-").replace(/(^-|-$)/g, "") || `article${suffix}`
}
