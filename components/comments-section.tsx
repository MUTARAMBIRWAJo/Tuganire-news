"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getLocaleFromPath, t } from "@/lib/i18n"
import { usePathname } from "next/navigation"

type CommentItem = {
  id: string
  name: string
  content: string
  created_at: string
}

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const locale = getLocaleFromPath(usePathname())

  const load = async () => {
    try {
      setLoadingList(true)
      const res = await fetch(`/api/public/comments/${encodeURIComponent(slug)}`)
      if (res.ok) {
        const data = await res.json()
        setComments(Array.isArray(data.comments) ? data.comments : [])
      }
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/public/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_slug: slug, name: name.trim(), email: email.trim() || undefined, content: content.trim() })
      })
      if (res.ok) {
        setName("")
        setEmail("")
        setContent("")
        setJustSubmitted(true)
        await load()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(t("failedToPostComment", locale))
      }
    } catch {
      alert(t("failedToPostComment", locale))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-4">{t("comments", locale)}</h2>
      {justSubmitted && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-sm">
          <span className="font-medium">{t("pendingApproval", locale)}</span>
          <button className="text-amber-900/70 hover:text-amber-900" onClick={()=>setJustSubmitted(false)} aria-label={t("dismiss", locale)}>✕</button>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3 mb-8">
        <input type="text" name="website" aria-hidden="true" tabIndex={-1} className="hidden" onChange={() => {}} value="" readOnly />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Input placeholder={t("namePlaceholder", locale)} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Input placeholder={t("emailOptional", locale)} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <Textarea placeholder={t("writeComment", locale)} value={content} onChange={(e) => setContent(e.target.value)} required rows={4} />
        <div>
          <Button type="submit" disabled={loading}>{loading ? t("submitting", locale) : t("postComment", locale)}</Button>
        </div>
      </form>

      {loadingList ? (
        <div className="text-slate-500">{t("loading", locale)} {t("comments", locale).toLowerCase()}...</div>
      ) : comments.length === 0 ? (
        <div className="text-slate-500">{t("noComments", locale)}</div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 bg-white dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                <span className="font-medium">{c.name}</span> • {new Date(c.created_at).toLocaleString()}
              </div>
              <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line">{c.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
