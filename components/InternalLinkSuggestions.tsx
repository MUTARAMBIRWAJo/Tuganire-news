"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Link2 } from "lucide-react"

interface Suggestion {
  id: string
  slug: string
  title: string
  excerpt?: string | null
}

export function InternalLinkSuggestions({
  title,
  content,
  currentArticleId,
}: {
  title: string
  content: string
  currentArticleId?: string
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const hasEnoughContent = (title || "").trim().length > 12 || (content || "").replace(/<[^>]+>/g, " ").trim().length > 200
    if (!hasEnoughContent) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/internal-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, currentArticleId }),
        })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : [])
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [title, content, currentArticleId])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Link2 className="h-4 w-4 text-blue-600" />
          Internal Link Suggestions
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 ? (
          <p className="text-xs text-slate-500">
            Start writing more article content to get up to 3 relevant internal link suggestions.
          </p>
        ) : (
          suggestions.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.title}</p>
              {item.excerpt && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.excerpt}</p>}
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">/articles/{item.slug}</span>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                  <Link href={`/articles/${item.slug}`} target="_blank" rel="noopener noreferrer">
                    Open
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
