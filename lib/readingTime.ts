/**
 * Reading time utilities — word count divided by 200 wpm
 */

export function wordCount(htmlOrText: string): number {
  const plain = (htmlOrText || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim()
  if (!plain) return 0
  return plain.split(/\s+/).filter(Boolean).length
}

export function readingTime(htmlOrText: string): number {
  const words = wordCount(htmlOrText)
  return Math.max(1, Math.ceil(words / 200))
}

export function formatReadingTime(htmlOrText: string): string {
  const minutes = readingTime(htmlOrText)
  return `${minutes} min read`
}
