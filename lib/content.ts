const trailingCtaPattern = /(?:read\s+(?:the\s+)?(?:full\s+)?story\s+here|read\s+more\s+here|soma\s+inkuru\s+yose\s+hano)\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]*$/iu
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