"use client"

import { availableLocales, setLocale, getLocaleFromPath, t } from "@/lib/i18n"
import { useState } from "react"
import { usePathname } from "next/navigation"

export function LocaleSwitcher() {
  const pathname = usePathname()
  const current = getLocaleFromPath(pathname)
  const locales = availableLocales()
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as "en" | "rw"
    setLocale(next)

    if (typeof window === "undefined") return
    
    setIsLoading(true)

    const pathname = window.location.pathname
    const match = pathname.match(/^\/(en|rw)?\/articles\/([^/?#]+)(?:[/?#]|$)/)
    if (match) {
      const slug = match[2]
      
      try {
        // Get the current article to find its story_group_id
        const currentLang = match[1] || "en"
        const res = await fetch(`/api/public/articles/${encodeURIComponent(slug)}?lang=${currentLang}`)
        if (res.ok) {
          const { article } = await res.json()
          
          if (article?.story_group_id) {
            // Find the translation using the helper endpoint
            const translationRes = await fetch(`/api/articles/translation-lookup?story_group=${encodeURIComponent(article.story_group_id)}&lang=${next}`)
            if (translationRes.ok) {
              const { article: translatedArticle } = await translationRes.json()
              if (translatedArticle?.slug) {
                setIsLoading(false)
                window.location.assign(`/${next}/articles/${translatedArticle.slug}`)
                return
              }
            }
          }
        }
      } catch (error) {
        console.error("Error finding translation:", error)
      }
      
      setIsLoading(false)
      window.alert(t("translationUnavailable", next))
      return
    }

    const rootMatch = pathname.match(/^\/(en|rw)(?:\/.*)?$/)
    if (rootMatch && rootMatch[1] !== next) {
      setIsLoading(false)
      const normalized = pathname.replace(/^\/(en|rw)/, "") || "/"
      const target = next === "rw" ? `/rw${normalized}` : `/en${normalized}`
      window.location.assign(`${target}${window.location.search}${window.location.hash}`)
      return
    }

    setIsLoading(false)
    const fallback = next === "rw" ? "/rw" : "/en"
    window.location.assign(fallback)
  }

  return (
    <select
      suppressHydrationWarning
      aria-label={t("switchLanguage", current)}
      onChange={handleChange}
      value={current}
      className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  )
}
