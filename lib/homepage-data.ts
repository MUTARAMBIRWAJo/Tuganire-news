import type { Locale } from "@/lib/i18n"

export interface HomepageAuthor {
  name: string
  role: string
  avatar: string | null
}

export interface HomepageArticle {
  id: string
  slug: string
  category: string
  title: string
  excerpt: string
  image: string | null
  imageAlt: string
  author: HomepageAuthor
  publishedAt: string | null
  readTime: number
  featured: boolean
  breaking: boolean
  sponsored: boolean
  views?: number | null
}

export interface HomepageSourceArticle {
  id?: string | null
  slug?: string | null
  story_group_id?: string | null
  category?: string | { name?: string | null; slug?: string | null } | null
  category_name?: string | { name?: string | null; slug?: string | null } | null
  title?: string | null
  excerpt?: string | null
  content?: string | null
  featured_image?: string | null
  image?: string | null
  image_alt?: string | null
  author_display_name?: string | null
  author_role?: string | null
  author_avatar_url?: string | null
  authors?: { display_name?: string | null; role?: string | null; avatar_url?: string | null } | null
  published_at?: string | null
  read_time?: number | null
  readTime?: number | null
  views_count?: number | null
  is_breaking?: boolean | null
  is_sponsored?: boolean | null
  sponsored?: boolean | null
}

export function toHomepageArticle(source: HomepageSourceArticle, locale: Locale = "en", featured = false): HomepageArticle {
  const title = source.title?.trim() || "Untitled story"
  const authorName = source.author_display_name || source.authors?.display_name || "Tuganire Newsroom"
  const categoryValue = source.category_name || source.category
  const category = typeof categoryValue === "string" ? categoryValue : categoryValue?.name || categoryValue?.slug || (locale === "rw" ? "Amakuru" : "News")

  return {
    id: String(source.id || source.slug || title),
    slug: String(source.slug || ""),
    category,
    title,
    excerpt: source.excerpt || source.content || "",
    image: source.featured_image || source.image || null,
    imageAlt: source.image_alt || title,
    author: {
      name: authorName,
      role: source.author_role || source.authors?.role || "Newsroom",
      avatar: source.author_avatar_url || source.authors?.avatar_url || null,
    },
    publishedAt: source.published_at || null,
    readTime: Math.max(1, Number(source.read_time || source.readTime || 4)),
    featured,
    breaking: Boolean(source.is_breaking),
    sponsored: Boolean(source.is_sponsored || source.sponsored),
    views: source.views_count ?? null,
  }
}

export function formatKigaliDate(value: string | null, locale: Locale = "en") {
  if (!value) return locale === "rw" ? "Ubu" : "Just now"
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Kigali",
    day: "numeric",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value))
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value || ""
  const month = locale === "rw"
    ? ["Mutarama", "Gashyantare", "Werurwe", "Mata", "Gicurasi", "Kamena", "Nyakanga", "Kanama", "Nzeri", "Ukwakira", "Ugushyingo", "Ukuboza"][Number(getPart("month")) - 1]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(getPart("month")) - 1]
  return locale === "rw"
    ? `${getPart("day")} ${month} ${getPart("year")} ${getPart("hour")}:${getPart("minute")}`
    : `${getPart("day")} ${month} ${getPart("year")} ${getPart("hour")} :${getPart("minute")}`
}

