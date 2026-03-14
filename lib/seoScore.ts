/**
 * SEO scoring utility — scores articles 0–100 based on key SEO signals.
 * Can be used server-side or client-side (no Node.js-only APIs).
 */

export interface SeoScoreCheck {
  pass: boolean
  note: string
  weight: number
}

export interface SeoScoreResult {
  score: number
  grade: "A" | "B" | "C" | "D" | "F"
  warnings: string[]
  checks: Record<string, SeoScoreCheck>
}

export function calculateSeoScore(data: {
  title?: string
  seoTitle?: string
  metaDescription?: string
  content?: string
  featuredImage?: string
  keywords?: string[]
}): SeoScoreResult {
  const warnings: string[] = []
  const checks: Record<string, SeoScoreCheck> = {}

  // Title length — 15 pts
  const title = (data.seoTitle || data.title || "").trim()
  const titleLen = title.length
  const titlePass = titleLen >= 50 && titleLen <= 70
  checks.titleLength = {
    pass: titlePass,
    note:
      titleLen === 0
        ? "Title is missing"
        : titleLen < 50
        ? `Title too short (${titleLen} chars — aim for 50–70)`
        : titleLen > 70
        ? `Title too long (${titleLen} chars — max 70)`
        : `Good title length (${titleLen} chars)`,
    weight: 15,
  }
  if (!titlePass) warnings.push(checks.titleLength.note)

  // Meta description — 15 pts
  const desc = (data.metaDescription || "").trim()
  const descLen = desc.length
  const descPass = descLen >= 120 && descLen <= 165
  checks.metaDescription = {
    pass: descPass,
    note:
      descLen === 0
        ? "Meta description is missing"
        : descLen < 120
        ? `Meta description too short (${descLen} chars — min 120)`
        : descLen > 165
        ? `Meta description too long (${descLen} chars — max 165)`
        : `Good meta description (${descLen} chars)`,
    weight: 15,
  }
  if (!descPass) warnings.push(checks.metaDescription.note)

  // Content length — 20 pts
  const plain = (data.content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim()
  const words = plain.split(/\s+/).filter(Boolean).length
  const contentPass = words >= 800
  checks.contentLength = {
    pass: contentPass,
    note:
      words < 300
        ? `Content very short (${words} words — target 800+)`
        : words < 600
        ? `Content short (${words} words — target 800+)`
        : words < 800
        ? `Content near target (${words} words — need 800+)`
        : `Good content length (${words} words)`,
    weight: 20,
  }
  if (!contentPass) warnings.push(`Content too short: ${words} words (minimum 800 for SEO)`)

  // Featured image — 15 pts
  const imagePass = !!(data.featuredImage && data.featuredImage.trim())
  checks.featuredImage = {
    pass: imagePass,
    note: imagePass ? "Featured image present" : "Missing featured image",
    weight: 15,
  }
  if (!imagePass) warnings.push("Missing featured image")

  // Keywords — 10 pts
  const kws = Array.isArray(data.keywords) ? data.keywords.filter(Boolean) : []
  const keywordsPass = kws.length >= 2
  checks.keywords = {
    pass: keywordsPass,
    note:
      kws.length === 0
        ? "No SEO keywords defined"
        : kws.length < 2
        ? "Add at least 2 SEO keywords"
        : `${kws.length} keywords defined`,
    weight: 10,
  }
  if (!keywordsPass) warnings.push("Add at least 2 SEO keywords")

  // Internal links — 10 pts
  const internalLinks = ((data.content || "").match(/href=["'](\/[^"']*)/gi) || []).length
  const internalLinksPass = internalLinks >= 2
  checks.internalLinks = {
    pass: internalLinksPass,
    note:
      internalLinks === 0
        ? "No internal links found"
        : internalLinks < 2
        ? `Only ${internalLinks} internal link (need 2+)`
        : `${internalLinks} internal links`,
    weight: 10,
  }
  if (!internalLinksPass) warnings.push("Add at least 2 internal links to related articles")

  // Image alt attributes — 5 pts
  const imgTags = ((data.content || "").match(/<img[^>]+>/gi) || [])
  const missingAlt = imgTags.filter((tag) => !/alt=["'][^"']+["']/i.test(tag)).length
  const altPass = imgTags.length === 0 || missingAlt === 0
  checks.imageAlt = {
    pass: altPass,
    note:
      imgTags.length === 0
        ? "No inline images"
        : missingAlt === 0
        ? "All images have alt text"
        : `${missingAlt} image(s) missing alt text`,
    weight: 5,
  }
  if (!altPass) warnings.push(`${missingAlt} image(s) missing alt text`)

  // Keyword presence in content — 5 pts
  let kwInContent = kws.length === 0
  if (kws.length > 0 && plain) {
    const lc = plain.toLowerCase()
    kwInContent = kws.some((kw) => lc.includes(kw.toLowerCase()))
  }
  checks.keywordPresence = {
    pass: kwInContent,
    note:
      kws.length === 0
        ? "No keywords to check"
        : kwInContent
        ? "Keywords found in content"
        : "Keywords not found in content body",
    weight: 5,
  }
  if (!kwInContent && kws.length > 0) warnings.push("Keywords not found in article content — incorporate them naturally")

  // Calculate total
  let totalWeight = 0
  let earned = 0
  for (const check of Object.values(checks)) {
    totalWeight += check.weight
    if (check.pass) earned += check.weight
  }

  const score = Math.round((earned / totalWeight) * 100)
  const grade: "A" | "B" | "C" | "D" | "F" =
    score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F"

  return { score, grade, warnings, checks }
}
