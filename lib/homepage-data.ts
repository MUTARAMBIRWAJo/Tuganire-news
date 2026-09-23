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

export const homepageFallbackArticles: HomepageArticle[] = [
  {
    id: "fallback-kigali-transport",
    slug: "kigali-transport-reforms-put-commuters-first",
    category: "Politics",
    title: "Kigali transport reforms put commuters first as the city plans for growth",
    excerpt: "A new public consultation is examining routes, fares and safer connections between Kigali's fastest-growing neighbourhoods.",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Kigali city skyline at sunset",
    author: { name: "Tuganire Desk", role: "Newsroom", avatar: null },
    publishedAt: "2026-09-13T06:30:00+02:00",
    readTime: 5,
    featured: true,
    breaking: true,
    sponsored: false,
    views: 18420,
  },
  {
    id: "fallback-startup-boom",
    slug: "rwanda-startup-boom-new-funding-reshapes-local-business",
    category: "Business",
    title: "Rwanda's startup boom is moving from ambition to durable local business",
    excerpt: "Founders in Kigali are building for East African customers while investors look for stronger paths to sustainable revenue.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Entrepreneurs meeting in a bright Kigali office",
    author: { name: "Aline Mukamana", role: "Business reporter", avatar: null },
    publishedAt: "2026-09-12T15:10:00+02:00",
    readTime: 4,
    featured: false,
    breaking: false,
    sponsored: false,
    views: 11280,
  },
  {
    id: "fallback-amavubi",
    slug: "amavubi-qualifiers-rwanda-builds-from-the-back",
    category: "Sports",
    title: "Amavubi prepare for a decisive qualifier with a disciplined new shape",
    excerpt: "The national side is balancing a younger squad with the experience needed for a demanding East African fixture.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Football players competing under stadium lights",
    author: { name: "Eric Niyonzima", role: "Sports reporter", avatar: null },
    publishedAt: "2026-09-12T10:00:00+02:00",
    readTime: 3,
    featured: false,
    breaking: false,
    sponsored: false,
    views: 9870,
  },
  {
    id: "fallback-digital-health",
    slug: "digital-health-rwanda-clinics-reach-more-patients",
    category: "Technology",
    title: "Digital health tools help Rwanda's clinics reach more patients",
    excerpt: "Health workers are testing simpler ways to connect rural patients with specialists and reliable medical information.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Health worker reviewing information on a tablet",
    author: { name: "Tuganire Investigations", role: "Public interest desk", avatar: null },
    publishedAt: "2026-09-11T08:45:00+02:00",
    readTime: 6,
    featured: false,
    breaking: false,
    sponsored: false,
    views: 7650,
  },
  {
    id: "fallback-culture",
    slug: "kigali-creative-spaces-preserve-rwandan-stories",
    category: "Culture",
    title: "Kigali's creative spaces are making room for the next generation of Rwandan stories",
    excerpt: "Artists, filmmakers and designers are building audiences at home while keeping a close conversation with the diaspora.",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Colourful contemporary art in a gallery",
    author: { name: "Chantal Uwera", role: "Culture editor", avatar: null },
    publishedAt: "2026-09-10T17:20:00+02:00",
    readTime: 4,
    featured: false,
    breaking: false,
    sponsored: false,
    views: 6420,
  },
]
