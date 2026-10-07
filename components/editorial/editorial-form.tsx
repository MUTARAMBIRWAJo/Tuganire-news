"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export type EditorialFormType = "magazine" | "research" | "story" | "history"

interface EditorialFormProps {
  contentType: EditorialFormType
  initialValues?: Record<string, any>
  authorId?: string | null
  submitLabel?: string
}

const fieldSet: Record<EditorialFormType, string[]> = {
  magazine: ["title", "slug", "subtitle", "summary", "body", "category", "tags", "status", "issue", "edition", "featured_image", "social_image"],
  research: ["title", "slug", "subtitle", "summary", "body", "category", "tags", "status", "research_question", "methodology", "main_findings", "why_it_matters_today", "featured_image", "social_image"],
  story: ["title", "slug", "subtitle", "summary", "body", "category", "tags", "status", "location", "people_subjects", "story_context", "featured_image", "social_image"],
  history: ["title", "slug", "subtitle", "summary", "body", "category", "tags", "status", "historical_date", "historical_location", "historical_event", "historical_context", "what_happened", "why_it_matters_today", "featured_image", "social_image"],
}

const defaultValues = (contentType: EditorialFormType) => ({
  content_type: contentType,
  title: "",
  slug: "",
  subtitle: "",
  summary: "",
  body: "",
  category: "",
  tags: "",
  status: "draft",
  issue: "",
  edition: "",
  research_question: "",
  methodology: "",
  main_findings: "",
  why_it_matters_today: "",
  historical_date: "",
  historical_location: "",
  historical_event: "",
  historical_context: "",
  what_happened: "",
  location: "",
  people_subjects: "",
  story_context: "",
  featured_image: "",
  social_image: "",
  language: "en",
})

export function EditorialForm({ contentType, initialValues, authorId, submitLabel = "Save" }: EditorialFormProps) {
  const [form, setForm] = useState<Record<string, any>>({
    ...defaultValues(contentType),
    ...(initialValues || {}),
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const payload = {
      ...form,
      author_id: authorId || null,
      content_type: contentType,
      tags: form.tags ? form.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) : [],
      language: form.language || "en",
      status: form.status || "draft",
      published_at: form.status === "published" && !form.published_at ? new Date().toISOString() : form.published_at || null,
    }

    try {
      const response = await fetch("/api/editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Unable to save editorial content")
      }
      setMessage("Editorial content saved successfully.")
      setForm((prev) => ({ ...prev, id: result.data?.id || prev.id }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save editorial content")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div>}

      <div className="grid gap-5 md:grid-cols-2">
        {fieldSet[contentType].map((field) => (
          <div key={field} className={field === "body" || field === "summary" || field === "historical_context" || field === "what_happened" ? "md:col-span-2" : ""}>
            <Label htmlFor={field} className="mb-2 block capitalize text-sm font-medium">
              {field.replace(/_/g, " ")}
            </Label>
            {field === "body" || field === "summary" || field === "historical_context" || field === "what_happened" || field === "main_findings" || field === "methodology" || field === "research_question" || field === "why_it_matters_today" ? (
              <Textarea id={field} value={form[field] || ""} onChange={(event) => update(field, event.target.value)} rows={field === "body" ? 10 : 5} />
            ) : (
              <Input id={field} value={form[field] || ""} onChange={(event) => update(field, event.target.value)} />
            )}
          </div>
        ))}

        <div>
          <Label htmlFor="language" className="mb-2 block text-sm font-medium">Language</Label>
          <select id="language" value={form.language || "en"} onChange={(event) => update("language", event.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-background px-3 py-2 text-sm">
            <option value="en">English</option>
            <option value="rw">Kinyarwanda</option>
          </select>
        </div>

        <div>
          <Label htmlFor="status" className="mb-2 block text-sm font-medium">Status</Label>
          <select id="status" value={form.status || "draft"} onChange={(event) => update("status", event.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-background px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  )
}
