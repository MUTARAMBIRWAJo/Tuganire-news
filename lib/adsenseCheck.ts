/**
 * AdSense readiness checker.
 * Validates articles against Google AdSense content policies.
 */

const PROHIBITED_WORDS = [
  "xxx",
  "porn",
  "pornography",
  "adult content",
  "gambling",
  "casino",
  "bet online",
  "hacker",
  "crack software",
  "buy drugs",
  "buy guns",
  "illegal download",
]

const PLACEHOLDER_PATTERNS = [
  /\blorem ipsum\b/i,
  /\[insert\b/i,
  /\[your\s+\w/i,
  /\bcoming soon\b/i,
  /\btodo:/i,
  /\bdummy content\b/i,
  /\btest article\b/i,
  /\bplaceholder text\b/i,
]

export interface AdsenseCheckResult {
  ready: boolean
  issues: string[]
}

export function checkAdsenseReadiness(data: {
  title?: string
  content?: string
  metaDescription?: string
  featuredImage?: string
}): AdsenseCheckResult {
  const issues: string[] = []

  const combined = `${data.title || ""} ${data.content || ""}`.toLowerCase()

  // Prohibited content
  for (const word of PROHIBITED_WORDS) {
    if (combined.includes(word)) {
      issues.push(`Prohibited content detected: "${word}"`)
    }
  }

  // Placeholder text
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(data.title || "") || pattern.test(data.content || "")) {
      issues.push("Placeholder content detected — replace with real content")
      break
    }
  }

  // Content length
  const plain = (data.content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim()
  const words = plain.split(/\s+/).filter(Boolean).length
  if (words < 500) {
    issues.push(`Content too short for AdSense (${words} words — minimum 500 recommended)`)
  }

  // Meta description
  if (!data.metaDescription || data.metaDescription.trim().length < 50) {
    issues.push("Meta description missing or too short (minimum 50 characters)")
  }

  // Featured image
  if (!data.featuredImage || !data.featuredImage.trim()) {
    issues.push("Featured image missing — required for AdSense approval")
  }

  // Title
  if (!data.title || data.title.trim().length < 10) {
    issues.push("Article title too short or missing")
  }

  return {
    ready: issues.length === 0,
    issues,
  }
}
