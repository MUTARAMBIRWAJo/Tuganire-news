/**
 * Editorial validation engine.
 * Runs all publication requirement checks and returns a detailed report.
 * Used by both API routes (server-side) and the article form (client-side via import).
 */

import { wordCount } from "./readingTime"

export interface ValidationResult {
  canPublish: boolean
  errors: string[]       // Blocking — must be fixed before publishing
  warnings: string[]     // Non-blocking — recommendations
  score: number          // 0–100 editorial quality score
}

export function validateArticleForPublishing(data: {
  title?: string
  content?: string
  featuredImage?: string
  metaDescription?: string
  articleType?: string
}): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const isVideo = (data.articleType || "text") === "video"

  // 1. Minimum word count (800 words for text articles)
  if (!isVideo) {
    const words = wordCount(data.content || "")
    if (words < 800) {
      errors.push(`Minimum 800 words required (current: ${words} words)`)
    } else if (words < 1000) {
      warnings.push(`Article is ${words} words — aim for 1,000+ for better SEO ranking`)
    }
  }

  // 2. Featured image
  if (!data.featuredImage || !data.featuredImage.trim()) {
    errors.push("Featured image is required")
  }

  // 3. Meta description
  const descLen = (data.metaDescription || "").trim().length
  if (descLen === 0) {
    errors.push("Meta description (SEO description) is required")
  } else if (descLen < 120) {
    warnings.push(`Meta description too short (${descLen} chars — aim for 120–165)`)
  } else if (descLen > 165) {
    warnings.push(`Meta description too long (${descLen} chars — max 165)`)
  }

  // 4. Title length
  const titleLen = (data.title || "").trim().length
  if (titleLen < 10) {
    errors.push("Title is too short (minimum 10 characters)")
  } else if (titleLen < 50) {
    warnings.push(`Title is short (${titleLen} chars — aim for 50–70 for SEO)`)
  } else if (titleLen > 110) {
    warnings.push(`Title is very long (${titleLen} chars — consider shortening)`)
  }

  // 5. Placeholder content detection
  const placeholderPatterns = [/\blorem ipsum\b/i, /\[insert\b/i, /\[your\s+\w/i, /\bcoming soon\b/i]
  for (const pattern of placeholderPatterns) {
    if (pattern.test(data.title || "") || pattern.test(data.content || "")) {
      errors.push("Placeholder content detected — replace before publishing")
      break
    }
  }

  // 6. Internal links (non-video)
  if (!isVideo && data.content) {
    const linkCount = (data.content.match(/href=["']\//gi) || []).length
    if (linkCount === 0) {
      warnings.push("No internal links found — add at least 2 links to related articles")
    } else if (linkCount < 2) {
      warnings.push(`Only ${linkCount} internal link — add at least 2 for better SEO`)
    }
  }

  // 7. Image alt text (non-video)
  if (!isVideo && data.content) {
    const imgTags = data.content.match(/<img[^>]+>/gi) || []
    const missingAlt = imgTags.filter((img) => !/alt=["'][^"']+["']/i.test(img)).length
    if (missingAlt > 0) {
      warnings.push(`${missingAlt} image(s) missing alt text — add descriptive alt attributes`)
    }
  }

  // Calculate score (100 - penalties)
  const errorPenalty = errors.length * 20
  const warningPenalty = warnings.length * 5
  const score = Math.max(0, Math.min(100, 100 - errorPenalty - warningPenalty))

  return {
    canPublish: errors.length === 0,
    errors,
    warnings,
    score,
  }
}
