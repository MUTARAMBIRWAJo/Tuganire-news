"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react"

export interface ArticleQualityData {
  articleId?: string
  title: string
  content: string
  metaDescription: string
  keywords: string[]
  featuredImage: string
  articleType: string
}

interface QualityResult {
  score: number
  grade: string
  canPublish: boolean
  errors: string[]
  suggestions: string[]
  wordCount: number
}

// ── Client-side SEO scoring (instant, no API needed) ──────────────────────────

function calcSeoScore(data: ArticleQualityData): { score: number; grade: string; warnings: string[] } {
  const warnings: string[] = []
  let points = 0
  const maxPoints = 95

  const titleLen = (data.title || "").trim().length
  if (titleLen >= 50 && titleLen <= 70) points += 15
  else if (titleLen >= 30) { points += 7; warnings.push(`Title: ${titleLen} chars (aim 50–70)`) }
  else warnings.push(`Title too short: ${titleLen} chars (min 50)`)

  const descLen = (data.metaDescription || "").trim().length
  if (descLen >= 120 && descLen <= 165) points += 20
  else if (descLen >= 80) { points += 10; warnings.push(`Meta desc: ${descLen} chars (aim 120–165)`) }
  else warnings.push(`Meta description ${descLen === 0 ? "missing" : `too short (${descLen} chars)`}`)

  const kws = (data.keywords || []).filter(Boolean)
  if (kws.length >= 2) points += 15
  else { points += kws.length * 5; warnings.push(`Add ${2 - kws.length} more SEO keyword(s)`) }

  const links = ((data.content || "").match(/href=["']\//gi) || []).length
  if (links >= 2) points += 15
  else { points += links * 5; warnings.push(`Internal links: ${links} found (need 2+)`) }

  if (data.featuredImage) points += 15
  else warnings.push("Missing featured image")

  const imgTags = ((data.content || "").match(/<img[^>]+>/gi) || [])
  const noAlt = imgTags.filter((t) => !/alt=["'][^"']+["']/i.test(t)).length
  if (imgTags.length === 0 || noAlt === 0) points += 15
  else { points += 5; warnings.push(`${noAlt} image(s) missing alt text`) }

  const score = Math.round((points / maxPoints) * 100)
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F"
  return { score: Math.min(100, score), grade, warnings }
}

// ── Client-side AdSense check (instant) ───────────────────────────────────────

function calcAdsenseReadiness(data: ArticleQualityData): { ready: boolean; issues: string[] } {
  const issues: string[] = []
  const combined = `${data.title} ${data.content}`.toLowerCase()
  const prohibited = ["xxx", "porn", "gambling", "casino", "drugs", "hack"]
  for (const w of prohibited) {
    if (combined.includes(w)) { issues.push(`Prohibited word: "${w}"`); break }
  }
  if (/lorem ipsum|coming soon|\[insert/i.test(combined)) issues.push("Placeholder content detected")

  const plain = (data.content || "").replace(/<[^>]+>/g, " ").trim()
  const words = plain.split(/\s+/).filter(Boolean).length
  if (words < 500) issues.push(`Content too short (${words} words, need 500+)`)

  if (!(data.metaDescription || "").trim()) issues.push("Meta description missing")
  if (!data.featuredImage) issues.push("Featured image missing")

  return { ready: issues.length === 0, issues }
}

// ── Score colour helper ────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return "text-green-600"
  if (score >= 50) return "text-amber-500"
  return "text-red-600"
}

function progressColor(score: number) {
  if (score >= 75) return "bg-green-500"
  if (score >= 50) return "bg-amber-400"
  return "bg-red-500"
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ArticleQualityPanel({ data }: { data: ArticleQualityData }) {
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analyzeKey, setAnalyzeKey] = useState("")

  const seo = calcSeoScore(data)
  const adsense = calcAdsenseReadiness(data)

  const analyzeContent = useCallback(async () => {
    if (!data.title && !data.content) return
    const key = `${data.title}__${(data.content || "").slice(0, 80)}__${data.metaDescription}__${data.featuredImage}`
    if (key === analyzeKey) return
    setAnalyzeKey(key)
    setIsLoading(true)
    try {
      const res = await fetch("/api/article-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: data.articleId,
          title: data.title,
          content: data.content,
          metaDescription: data.metaDescription,
          keywords: data.keywords,
          featuredImage: data.featuredImage,
          articleType: data.articleType,
        }),
      })
      if (res.ok) setQualityResult(await res.json())
    } catch {
      // Fail silently — panel still shows client-side scores
    } finally {
      setIsLoading(false)
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(analyzeContent, 1800)
    return () => clearTimeout(timer)
  }, [analyzeContent])

  const contentScore = qualityResult?.score ?? null
  const wordCount = qualityResult?.wordCount ?? 0
  const allErrors = qualityResult?.errors ?? []
  const allSuggestions = qualityResult?.suggestions ?? []
  const isPublishReady = (qualityResult?.canPublish ?? false) && adsense.ready && seo.score >= 60

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            Quality Indicators
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
          </span>
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-0.5"
            onClick={() => setShowDetails((p) => !p)}
            aria-label="Toggle details"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showDetails ? "less" : "more"}
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* ── Content Quality ── */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span>Content Quality</span>
            <span className={contentScore !== null ? scoreColor(contentScore) : "text-slate-400"}>
              {contentScore !== null ? `${contentScore}%` : "—"}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progressColor(contentScore ?? 0)}`}
              style={{ width: `${contentScore ?? 0}%` }}
            />
          </div>
          {wordCount > 0 && (
            <p className="text-xs text-slate-500">
              {wordCount} words · {Math.max(1, Math.ceil(wordCount / 200))} min read
            </p>
          )}
        </div>

        {/* ── SEO Score ── */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span>SEO Score</span>
            <span className={scoreColor(seo.score)}>
              {seo.score}% · Grade {seo.grade}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progressColor(seo.score)}`}
              style={{ width: `${seo.score}%` }}
            />
          </div>
        </div>

        {/* ── AdSense Readiness ── */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">AdSense Readiness</span>
          <Badge
            className={`text-xs ${adsense.ready ? "bg-green-600 hover:bg-green-600 text-white" : "bg-red-600 hover:bg-red-600 text-white"}`}
          >
            {adsense.ready ? "✓ PASS" : "✗ FAIL"}
          </Badge>
        </div>

        {/* ── All good banner ── */}
        {isPublishReady && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5">
            <CheckCircle className="h-3 w-3 flex-shrink-0" />
            <span>Article is ready to publish!</span>
          </div>
        )}

        {/* ── Blocking errors ── */}
        {allErrors.length > 0 && (
          <div className="space-y-1">
            {allErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── AdSense issues ── */}
        {adsense.issues.length > 0 && (
          <div className="space-y-1">
            {adsense.issues.slice(0, 3).map((issue, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Expanded details ── */}
        {showDetails && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {/* SEO warnings */}
            {seo.warnings.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">SEO Issues</p>
                {seo.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Suggestions */}
            {allSuggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Suggestions</p>
                {allSuggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-blue-400 mt-0.5">›</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
