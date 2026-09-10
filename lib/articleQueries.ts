/**
 * Language-aware article query helpers
 * All article queries MUST include language filtering
 */

import type { SupabaseClient } from "@supabase/supabase-js"

export type SupportedLanguage = "en" | "rw"

export function normalizeLanguage(lang?: string | null): SupportedLanguage {
  return lang?.toLowerCase() === "rw" ? "rw" : "en"
}

/**
 * Get published articles for a specific language
 */
export async function getPublishedArticles(
  sb: SupabaseClient,
  language: SupportedLanguage,
  options: {
    limit?: number
    offset?: number
    order?: "published_at" | "views_count" | "likes_count" | "created_at"
    orderDirection?: "asc" | "desc"
  } = {}
) {
  const { limit = 20, offset = 0, order = "published_at", orderDirection = "desc" } = options

  return sb
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, language, story_group_id, author:app_users(id, display_name, avatar_url), category:categories(name, slug)"
    )
    .eq("language", language)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order(order, { ascending: orderDirection === "asc" })
    .range(offset, offset + limit - 1)
}

/**
 * Get article by slug and language
 */
export async function getArticleBySlug(
  sb: SupabaseClient,
  slug: string,
  language: SupportedLanguage
) {
  return sb
    .from("articles")
    .select(
      "*, author:app_users(id, display_name, avatar_url, bio, role, twitter_url, linkedin_url, instagram_url, website), category:categories(id, name, slug)"
    )
    .eq("slug", slug)
    .eq("language", language)
    .eq("status", "published")
    .maybeSingle()
}

/**
 * Get articles by category and language
 */
export async function getArticlesByCategory(
  sb: SupabaseClient,
  categoryId: number | string,
  language: SupportedLanguage,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options

  return sb
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, language, story_group_id, author:app_users(id, display_name, avatar_url), category:categories(name, slug)"
    )
    .eq("category_id", categoryId)
    .eq("language", language)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1)
}

/**
 * Get related articles - same category and language, excluding current article
 */
export async function getRelatedArticles(
  sb: SupabaseClient,
  articleId: string,
  categoryId: number,
  language: SupportedLanguage,
  limit: number = 6
) {
  return sb
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, language, story_group_id, author:app_users(display_name, avatar_url), category:categories(name, slug)"
    )
    .eq("category_id", categoryId)
    .eq("language", language)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .neq("id", articleId)
    .order("published_at", { ascending: false })
    .limit(limit)
}

/**
 * Get translation of an article from its story_group_id
 */
export async function getArticleTranslation(
  sb: SupabaseClient,
  storyGroupId: string | null | undefined,
  targetLanguage: SupportedLanguage,
  publishedOnly: boolean = true
) {
  if (!storyGroupId) return { data: null, error: null }

  let query = sb
    .from("articles")
    .select("id, slug, language, status, published_at")
    .eq("story_group_id", storyGroupId)
    .eq("language", targetLanguage)

  if (publishedOnly) {
    query = query.eq("status", "published")
  }

  return query.maybeSingle()
}

/**
 * Get all versions of an article (all languages for same story_group_id)
 * Only returns published versions
 */
export async function getArticleVersions(
  sb: SupabaseClient,
  storyGroupId: string | null | undefined
) {
  if (!storyGroupId) return { data: [], error: null }

  return sb
    .from("articles")
    .select("id, slug, language, status, published_at, title")
    .eq("story_group_id", storyGroupId)
    .eq("status", "published")
    .order("language", { ascending: true })
}

/**
 * Search articles by title/excerpt and language
 */
export async function searchArticles(
  sb: SupabaseClient,
  query: string,
  language: SupportedLanguage,
  options: { limit?: number } = {}
) {
  const { limit = 20 } = options

  return sb
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, language, author:app_users(display_name), category:categories(name)"
    )
    .eq("language", language)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("published_at", { ascending: false })
    .limit(limit)
}

/**
 * Get trending articles (most viewed in last N days) for a language
 */
export async function getTrendingArticles(
  sb: SupabaseClient,
  language: SupportedLanguage,
  days: number = 7,
  limit: number = 10
) {
  const daysAgo = new Date()
  daysAgo.setDate(daysAgo.getDate() - days)

  return sb
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, language, author:app_users(display_name), category:categories(name)"
    )
    .eq("language", language)
    .eq("status", "published")
    .not("published_at", "is", null)
    .gte("published_at", daysAgo.toISOString())
    .order("views_count", { ascending: false })
    .limit(limit)
}

/**
 * Get most popular articles by likes for a language
 */
export async function getMostLikedArticles(
  sb: SupabaseClient,
  language: SupportedLanguage,
  limit: number = 10
) {
  return sb
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, language, author:app_users(display_name), category:categories(name)"
    )
    .eq("language", language)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .gt("likes_count", 0)
    .order("likes_count", { ascending: false })
    .limit(limit)
}

/**
 * Get most commented articles for a language
 * Note: This requires a separate join with comments table
 */
export async function getMostCommentedArticles(
  sb: SupabaseClient,
  language: SupportedLanguage,
  limit: number = 10
) {
  return sb
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, language, author:app_users(display_name), category:categories(name)"
    )
    .eq("language", language)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit)
}

/**
 * Get latest articles for a language (most recently published)
 */
export async function getLatestArticles(
  sb: SupabaseClient,
  language: SupportedLanguage,
  limit: number = 10
) {
  return sb
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, language, story_group_id, author:app_users(display_name, avatar_url), category:categories(name, slug)"
    )
    .eq("language", language)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit)
}
