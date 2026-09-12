export function normalizeCategorySlug(value?: string | null): string {
  const clean = (value ?? "")
    .toString()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  return clean || "uncategorized"
}

export function categoryHref(value?: string | null, locale?: "en" | "rw"): string {
  const path = `/category/${normalizeCategorySlug(value)}`
  return locale ? `/${locale}${path}` : path
}
