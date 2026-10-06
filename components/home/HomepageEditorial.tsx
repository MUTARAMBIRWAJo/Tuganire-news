"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock3,
  Copy,
  Eye,
  Facebook,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"
import { t, type Locale } from "@/lib/i18n"
import { cleanArticlePreview } from "@/lib/content"
import { formatKigaliDate, type HomepageArticle } from "@/lib/homepage-data"

interface HomepageEditorialProps {
  articles: HomepageArticle[]
  hero: HomepageArticle | null
  mostRead: HomepageArticle[]
  locale: Locale
}

const BOOKMARKS_KEY = "tuganire-bookmarks"
const SEARCH_RECENTS_KEY = "tuganire-search-recents"

function StoryImage({
  article,
  eager = false,
  className = "",
  locale,
}: {
  article: HomepageArticle
  eager?: boolean
  className?: string
  locale?: Locale
}) {
  if (!article.image) {
    return (
      <div className="flex h-full items-end bg-[linear-gradient(135deg,#0A1931,#00A1DE)] p-4 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
        {t("brand", locale ?? "en")}
      </div>
    )
  }

  return (
    <Image
      src={article.image}
      alt={article.imageAlt || article.title}
      fill
      loading={eager ? "eager" : "lazy"}
      className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${className}`}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  )
}

function StoryMeta({ article, locale }: { article: HomepageArticle; locale: Locale }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <span>{formatKigaliDate(article.publishedAt, locale)}</span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock3 className="size-3" />
        {article.readTime} {t("minutesRead", locale)}
      </span>
    </div>
  )
}

function ShareButtons({
  article,
  onToast,
  locale,
}: {
  article: HomepageArticle
  onToast: (message: string) => void
  locale: Locale
}) {
  const url = `https://www.tuganire.site/articles/${article.slug}`
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(article.title)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      onToast(locale === "rw" ? "Ihuza ryakozwe" : "Link copied")
    } catch {
      onToast(locale === "rw" ? "Kopi ntabwo ihari" : "Copy unavailable")
    }
  }

  return (
    <div className="flex items-center gap-1" aria-label={locale === "rw" ? "Sangiza inkuru" : "Share story"}>
      <a
        href={`https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on X"
        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <X className="size-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on Facebook"
        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Facebook className="size-4" />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on WhatsApp"
        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Send className="size-4" />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label={locale === "rw" ? "Kopi inkuru" : "Copy story link"}
        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Copy className="size-4" />
      </button>
    </div>
  )
}

function SearchOverlay({
  articles,
  locale,
  onClose,
}: {
  articles: HomepageArticle[]
  locale: Locale
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [recents, setRecents] = useState<string[]>([])

  useEffect(() => {
    try {
      setRecents(JSON.parse(localStorage.getItem(SEARCH_RECENTS_KEY) || "[]"))
    } catch {
      setRecents([])
    }
  }, [])

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [onClose])

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []

    return articles
      .filter((article) => `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(term))
      .slice(0, 6)
  }, [articles, query])

  const useRecent = (value: string) => {
    setQuery(value)
    const next = [value, ...recents.filter((item) => item !== value)].slice(0, 5)
    setRecents(next)
    localStorage.setItem(SEARCH_RECENTS_KEY, JSON.stringify(next))
  }

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#0A1931]/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={locale === "rw" ? "Shakisha Tuganire Amakuru" : "Search Tuganire News"}
    >
      <div className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-950">
        <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <Search className="size-5 text-[#00A1DE]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim()) useRecent(query.trim())
            }}
            placeholder={t("searchReporting", locale)}
            className="min-w-0 flex-1 bg-transparent text-base outline-none"
          />
          <button type="button" onClick={onClose} aria-label={locale === "rw" ? "Funga gushakisha" : "Close search"}>
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4">
          {!query && recents.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {t("recentSearches", locale)}
              </p>
              <div className="flex flex-wrap gap-2">
                {recents.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => useRecent(item)}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold dark:bg-slate-800"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && matches.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">{t("noMatchingStories", locale)}</p>
          )}

          {matches.map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/articles/${article.slug}`}
              onClick={onClose}
              className="flex gap-3 border-b border-slate-200 py-3 last:border-0 dark:border-slate-800"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                <StoryImage article={article} locale={locale} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00A1DE]">{article.category}</p>
                <p className="text-sm font-bold leading-snug">{article.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function NewsletterCard({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      return
    }

    setStatus("loading")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      })

      if (!response.ok) throw new Error("Subscription endpoint unavailable")

      setStatus("success")
      setEmail("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="rounded-xl border border-[#00A1DE]/25 bg-[#e9f8fd] p-5 dark:bg-[#082b3d]">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid size-9 place-items-center rounded-full bg-[#00A1DE] text-white">
          <Send className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0087b8]">
            {t("newsletterLabel", locale)}
          </p>
          <h3 className="font-black text-slate-950 dark:text-white">{t("stayInformed", locale)}</h3>
        </div>
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{t("conciseBriefing", locale)}</p>

      {status === "success" ? (
        <p className="flex items-center gap-2 text-sm font-bold text-[#008a45]">
          <Check className="size-4" />
          {t("onTheList", locale)}
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <label htmlFor="homepage-newsletter-email" className="sr-only">
            {t("email", locale)}
          </label>
          <div className="flex gap-2">
            <input
              id="homepage-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#00A1DE] focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-lg bg-[#0A1931] px-3 py-2 text-sm font-bold text-white disabled:opacity-60 dark:bg-white dark:text-[#0A1931]"
            >
              {status === "loading" ? "..." : t("join", locale)}
            </button>
          </div>

          {status === "error" && (
            <p className="text-xs font-semibold text-red-600">{t("validEmailOrTryAgain", locale)}</p>
          )}
        </form>
      )}

      <a
        href="https://wa.me/250780000000"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0087b8] hover:underline"
      >
        {t("whatsappChannel", locale)} <ArrowRight className="size-3" />
      </a>
    </div>
  )
}

function getTopicLabel(topic: string, locale: Locale) {
  if (locale !== "rw") return topic

  const map: Record<string, string> = {
    Rwanda: "Rwanda",
    Kigali: "Kigali",
    "East Africa": "Afurika y’Iburasirazuba",
    "Public interest": "Ibyangombwa by’inyungu rusange",
    Startups: "Ibigo by’itangira",
    Elections: "Amatora",
  }

  return map[topic] ?? topic
}

export default function HomepageEditorial({ articles, hero, mostRead, locale }: HomepageEditorialProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mostReadMode, setMostReadMode] = useState<"read" | "shared">("read")
  const [visibleCount, setVisibleCount] = useState(6)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const secondary = articles.filter((article) => article.slug !== hero?.slug).slice(0, 4)
  const fallbackMostRead = mostRead.length
    ? mostRead
    : articles.slice(0, 5).map((article) => ({ ...article, views: article.views ?? 0 }))
  const displayedMostRead = [...fallbackMostRead].sort((a, b) => (b.views || 0) - (a.views || 0))

  useEffect(() => {
    try {
      setBookmarks(JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]"))
    } catch {
      setBookmarks([])
    }
  }, [])

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const toggleBookmark = (article: HomepageArticle) => {
    const next = bookmarks.includes(article.slug)
      ? bookmarks.filter((slug) => slug !== article.slug)
      : [...bookmarks, article.slug]

    setBookmarks(next)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next))
    setToast(
      next.includes(article.slug)
        ? locale === "rw"
          ? "Byabitswe mu rutonde rwo gusoma"
          : "Saved to your reading list"
        : locale === "rw"
          ? "Yakuwe mu rutonde rwo gusoma"
          : "Removed from your reading list",
    )
  }

  if (!hero && !secondary.length) return null

  const liveLabel = locale === "rw" ? "Kubiri" : "Live"
  const sponsoredLabel = locale === "rw" ? "Yatewe inkunga" : "Sponsored"
  const topicOptions = ["Rwanda", "Kigali", "East Africa", "Public interest", "Startups", "Elections"]

  return (
    <>
      <div className="mx-auto flex max-w-7xl justify-end px-4 pt-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:border-[#00A1DE] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          aria-label={t("searchNewsroom", locale)}
        >
          <Search className="size-4 text-[#00A1DE]" />
          {t("searchNewsroom", locale)}
        </button>

        <Link
          href="/dashboard/public/saved"
          className="ml-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:border-[#00A1DE] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <Bookmark className="size-4 text-[#00A1DE]" />
          {t("saved", locale)}
        </Link>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mb-5 flex items-end justify-between border-b-2 border-slate-950 pb-3 dark:border-white">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#00A1DE]">{t("brand", locale)}</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {t("latestBreakingStories", locale)}
            </h1>
          </div>
          <span className="hidden text-xs font-semibold text-slate-500 sm:block">
            {t("verifiedReporting", locale)}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(250px,0.7fr)]">
            {hero && (
              <article className="group relative min-h-[390px] overflow-hidden rounded-xl bg-[#0A1931] text-white shadow-xl md:min-h-[475px]">
                <Link href={`/${locale}/articles/${hero.slug}`} className="absolute inset-0">
                  <StoryImage article={hero} eager className="opacity-85" locale={locale} />
                </Link>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061326] via-[#061326]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FAD201]">
                    {hero.breaking && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2 py-1 text-[10px] text-white">
                        <span className="size-1.5 animate-pulse rounded-full bg-white" />
                        {locale === "rw" ? "Yihutirwa" : "Breaking"}
                      </span>
                    )}
                    <span>{hero.category}</span>
                  </div>

                  <h2 className="max-w-2xl text-3xl font-black leading-[1.02] tracking-tight text-white sm:text-4xl lg:text-5xl">
                    <Link href={`/${locale}/articles/${hero.slug}`}>{hero.title}</Link>
                  </h2>
                  <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-slate-200">
                    {cleanArticlePreview(hero.excerpt, 150)}
                  </p>
                  <div className="mt-4">
                    <StoryMeta article={hero} locale={locale} />
                  </div>
                </div>
              </article>
            )}

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              {secondary.slice(0, 3).map((article) => (
                <article
                  key={article.id}
                  className="group grid grid-cols-[112px_minmax(0,1fr)] gap-3 border-b border-slate-200 pb-4 dark:border-slate-800"
                >
                  <Link href={`/${locale}/articles/${article.slug}`} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                    <StoryImage article={article} locale={locale} />
                  </Link>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#00A1DE]">
                      {article.category}
                    </p>
                    <h3 className="line-clamp-3 text-sm font-bold leading-snug text-slate-950 group-hover:text-[#0087b8] dark:text-white">
                      <Link href={`/${locale}/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <div className="mt-2">
                      <StoryMeta article={article} locale={locale} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="border-t-4 border-[#FAD201] bg-[#0A1931] p-4 text-white lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-1 rounded-lg bg-white/10 p-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setMostReadMode("read")}
                  className={`rounded-md px-2 py-1 ${mostReadMode === "read" ? "bg-white text-[#0A1931]" : "text-white/70"}`}
                >
                  {t("mostRead", locale)}
                </button>
                <button
                  type="button"
                  onClick={() => setMostReadMode("shared")}
                  className={`rounded-md px-2 py-1 ${mostReadMode === "shared" ? "bg-white text-[#0A1931]" : "text-white/70"}`}
                >
                  {t("shared", locale)}
                </button>
              </div>
              <Eye className="size-4 text-[#FAD201]" />
            </div>

            <ol className="divide-y divide-white/15">
              {displayedMostRead.slice(0, 5).map((article, index) => (
                <li key={article.id} className="group flex gap-3 py-4 first:pt-0">
                  <span className="text-3xl font-black leading-none text-[#00A1DE]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link href={`/${locale}/articles/${article.slug}`} className="text-sm font-bold leading-snug text-white group-hover:text-[#FAD201]">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <div className="mt-7 hidden min-h-[90px] items-center justify-center border border-dashed border-slate-300 bg-white text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:flex dark:border-slate-700 dark:bg-slate-900/40">
          {t("advertisement", locale)} · 728 × 90
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
          <div>
            <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00A1DE]">
                  {t("newsroomFeed", locale)}
                </p>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">{t("latestNewsSection", locale)}</h2>
              </div>
              <Link href={`/${locale}/articles`} className="inline-flex items-center gap-1 text-sm font-bold text-[#0087b8]">
                {t("viewAll", locale)} <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {articles.slice(0, visibleCount).map((article) => (
                <article key={article.id} className="group grid gap-4 py-5 first:pt-0 sm:grid-cols-[200px_minmax(0,1fr)]">
                  <Link href={`/${locale}/articles/${article.slug}`} className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                    <StoryImage article={article} locale={locale} />
                  </Link>
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#00A1DE]">
                      {article.breaking && (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <span className="size-1.5 animate-pulse rounded-full bg-red-600" />
                          {liveLabel}
                        </span>
                      )}
                      <span>{article.category}</span>
                      {article.sponsored && <span className="text-slate-500">{sponsoredLabel}</span>}
                    </div>
                    <h3 className="text-xl font-bold leading-tight text-slate-950 group-hover:text-[#0087b8] dark:text-white">
                      <Link href={`/${locale}/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {cleanArticlePreview(article.excerpt, 180)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <StoryMeta article={article} locale={locale} />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleBookmark(article)}
                          aria-label={bookmarks.includes(article.slug) ? (locale === "rw" ? "Bikoreho" : "Remove bookmark") : locale === "rw" ? "Bika inkuru" : "Bookmark story"}
                          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {bookmarks.includes(article.slug) ? (
                            <BookmarkCheck className="size-4 text-[#00A1DE]" />
                          ) : (
                            <Bookmark className="size-4" />
                          )}
                        </button>
                        <ShareButtons article={article} onToast={setToast} locale={locale} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {visibleCount < articles.length ? (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => Math.min(count + 4, articles.length))}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-900 hover:border-[#00A1DE] dark:border-slate-700 dark:text-white"
              >
                <span className="size-2 animate-pulse rounded-full bg-[#00A1DE]" />
                {t("loadMoreStories", locale)}
              </button>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="More stories loading">
                <div className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <NewsletterCard locale={locale} />
            <div className="flex min-h-[250px] items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:border-slate-700 dark:bg-slate-900">
              {t("advertisement", locale)} · 300 × 250
            </div>
            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
              <h2 className="mb-3 font-black text-slate-950 dark:text-white">{t("exploreTopics", locale)}</h2>
              <div className="flex flex-wrap gap-2">
                {topicOptions.map((topic) => (
                  <Link
                    key={topic}
                    href={`/${locale}/search?q=${encodeURIComponent(topic)}`}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#00A1DE] hover:text-white dark:bg-slate-800 dark:text-slate-200"
                  >
                    {getTopicLabel(topic, locale)}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-[#1d335a] bg-[#0A1931] text-white shadow-[0_30px_80px_-40px_rgba(10,25,49,0.9)]">
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#FAD201]">
                <Sparkles className="size-4" /> {t("investigations", locale)}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl lg:text-[2.1rem]">{t("investigationsHeadline", locale)}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{t("investigationsDescription", locale)}</p>
            </div>
            <Link href={`/${locale}/search?q=${encodeURIComponent(locale === "rw" ? "amateka" : "history")}`} className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/10">
              {t("viewAll", locale)}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="p-5 sm:p-7 lg:p-8">
            <div className="mb-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200/90">
              {[
                locale === "rw" ? "Amateka" : "History",
                locale === "rw" ? "Ubushakashatsi" : "Research",
                locale === "rw" ? "Magazine" : "Magazine",
                locale === "rw" ? "Archive" : "Archive",
              ].map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5">{tag}</span>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.9fr)]">
              <article className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-950/20">
                <Link href={articles[0] ? `/${locale}/articles/${articles[0].slug}` : `/${locale}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                    {articles[0] ? <StoryImage article={articles[0]} eager locale={locale} className="" /> : <div className="flex h-full items-end bg-[linear-gradient(135deg,#0A1931,#00A1DE)] p-4 text-xs font-bold uppercase tracking-[0.16em] text-white/80">{t("brand", locale)}</div>}
                    <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#FAD201] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0A1931]">{locale === "rw" ? "Amateka" : "History"}</span>
                      <span className="rounded-full bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-100">{t("featured", locale)}</span>
                    </div>
                  </div>
                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                      <span>{articles[0]?.category || (locale === "rw" ? "Amateka" : "History")}</span>
                      <span aria-hidden="true">•</span>
                      <span>{articles[0] ? formatKigaliDate(articles[0].publishedAt, locale) : locale === "rw" ? "Uyu munsi" : "Today"}</span>
                    </div>
                    <h3 className="text-2xl font-black leading-tight tracking-[-0.03em] text-white sm:text-[2rem]">{articles[0]?.title || (locale === "rw" ? "Tuganire Igenzura gitangiwe mu byahise" : "Tuganire Igenzura begins with the past")}</h3>
                    <p className="max-w-2xl text-sm leading-7 text-slate-300">{articles[0]?.excerpt || (locale === "rw" ? "Kugira ngo dusobanukire ibiri kuba uyu munsi, dushobora gusuzuma ibyabaye kera, ibimenyetso byabyo n'ingaruka zibikurikiraho." : "To understand the present, we look at the decisions, institutions and changes that shaped what came next.")}</p>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{articles[0]?.readTime || 6} {t("minutesRead", locale)}</span>
                        <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" />{t("verified", locale)}</span>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-[#00A1DE]">{t("readArticle", locale)} <ArrowRight className="size-4" /></span>
                    </div>
                  </div>
                </Link>
              </article>

              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-[#113052] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00A1DE]">{locale === "rw" ? "Uyu munsi mu mateka" : "Today in history"}</p>
                  <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/20 p-3 text-sm text-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">{new Intl.DateTimeFormat(locale === "rw" ? "fr-FR" : "en-US", { day: "2-digit", month: "long", year: "numeric" }).format(new Date())}</div>
                    <div className="mt-2 text-xl font-black text-white">{locale === "rw" ? "Kuze kubyabaye kera" : "Past decisions, present realities"}</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{locale === "rw" ? "Dushaka gusobanukirwa uko ibyabaye kera byahinduye imibereho, imiyoborere n'ubundi buzima bw'uyu munsi." : "We trace how historical decisions, institutions and everyday changes still shape present-day life."}</p>
                  <Link href={articles[1] ? `/${locale}/articles/${articles[1].slug}` : `/${locale}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#FAD201]">
                    {t("readArticle", locale)} <ArrowRight className="size-4" />
                  </Link>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAD201]">{locale === "rw" ? "Impamvu bikiri ingenzi uyu munsi" : "Why it still matters today"}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{locale === "rw" ? "Amateka ntabwo ari ibisigo gusa; ni uburyo bwo gusobanukirwa ibibazo by'ubu, inzego z'ubuzima, amahame y'iterambere n'ubuzima bwa buri munsi." : "History is not a static archive: it helps explain the institutions, development choices and daily realities shaping life today."}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00A1DE]">{locale === "rw" ? "Tuganire Magazine" : "Tuganire Magazine"}</p>
                  <h3 className="mt-1 text-xl font-black text-white">{locale === "rw" ? "Inkuru ntoya n'ubushakashatsi" : "Short stories and background reporting"}</h3>
                </div>
                <Link href={`/${locale}/search?q=${encodeURIComponent(locale === "rw" ? "amateka" : "history")}`} className="text-sm font-bold text-[#FAD201] hover:underline">{t("viewAll", locale)}</Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(articles.slice(1, 5) || []).map((article, index) => (
                  <Link key={article.slug || article.id || index} href={`/${locale}/articles/${article.slug}`} className="group block rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-[#00A1DE]/50 hover:bg-white/10">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-800">
                      <StoryImage article={article} locale={locale} className="" />
                    </div>
                    <div className="mt-3 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00A1DE]">{article.category || (locale === "rw" ? "Amateka" : "History")}</p>
                      <h4 className="mt-2 line-clamp-3 text-base font-bold leading-snug tracking-[-0.02em] text-white group-hover:text-[#FAD201]">{article.title}</h4>
                      <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-300">{article.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {searchOpen && <SearchOverlay articles={articles} locale={locale} onClose={() => setSearchOpen(false)} />}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-[#0A1931] px-4 py-2 text-sm font-bold text-white shadow-xl"
        >
          {toast}
        </div>
      )}
    </>
  )
}
