export type SponsoredLabel = "Sponsored" | "Partner Content" | "Promoted Story"

function asLower(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

export function getSponsoredLabel(source: Record<string, unknown> | null | undefined): SponsoredLabel | null {
  if (!source) return null

  if (source.is_sponsored === true) return "Sponsored"
  if (source.is_partner_content === true) return "Partner Content"
  if (source.is_promoted_story === true) return "Promoted Story"

  const contentLabel = asLower(source.content_label)
  const promotionType = asLower(source.promotion_type)
  const articleType = asLower(source.article_type)

  if (contentLabel.includes("partner") || promotionType.includes("partner")) return "Partner Content"
  if (contentLabel.includes("promot") || promotionType.includes("promot") || articleType.includes("promot")) return "Promoted Story"
  if (contentLabel.includes("sponsor") || promotionType.includes("sponsor") || articleType.includes("sponsor")) return "Sponsored"

  return null
}

export function getFactCheckLabel(source: Record<string, unknown> | null | undefined): string | null {
  if (!source) return null

  if (source.is_fact_checked === true || source.fact_checked === true || source.verified === true) {
    return "Fact-checked"
  }

  const raw = asLower(source.fact_check_status || source.factcheck_status || source.verification_status)
  if (!raw) return null

  if (raw.includes("check") || raw.includes("verified") || raw.includes("confirmed")) {
    return "Fact-checked"
  }
  if (raw.includes("review") || raw.includes("pending")) {
    return "Fact-check in review"
  }

  return null
}

export function socialLinksFromAuthor(author: Record<string, unknown> | null | undefined) {
  if (!author) return []

  const candidates = [
    { label: "X", href: String(author.twitter_url || author.x_url || "") },
    { label: "LinkedIn", href: String(author.linkedin_url || "") },
    { label: "Instagram", href: String(author.instagram_url || "") },
    { label: "Website", href: String(author.website_url || author.website || "") },
  ]

  return candidates.filter((entry) => /^https?:\/\//i.test(entry.href))
}
