const trailingCtaPattern = /(?:read\s+(?:(?:the\s+)?full\s+story|more|all(?:\s+about\s+it)?(?:\s+here)?|all\s+here|full\s+story\s+here)|soma\s+inkuru\s+yose\s+hano)\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]*$/iu
const trailingEmojiPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+$/u

export function cleanExcerpt(value?: string | null): string {
  if (!value) return ""

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(trailingCtaPattern, "")
    .replace(trailingEmojiPattern, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function cleanArticlePreview(value?: string | null, maxCharacters = 160): string {
  const cleaned = cleanExcerpt(value)
  if (!cleaned) return ""
  if (cleaned.length <= maxCharacters) return cleaned

  const shortened = cleaned.slice(0, maxCharacters).replace(/\s+\S*$/, "").trim()
  return `${shortened || cleaned.slice(0, maxCharacters).trim()}…`
}

export function formatArticleDate(value: string | null | undefined, locale: "en" | "rw" = "en"): string {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const day = date.getUTCDate()
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const englishMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const kinyarwandaMonths = ["Mutarama", "Gashyantare", "Werurwe", "Mata", "Gicurasi", "Kamena", "Nyakanga", "Kanama", "Nzeri", "Ukwakira", "Ugushyingo", "Ukuboza"]

  return locale === "rw"
    ? `${day} ${kinyarwandaMonths[month]} ${year}`
    : `${englishMonths[month]} ${day}, ${year}`
}