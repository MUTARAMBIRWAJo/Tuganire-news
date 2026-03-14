"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Trash2, Loader2 } from "lucide-react"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { SimpleToast } from "@/components/ui/simple-toast"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed with ${res.status}`)
  }
  const json = await res.json()
  if (json && json.error) throw new Error(json.error)
  return json
}

export type ReporterArticlesListProps = {
  q?: string
  status?: string
  category?: string
  from?: string
  to?: string
  page: number
  pageSize?: number
  editLabel?: string
}

export function ReporterArticlesList(props: ReporterArticlesListProps) {
  const { q = "", status = "", category = "", from = "", to = "", page, pageSize = 10, editLabel = "Edit" } = props
  const [toast, setToast] = useState<string>("")
  const router = useRouter()
  const [navigatingId, setNavigatingId] = useState<string>("")

  const query = useMemo(() => {
    const p = new URLSearchParams()
    if (q) p.set("q", q)
    if (status) p.set("status", status)
    if (category) p.set("category", category)
    if (from) p.set("from", from)
    if (to) p.set("to", to)
    p.set("page", String(page))
    p.set("pageSize", String(pageSize))
    return p.toString()
  }, [q, status, category, from, to, page, pageSize])

  const { data, isLoading, error, mutate } = useSWR<{ items: any[]; count: number; page: number; pageSize: number }>(
    `/api/reporter/articles?${query}`,
    fetcher
  )

  const items = data?.items || []
  const total = data?.count || 0

  async function advanceStatus(id: string) {
    // optimistic: move status forward locally
    const prev = data
    const nextItems = items.map((it) => {
      if (it.id !== id) return it
      const cur = String(it.status || "").toLowerCase()
      const next = cur === "draft" ? "submitted" : cur === "submitted" ? "published" : "published"
      return { ...it, status: next }
    })
    mutate({ ...(prev as any), items: nextItems }, false)
    const res = await fetch("/api/reporter/articles/advance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (!res.ok) {
      // revert on failure
      mutate(prev, false)
    } else {
      const json = await res.json()
      setToast(`Status updated to ${json.next}`)
      mutate()
    }
  }

  async function deleteArticle(id: string) {
    const prev = data
    const nextItems = items.filter((it) => it.id !== id)
    mutate({ ...(prev as any), items: nextItems, count: Math.max(0, (prev?.count || 1) - 1) }, false)
    const res = await fetch("/api/reporter/articles/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (!res.ok) {
      mutate(prev, false)
    } else {
      setToast("Article deleted")
      mutate()
    }
  }

  return (
    <div>
      <SimpleToast message={toast} />
      {isLoading ? (
        <p className="text-slate-600">Loading...</p>
      ) : error ? (
        <p className="text-red-600">Failed to load articles. Please try again later.</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You have no articles yet. Create your first article to get started!</p>
          <Button asChild>
            <Link href="/dashboard/reporter/articles/new">Create Article</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((article) => {
            const cat = Array.isArray(article.category) ? article.category?.[0] : article.category
            const articleType = String(article.article_type || "text").toLowerCase() === "video" ? "video" : "text"
            return (
              <div key={article.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{article.title}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        articleType === "video"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {articleType === "video" ? "Video" : "Text"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        article.status === "Published"
                          ? "bg-green-100 text-green-700"
                          : article.status === "InReview"
                          ? "bg-yellow-100 text-yellow-700"
                          : article.status === "Draft"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {article.status}
                    </span>
                    {article.is_featured && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Featured</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{article.excerpt || "No excerpt available"}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{cat?.name || "Uncategorized"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views_count} views
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNavigatingId(article.id)
                      router.push(`/dashboard/reporter/articles/${article.id}/edit`)
                    }}
                    disabled={navigatingId === article.id}
                  >
                    {navigatingId === article.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editLabel}
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        {editLabel}
                      </>
                    )}
                  </Button>
                  {String(article.status).toLowerCase() !== "published" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNavigatingId(article.id)
                        router.push(`/dashboard/reporter/articles/${article.id}/edit`)
                      }}
                      disabled={navigatingId === article.id}
                    >
                      {navigatingId === article.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Modify
                        </>
                      ) : (
                        <>
                          <Edit className="mr-2 h-4 w-4" />
                          Modify
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => advanceStatus(article.id)}
                    disabled={String(article.status).toLowerCase() === "published"}
                  >
                    Advance Status
                  </Button>
                  <ConfirmButton
                    type="button"
                    confirmMessage="Delete this article?"
                    className="px-2 py-1 rounded border text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => deleteArticle(article.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
