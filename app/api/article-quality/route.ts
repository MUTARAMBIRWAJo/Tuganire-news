import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

function wordCountFromHtml(html: string): number {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

/**
 * Approximate Flesch readability score.
 * Returns 0–100; higher = more readable.
 */
function readabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const words = text.split(/\s+/).filter(Boolean)
  if (sentences.length === 0 || words.length === 0) return 50

  const syllables = words.reduce((acc: number, word: string) => {
    const count = word.toLowerCase().replace(/[^aeiou]/g, "").length || 1
    return acc + count
  }, 0)

  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length
  const flesch = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  return Math.max(0, Math.min(100, Math.round(flesch)))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      articleId = "",
      title = "",
      content = "",
      metaDescription = "",
      keywords = [],
      featuredImage = "",
      articleType = "text",
    } = body

    const isVideo = articleType === "video"
    const plain = (content || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").trim()
    const words = wordCountFromHtml(content || "")
    const suggestions: string[] = []
    const errors: string[] = []
    let score = 100

    // ── Word count ──────────────────────────────────────────────────────────
    if (!isVideo) {
      if (words < 800) {
        errors.push(`Content is ${words} words — minimum 800 required for publishing`)
        score -= 30
      } else if (words < 1000) {
        suggestions.push(`Content is ${words} words — consider expanding to 1,000+ for better ranking`)
        score -= 10
      } else if (words > 3500) {
        suggestions.push("Article is very long — consider splitting into a series for engagement")
      }
    }

    // ── Title ────────────────────────────────────────────────────────────────
    const titleLen = (title || "").trim().length
    if (titleLen < 10) {
      errors.push("Title is too short — write a descriptive headline")
      score -= 20
    } else if (titleLen < 50) {
      suggestions.push(`Title is ${titleLen} chars — aim for 50–70 characters for optimal SEO`)
      score -= 5
    } else if (titleLen > 80) {
      suggestions.push(`Title is ${titleLen} chars — keep under 70 chars for best search display`)
      score -= 3
    }

    // ── Meta description ─────────────────────────────────────────────────────
    const descLen = (metaDescription || "").trim().length
    if (descLen === 0) {
      errors.push("Meta description is missing — required for SEO and AdSense readiness")
      score -= 15
    } else if (descLen < 120) {
      suggestions.push(`Meta description is ${descLen} chars — expand to 120–165 characters`)
      score -= 7
    } else if (descLen > 165) {
      suggestions.push(`Meta description is ${descLen} chars — shorten to under 165 characters`)
      score -= 3
    }

    // ── Featured image ────────────────────────────────────────────────────────
    if (!featuredImage) {
      errors.push("Featured image is missing — required for publishing")
      score -= 15
    }

    // ── Internal links ────────────────────────────────────────────────────────
    if (!isVideo) {
      const internalLinks = ((content || "").match(/href=["']\//gi) || []).length
      if (internalLinks === 0) {
        suggestions.push("No internal links found — add at least 2 links to related articles")
        score -= 8
      } else if (internalLinks < 2) {
        suggestions.push(`Only ${internalLinks} internal link — add at least 2 for better SEO`)
        score -= 4
      }
    }

    // ── Image alt text ────────────────────────────────────────────────────────
    if (!isVideo) {
      const imgTags = ((content || "").match(/<img[^>]+>/gi) || [])
      const missingAlt = imgTags.filter((img: string) => !/alt=["'][^"']+["']/i.test(img)).length
      if (missingAlt > 0) {
        suggestions.push(
          `${missingAlt} image(s) missing alt text — add descriptive alt attributes for accessibility and SEO`,
        )
        score -= missingAlt * 3
      }
    }

    // ── Keyword density ───────────────────────────────────────────────────────
    const kws = Array.isArray(keywords) ? keywords.filter(Boolean) : []
    if (kws.length < 2) {
      suggestions.push("Add at least 2 SEO keywords to improve search visibility")
      score -= 5
    } else if (plain) {
      const lc = plain.toLowerCase()
      const missingKws = kws.filter((kw: string) => !lc.includes(kw.toLowerCase()))
      if (missingKws.length > 0) {
        suggestions.push(
          `Keywords not found in content: ${missingKws.join(", ")} — incorporate them naturally`,
        )
        score -= 5
      }
    }

    // ── Readability ────────────────────────────────────────────────────────────
    if (!isVideo && plain.length > 200) {
      const readability = readabilityScore(plain)
      if (readability < 30) {
        suggestions.push("Content seems complex — use shorter sentences for better readability")
        score -= 5
      }
    }

    // ── Paragraph structure ────────────────────────────────────────────────────
    if (!isVideo) {
      const paragraphs = (content || "").match(/<p[^>]*>[\s\S]*?<\/p>/gi) || []
      if (paragraphs.length < 3) {
        suggestions.push("Add more paragraphs to improve article structure and readability")
        score -= 3
      }
    }

    // ── Placeholder detection ──────────────────────────────────────────────────
    if (/lorem ipsum|coming soon|\[insert|\[your /i.test(`${title} ${content}`)) {
      errors.push("Placeholder content detected — replace with real content before publishing")
      score -= 20
    }

    const finalScore = Math.max(0, Math.min(100, score))
    const grade =
      finalScore >= 90 ? "A" : finalScore >= 75 ? "B" : finalScore >= 60 ? "C" : finalScore >= 40 ? "D" : "F"

    const result = {
      score: finalScore,
      grade,
      canPublish: errors.length === 0,
      errors,
      suggestions,
      wordCount: words,
    }

    if (articleId) {
      const sb = getServiceClient()
      if (sb) {
        const readability = !isVideo && plain.length > 200 ? readabilityScore(plain) : null
        const keywordDensityScore = Array.isArray(kws) && kws.length > 0 && plain
          ? Math.max(
              0,
              100 - kws.filter((kw: string) => !plain.toLowerCase().includes(kw.toLowerCase())).length * 20,
            )
          : null

        await sb.from("article_quality_reports").insert({
          article_id: articleId,
          seo_score: finalScore,
          content_score: finalScore,
          readability_score: readability,
          originality_score: errors.some((e) => /placeholder/i.test(e)) ? 30 : 85,
          keyword_density_score: keywordDensityScore,
          adsense_ready: errors.length === 0,
          publish_ready: errors.length === 0,
          warnings: suggestions,
          suggestions,
          report: result,
        })
      }
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
