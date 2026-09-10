export const SUPPORTED_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "rw", label: "Kinyarwanda" },
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["value"]

export const DEFAULT_LANGUAGE: SupportedLanguage = "en"

export function normalizeLanguage(value?: string | null): SupportedLanguage {
  const candidate = (value || "").trim().toLowerCase()
  if (candidate === "rw") return "rw"
  return "en"
}

export function isSupportedLanguage(value?: string | null): value is SupportedLanguage {
  return !!value && SUPPORTED_LANGUAGES.some((lang) => lang.value === value)
}

export function getLanguageLabel(value?: string | null): string {
  const normalized = normalizeLanguage(value)
  const match = SUPPORTED_LANGUAGES.find((lang) => lang.value === normalized)
  return match?.label ?? "English"
}

export function getLanguageBadge(value?: string | null): string {
  const normalized = normalizeLanguage(value)
  return normalized === "rw" ? "RW" : "EN"
}

export function getLanguageRoutePath(language?: string | null, slug?: string): string {
  const normalized = normalizeLanguage(language)
  const safeSlug = slug ? String(slug).trim() : ""
  const suffix = safeSlug ? `/articles/${safeSlug}` : "/articles"
  return normalized === "rw" ? `/rw${suffix}` : `/en${suffix}`
}

export function getPathLanguage(pathname?: string): SupportedLanguage {
  if (!pathname) return DEFAULT_LANGUAGE
  const match = pathname.match(/^\/(en|rw)(?:\/|$)/)
  if (match?.[1]) return match[1] as SupportedLanguage
  return DEFAULT_LANGUAGE
}
