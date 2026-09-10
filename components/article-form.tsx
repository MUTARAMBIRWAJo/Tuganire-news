"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Send, Star, Sparkles, Languages, ArrowRightLeft } from "lucide-react"
import { RichTextEditor } from "./rich-text-editor"
import { ArticleQualityPanel } from "./ArticleQualityPanel"
import { InternalLinkSuggestions } from "./InternalLinkSuggestions"
import { MediaUploader } from "./media-uploader"
import type { MediaItem } from "@/lib/types"
import { validateArticleForPublishing } from "@/lib/editorialValidation"
import { calculateSeoScore } from "@/lib/seoScore"
import { checkAdsenseReadiness } from "@/lib/adsenseCheck"
import { SUPPORTED_LANGUAGES, getLanguageLabel, isSupportedLanguage } from "@/lib/languages"
import { buildArticlePayload, generateStoryGroupId, getTargetLanguage, ensureMultilingualSchema, isMultilingualSchemaError, normalizeArticleLanguage } from "@/lib/articleTranslations"

interface ArticleFormProps {
  userId: string
  // When true, all submissions are saved as draft and publish/review actions are hidden
  forceDraft?: boolean
  // Optional path to navigate to after saving
  afterSaveHref?: string
  // Preload tag IDs for edited articles
  initialTagIds?: number[]
  article?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    status: string
    category_id: string | null
    featured_image: string | null
    language?: string | null
    story_group_id?: string | null
    created_at?: string | null
    published_at?: string | null
    updated_at?: string | null
    media: MediaItem[]
    article_type?: "text" | "video"
    youtube_link?: string | null
    seo_title?: string | null
    seo_description?: string | null
    seo_keywords?: string[] | null
    video_url?: string | null
    videos?: string[]
  }
}

export function ArticleForm({ userId, article, forceDraft, afterSaveHref, initialTagIds }: ArticleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>([])
  const [selectedTags, setSelectedTags] = useState<number[]>(initialTagIds || [])
  const [translations, setTranslations] = useState<Array<{ id: string; title: string; language: string; status: string; slug: string }>>([])

  type ArticleRow = {
    id?: string
    status?: string | null
    featured_image?: string | null
  }

  const [formData, setFormData] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    status: article?.status || "draft",
    category_id: article?.category_id || "",
    featured_image: article?.featured_image || "",
    language: isSupportedLanguage(article?.language) ? article.language! : "en",
    story_group_id: article?.story_group_id || null,
    media: article?.media || ([] as MediaItem[]),
    video_url: article?.video_url || null,
    videos: article?.videos || [],
    article_type: article?.article_type || "text",
    youtube_link: article?.youtube_link || "",
    seo_title: article?.seo_title || "",
    seo_description: article?.seo_description || "",
    seo_keywords: article?.seo_keywords || [],
  })

  const supabases = supabase
  const isVideoArticle = formData.article_type === "video"

  const refreshTranslations = async (storyGroupId?: string | null) => {
    if (!storyGroupId) {
      setTranslations([])
      return
    }

    const { data, error } = await supabases
      .from("articles")
      .select("id, title, slug, status, language, story_group_id")
      .eq("story_group_id", storyGroupId)
      .order("created_at", { ascending: true })

    if (!error && data) {
      setTranslations(
        data.map((row: any) => ({
          id: row.id,
          title: row.title || "Untitled",
          language: normalizeArticleLanguage(row.language),
          status: row.status || "draft",
          slug: row.slug || "",
        }))
      )
    }
  }

  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      const [categoriesRes, tagsRes] = await Promise.all([
        supabases.from("categories").select("id, name").order("name"),
        supabases.from("tags").select("id, name").order("name"),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (tagsRes.data) setTags(tagsRes.data)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (article?.story_group_id || formData.story_group_id) {
      refreshTranslations(article?.story_group_id || formData.story_group_id)
    } else {
      setTranslations([])
    }
  }, [article?.story_group_id, formData.story_group_id])

  // Keep selectedTags in sync if initialTagIds changes (e.g., on server fetch)
  useEffect(() => {
    if (initialTagIds && initialTagIds.length > 0) {
      setSelectedTags(initialTagIds)
    }
  }, [initialTagIds])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (article && formData.title) {
      const interval = setInterval(() => {
        handleSaveDraft()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [formData])

  const handleGenerateSEO = async () => {
    const hasBaseInput = Boolean(formData.title) && (isVideoArticle ? Boolean((formData.youtube_link || "").trim()) || Boolean(formData.content) : Boolean(formData.content))
    if (!hasBaseInput) {
      setError(isVideoArticle ? "Enter a title and YouTube link (or content) first to generate SEO metadata" : "Enter a title and content first to generate SEO metadata")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/seo-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: formData.title, 
          content: formData.content || formData.youtube_link || "",
          excerpt: formData.excerpt || ""
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setFormData((prev) => ({
        ...prev,
        seo_title: data.seoTitle || prev.seo_title || prev.title,
        seo_description: data.seoDescription || prev.seo_description || prev.excerpt,
        seo_keywords: Array.isArray(data.keywords) ? data.keywords : prev.seo_keywords,
      }))
      toast({ title: "SEO generated", description: "SEO fields populated. Review before saving." })
    } catch (e: any) {
      toast({ title: "SEO generation failed", description: e?.message || "Try again later", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 200)
      .replace(/-+$/, "")
  }

  const deriveSlug = (input: string, title: string, fallback?: string) => {
    const normalized = title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]+/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const raw = (input || '').trim() || normalized.replace(/-+/g, '-').replace(/(^-|-$)/g, '').toLowerCase();
    const candidate = raw.slice(0, 200).replace(/-+$/, '');
    if (candidate) return candidate;
    if (fallback?.trim()) return fallback.trim().slice(0, 200).replace(/-+$/, '');
    return `article-${Date.now()}`;
  }

  const getWordCount = (htmlOrText: string) => {
    const plain = (htmlOrText || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .trim()
    if (!plain) return 0
    return plain.split(/\s+/).filter(Boolean).length
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: deriveSlug(formData.slug, title, article?.slug),
    })
  }

  const handleCreateTranslation = async () => {
    if (!article?.id) {
      setError("Save this article first so it has a story group before creating a translation.")
      return
    }

    const sourceLanguage = normalizeArticleLanguage(formData.language || article?.language)
    const targetLanguage = getTargetLanguage(sourceLanguage)

    if (!targetLanguage) {
      setError("This article language is not supported for translation.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/articles/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceArticleId: article.id,
          targetLanguage,
        }),
      })

      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to create translation")
      }

      const translationId = payload?.article?.id || payload?.articleId
      if (translationId) {
        router.push(`/dashboard/articles/${translationId}/edit`)
        router.refresh()
      }

      toast({
        title: "Translation ready",
        description: payload?.existing ? "An existing translation was opened for editing." : "A new draft translation was created.",
      })
    } catch (err: any) {
      setError(err?.message || "Failed to create translation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    const youtubeLink = (formData.youtube_link || "").trim()
    if (!formData.title) return
    if (isVideoArticle && !youtubeLink) return
    if (!isVideoArticle && !formData.content) return
    // Disable auto-insert for new articles; only allow auto-save for existing articles
    if (!article) return

    const supabases = supabase

    try {
      // Ensure user is authenticated; otherwise RLS will block insert/update
      const { data: auth } = await supabases.auth.getUser()
      if (!auth?.user?.id) {
        console.warn("Auto-save skipped: not authenticated")
        return
      }

      // Ensure multilingual schema is available before proceeding
      await ensureMultilingualSchema(supabases)

      // Derive featured image if absent
      const firstMediaImage = (formData.media || []).find((m) => (m as any)?.type === 'image')?.url || null
      const firstImgMatch = (formData.content || '').match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
      const firstImgInContent = firstImgMatch ? firstImgMatch[1] : null
      const derivedFeatured = formData.featured_image || firstMediaImage || firstImgInContent || null

      const storyGroupId = formData.story_group_id || article?.story_group_id || generateStoryGroupId()
      const articleData: any = buildArticlePayload(
        {
          title: formData.title,
          slug: formData.slug || generateSlug(formData.title),
          excerpt: formData.excerpt || null,
          content: formData.content || "",
          status: article ? article.status : "draft",
          category_id: formData.category_id ? Number(formData.category_id) : null,
          featured_image: derivedFeatured,
          video_url: formData.video_url || null,
          videos: formData.videos || [],
          article_type: formData.article_type || 'text',
          youtube_link: isVideoArticle ? youtubeLink : null,
          seo_title: formData.seo_title || null,
          seo_description: formData.seo_description || null,
          seo_keywords: (formData.seo_keywords || []).length ? formData.seo_keywords : null,
          updated_at: new Date().toISOString(),
        },
        formData.language,
        storyGroupId
      )

      if (article) {
        const response = await fetch(`/api/articles/${article.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.error || "Auto-save failed")
        const updatedRow = payload?.article as ArticleRow | null
        
        // Update the form data with any server-returned values
        const row = (updatedRow ?? null) as ArticleRow | null

        if (row) {
          const immutableChanged =
            (article.created_at ?? null) !== ((row as any).created_at ?? null) ||
            (article.published_at ?? null) !== ((row as any).published_at ?? null) ||
            normalizeArticleLanguage(article.language) !== normalizeArticleLanguage((row as any).language) ||
            (article.story_group_id ?? null) !== ((row as any).story_group_id ?? null)
          if (immutableChanged) {
            console.error("Auto-save refused: immutable article metadata changed")
            return
          }
          setFormData(prev => ({
            ...prev,
            status: row.status || prev.status,
            featured_image: row.featured_image || prev.featured_image
          }))
        }
        
        toast({ 
          title: "Draft saved", 
          description: "Your changes have been saved.",
          variant: "default"
        })
      } else {
        const result = await supabases
          .from("articles")
          .insert(articleData)
          .select("id, status, featured_image")
          .single()
        
        const { data: insertedRow, error } = result as { data: ArticleRow | null; error: any }

        if (error) {
          console.error("Auto-save failed (insert):", { 
            message: error.message, 
            details: (error as any).details, 
            hint: (error as any).hint 
          })
          throw error
        }
        
        // If this was a new article, update the URL with the new ID
        const row = (insertedRow ?? null) as ArticleRow | null

        if (row?.id) {
          window.history.replaceState({}, '', `/dashboard/reporter/articles/${row.id}/edit`)
          
          // Update the form data with server-returned values
          setFormData(prev => ({
            ...prev,
            status: row.status || prev.status,
            featured_image: row.featured_image || prev.featured_image
          }))
        }
        
        toast({ 
          title: "Draft saved", 
          description: "Your draft has been saved.",
          variant: "default"
        })
      }
    } catch (err) {
      console.error("Auto-save failed (exception):", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent, submitStatus: "draft" | "pending" | "published") => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (!formData.title) {
      setError("Title is required")
      setIsLoading(false)
      return
    }
    if (!formData.language || !isSupportedLanguage(formData.language)) {
      setError("Article language is required. Please select English or Kinyarwanda.")
      setIsLoading(false)
      return
    }
    const youtubeLink = (formData.youtube_link || "").trim()

    if (isVideoArticle && !youtubeLink) {
      setError("YouTube link is required for video articles")
      setIsLoading(false)
      return
    }
    if (!isVideoArticle && !formData.content) {
      setError("Content is required for text articles")
      setIsLoading(false)
      return
    }

    // Derive the article image before checking whether the submission can still be saved as a draft.
    const firstMediaImage2 = (formData.media || []).find((m) => (m as any)?.type === 'image')?.url || null
    const firstImgMatch2 = (formData.content || '').match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
    const firstImgInContent2 = firstImgMatch2 ? firstImgMatch2[1] : null
    const derivedFeatured2 = formData.featured_image || firstMediaImage2 || firstImgInContent2 || null

    // Drafts are allowed to save without full editorial metadata; anything else falls back to draft.
    const hasRequiredEditorialMeta = Boolean(formData.category_id) && Boolean(derivedFeatured2)
    const shouldSaveAsDraft = submitStatus === "draft" || !hasRequiredEditorialMeta

    if (!shouldSaveAsDraft && !formData.category_id) {
      setError("Please select a category")
      setIsLoading(false)
      return
    }

    if (!shouldSaveAsDraft && !derivedFeatured2) {
      setError("Please upload and select a featured image")
      setIsLoading(false)
      return
    }

    try {
      // Determine the effective status for this submission.
      // If a reporter (forceDraft) is editing an existing article, preserve its current status instead of forcing to draft.
      const normalizedExisting = (article?.status || "").toLowerCase()
      const existingStatus: "draft" | "pending" | "published" | null =
        normalizedExisting === "draft"
          ? "draft"
          : normalizedExisting === "pending"
          ? "pending"
          : normalizedExisting === "published"
          ? "published"
          : null

      const effectiveStatus: "draft" | "pending" | "published" =
        article && forceDraft && existingStatus
          ? existingStatus
          : forceDraft
          ? "draft"
          : shouldSaveAsDraft
          ? "draft"
          : submitStatus === "pending"
          ? "pending"
          : submitStatus

      // Prepare article data - derive featured image from media or content
      // Note: media is stored in formData but not saved to articles table (no media column exists)
      if (effectiveStatus === "published") {
        const editorial = validateArticleForPublishing({
          title: formData.seo_title || formData.title,
          content: isVideoArticle ? "" : formData.content || "",
          featuredImage: derivedFeatured2 || "",
          metaDescription: formData.seo_description || "",
          articleType: formData.article_type || "text",
        })
        const seo = isVideoArticle
          ? { score: 100 }
          : calculateSeoScore({
              title: formData.title,
              seoTitle: formData.seo_title,
              metaDescription: formData.seo_description,
              content: formData.content,
              featuredImage: derivedFeatured2 || "",
              keywords: formData.seo_keywords || [],
            })
        const adsense = isVideoArticle
          ? { ready: true, issues: [] as string[] }
          : checkAdsenseReadiness({
              title: formData.title,
              content: formData.content,
              metaDescription: formData.seo_description,
              featuredImage: derivedFeatured2 || "",
            })

        const blocking = [
          ...editorial.errors,
          ...(seo.score < 70 ? [`SEO score ${seo.score}/100 is below the minimum 70`] : []),
          ...(!adsense.ready ? adsense.issues : []),
        ]

        if (blocking.length > 0) {
          setError(blocking.join("; "))
          setIsLoading(false)
          return
        }
      }

      const storyGroupId = article
        ? article.story_group_id || formData.story_group_id
        : formData.story_group_id || generateStoryGroupId()
      if (!storyGroupId) {
        throw new Error("Article story group is missing. Reload the article and try again.")
      }
      const articleData: any = buildArticlePayload(
        {
          title: formData.title,
          slug: formData.slug || generateSlug(formData.title),
          excerpt: formData.excerpt || null,
          content: formData.content || "",
          status: effectiveStatus,
          category_id: formData.category_id ? Number(formData.category_id) : null,
          featured_image: derivedFeatured2,
          video_url: formData.video_url || null,
          videos: formData.videos || [],
          article_type: formData.article_type || 'text',
          youtube_link: isVideoArticle ? youtubeLink : null,
          seo_title: formData.seo_title || null,
          seo_description: formData.seo_description || null,
          seo_keywords: (formData.seo_keywords || []).length ? formData.seo_keywords : null,
          updated_at: new Date().toISOString(),
        },
        formData.language,
        storyGroupId
      )

      // Only set published_at when publishing for the first time — never overwrite on edits
      if (effectiveStatus === "published" && !article?.published_at) {
        articleData.published_at = new Date().toISOString()
      }

      let articleId: string

      if (article) {
        const response = await fetch(`/api/articles/${article.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.error || "Failed to update article")
        if (!payload?.article?.id) throw new Error("Failed to update article: no data returned")

        articleId = article.id
      } else {
        const result = await supabases
          .from("articles")
          .insert({ ...articleData, author_id: userId })
          .select("id")
          .single()
        
        const { data, error } = result as { data: { id: string } | null; error: any }

        if (error) {
          console.error("Insert error:", error)
          if (isMultilingualSchemaError(error)) {
            throw new Error("The Supabase multilingual migration is not applied yet. Run the SQL migration for the articles table, then retry saving.")
          }

          const errorMessage = error?.message 
            || error?.error 
            || (typeof error === 'string' ? error : JSON.stringify(error))
            || "Failed to create article"
          throw new Error(errorMessage)
        }

        if (!data || !data.id) {
          throw new Error("Failed to create article: no ID returned")
        }

        articleId = data.id
      }

      // Update tags: always delete existing, then insert selected (if any)
      if (articleId) {
        try {
          await supabases.from("article_tags").delete().eq("article_id", articleId)
          if (selectedTags.length > 0) {
            const { error: tagError } = await supabases
              .from("article_tags")
              .insert(selectedTags.map((tagId) => ({ article_id: articleId, tag_id: tagId })))

            if (tagError) {
              console.warn("Tag sync skipped for article save:", tagError.message || tagError)
            }
          }
        } catch (tagSyncError) {
          console.warn("Tag sync skipped for article save:", tagSyncError)
        }
      }

      // Notify success before navigating
      if (effectiveStatus === "draft") {
        toast({ title: article ? "Changes saved" : "Draft saved", description: article ? "Your changes have been saved." : "Your draft has been saved successfully." })
      }

      router.push(afterSaveHref || "/dashboard/articles")
      router.refresh()
    } catch (err: unknown) {
      console.error("Submit error:", err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err
          ? String(err.message)
          : "An error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Form Fields */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{article ? "Edit Article" : "Create New Article"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="article_type">Article Type</Label>
                <Select
                  value={formData.article_type}
                  onValueChange={(value) => setFormData({ ...formData, article_type: value as 'text' | 'video' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Article Language</Label>
                <Select
                  value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value as "en" | "rw" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  You can change this article's language while editing. The story group stays linked so translation drafts remain in sync.
                </p>
              </div>
            </div>

            {article && (
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-semibold">Translations</div>
                  <Button type="button" variant="outline" size="sm" onClick={handleCreateTranslation} disabled={isLoading}>
                    {normalizeArticleLanguage(formData.language) === "en" ? "Create Kinyarwanda Version" : "Create English Version"}
                  </Button>
                </div>

                {translations.length === 0 ? (
                  <p className="text-xs text-violet-700">
                    No linked translations yet. Create the first translation for this story group when ready.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {translations.map((translation) => {
                      const isCurrent = translation.id === article.id
                      return (
                        <div key={translation.id} className="flex items-center justify-between gap-3 rounded-md border border-violet-200 bg-white px-2 py-2 text-xs">
                          <div>
                            <div className="font-medium">{translation.language === "en" ? "English" : "Kinyarwanda"}</div>
                            <div className="text-slate-500">{translation.title}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-1 capitalize text-slate-700">{translation.status}</span>
                            {!isCurrent && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => router.push(`/dashboard/articles/${translation.id}/edit`)}>
                                Open
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isVideoArticle && (
                <div className="space-y-2">
                  <Label htmlFor="youtube_link">YouTube Link *</Label>
                  <Input
                    id="youtube_link"
                    value={formData.youtube_link}
                    onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=abc123"
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-sm text-blue-800">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <Languages className="h-4 w-4" />
                Translation workflow for editorial teams
              </div>
              <ol className="ml-5 list-decimal space-y-1 text-xs text-blue-700">
                <li>Write the original story in the selected language.</li>
                <li>Save as draft and review copy, SEO, and media.</li>
                <li>Translate to the other supported language as a separate draft only after review.</li>
                <li>Approve the translation, then publish the public version.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title"
                required
                className="text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="article-slug"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Select
                  value={undefined}
                  onValueChange={(value) => {
                    const v = Number.parseInt(value)
                    if (!Number.isFinite(v)) return
                    setSelectedTags((prev) => (prev.includes(v) ? prev : [...prev, v]))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add tags" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id.toString()}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedTags.map((id) => {
                      const t = tags.find((tg) => tg.id === id)
                      return (
                        <div key={id} className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs">
                          <span>{t?.name || `Tag ${id}`}</span>
                          <button
                            type="button"
                            className="ml-1 text-slate-500 hover:text-slate-700"
                            onClick={() => setSelectedTags((prev) => prev.filter((x) => x !== id))}
                            aria-label="Remove tag"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the article (optional)"
                rows={3}
              />
            </div>

            {!isVideoArticle ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-slate-500" />
                    <span>Tip: publish each language version as its own article record, then link them as the same story group for public switching.</span>
                  </div>
                </div>
                <RichTextEditor
                  label="Content *"
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your article content here..."
                />
              </>
            ) : (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                Video articles use the YouTube link as primary content.
              </div>
            )}

            {/* SEO Section */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">SEO Metadata</h3>
                <Button type="button" size="sm" onClick={handleGenerateSEO} disabled={isLoading}>
                  <Sparkles className="h-4 w-4 mr-1" /> Generate SEO Metadata
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="Optimized headline for search"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">SEO Keywords (comma-separated)</Label>
                  <Input
                    id="seo_keywords"
                    value={(formData.seo_keywords || []).join(", ")}
                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value.split(/,\s*/).filter(Boolean) })}
                    placeholder="news, rwanda, technology, ..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="seo_description">Meta Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="Concise summary for search engines (120–160 chars)"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {(() => {
              const derivedFeaturedPreview =
                formData.featured_image ||
                (formData.media || []).find((m) => (m as any)?.type === 'image')?.url ||
                ((formData.content || '').match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1] ?? null)
              const canSubmitForReview = Boolean(formData.category_id) && Boolean(derivedFeaturedPreview)
              return (
                <div className="flex flex-wrap gap-3 pt-4">
              <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, "draft")} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {article && forceDraft ? "Update Article" : `Save ${getLanguageLabel(formData.language)} Draft`}
              </Button>
              {!forceDraft && (
                <>
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, "pending")}
                    disabled={isLoading || !canSubmitForReview}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit {getLanguageLabel(formData.language)} for Review
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, "published")}
                    disabled={isLoading || !canSubmitForReview}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publish {getLanguageLabel(formData.language)} Now
                  </Button>
                </>
              )}
              {!forceDraft && (
                <Button type="button" variant="secondary" disabled={isLoading} className="border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100">
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Translate to {formData.language === "en" ? "Kinyarwanda" : "English"} (draft review)
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              {!forceDraft && !canSubmitForReview && (
                <div className="w-full text-xs text-slate-500">
                  To submit for review or publish, please select a Category and set a Featured image.
                </div>
              )}
            </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Media Upload */}
      <div className="space-y-6">
        {/* Quality Indicators Panel */}
        <ArticleQualityPanel
          data={{
            articleId: article?.id,
            title: formData.title,
            content: formData.content,
            youtubeLink: formData.youtube_link,
            metaDescription: formData.seo_description,
            keywords: formData.seo_keywords || [],
            featuredImage: formData.featured_image,
            articleType: formData.article_type,
          }}
        />

        <InternalLinkSuggestions
          title={formData.title}
          content={formData.content}
          currentArticleId={article?.id}
        />

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader
              media={formData.media}
              onChange={(media) => setFormData({ ...formData, media })}
              featuredImage={formData.featured_image}
              onFeaturedChange={(url) => setFormData({ ...formData, featured_image: url })}
              videoUrl={formData.video_url}
              onVideoChange={(url) => setFormData({ ...formData, video_url: url || null })}
              videos={formData.videos}
              onVideosChange={(urls: string[]) => setFormData({ ...formData, videos: urls })}
              maxImages={12}
            />
            
            {/* Featured Image Preview */}
            {formData.featured_image && (
              <div className="mt-4 p-3 border rounded-lg bg-slate-50">
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Featured Image Preview</Label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-orange-300">
                  <Image
                    src={formData.featured_image}
                    alt="Featured"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                </div>
              </div>
            )}
            {formData.video_url && (
              <div className="mt-4 p-3 border rounded-lg bg-slate-50">
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Selected Video Preview</Label>
                <div className="relative w-full rounded-lg overflow-hidden border-2 border-blue-300">
                  <video src={formData.video_url} controls className="w-full max-h-64 bg-black" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="font-medium capitalize">{formData.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Auto-save:</span>
              <span className="text-green-600">Enabled</span>
            </div>
            {article && (
              <div className="flex justify-between">
                <span className="text-slate-600">Last updated:</span>
                <span className="font-medium">Just now</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
