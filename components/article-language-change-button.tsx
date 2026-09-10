"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Languages, Loader2, MoveRight, TriangleAlert } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { normalizeLanguage } from "@/lib/languages"
import { getLocaleFromPath, t } from "@/lib/i18n"

type Props = {
  articleId: string
  currentLanguage?: string | null
  disabled?: boolean
}

type TransferPhase = "idle" | "changing" | "moving" | "refreshing" | "completed" | "error"

const languageDetails = {
  en: { code: "EN", key: "english" },
  rw: { code: "RW", key: "kinyarwanda" },
} as const

export function ArticleLanguageChangeButton({ articleId, currentLanguage, disabled = false }: Props) {
  const router = useRouter()
  const normalizedCurrent = normalizeLanguage(currentLanguage)
  const locale = getLocaleFromPath(typeof window === "undefined" ? undefined : window.location.pathname)
  const [open, setOpen] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState<"en" | "rw">(
    normalizedCurrent === "rw" ? "en" : "rw"
  )
  const [phase, setPhase] = useState<TransferPhase>("idle")
  const [error, setError] = useState("")
  const [conflictArticleId, setConflictArticleId] = useState<string | null>(null)

  useEffect(() => {
    setTargetLanguage(normalizedCurrent === "rw" ? "en" : "rw")
  }, [normalizedCurrent])

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "rw", label: "Kinyarwanda" },
  ].filter((option) => option.value !== normalizedCurrent)

  const handleLanguageChange = async () => {
    if (phase !== "idle" && phase !== "error") return

    setPhase("changing")
    setError("")
    setConflictArticleId(null)

    try {
      const response = await fetch(`/api/articles/${articleId}/language`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: targetLanguage,
          currentLanguage: normalizedCurrent,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 409 && data?.conflict) {
          setConflictArticleId(typeof data.existingArticle?.id === "string" ? data.existingArticle.id : null)
        }
        throw new Error(String(data?.error || t("languageChangeFailed", locale)))
      }

      if (data?.newLanguage !== targetLanguage || data?.article?.language !== targetLanguage) {
        throw new Error("The server did not confirm the requested language change")
      }

      setPhase("moving")
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      setPhase("refreshing")
      router.refresh()
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      setPhase("completed")
    } catch (err) {
      setPhase("error")
      setError(err instanceof Error ? err.message : t("languageChangeFailed", locale))
    }
  }

  const current = languageDetails[normalizedCurrent]
  const target = languageDetails[targetLanguage]
  const currentLabel = t(current.key, locale)
  const targetLabel = t(target.key, locale)
  const isProcessing = phase === "changing" || phase === "moving" || phase === "refreshing"
  const progressSteps = [
    { key: "changing", label: t("changingLanguage", locale) },
    { key: "moving", label: t("movingArticleTo", locale, { language: targetLabel }) },
    { key: "refreshing", label: t("updatingArticleList", locale) },
    { key: "completed", label: t("languageChangedSuccessfully", locale) },
  ] as const
  const phaseIndex = progressSteps.findIndex((step) => step.key === phase)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isProcessing || phase === "completed"}
          aria-busy={isProcessing}
          aria-disabled={disabled || isProcessing || phase === "completed"}
          aria-label={isProcessing ? t("changingArticleLanguage", locale, { current: currentLabel, target: targetLabel }) : t("changeLanguage", locale)}
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : phase === "completed" ? <Check className="h-4 w-4" /> : <Languages className="h-4 w-4" />}
          {isProcessing ? t("changingLanguage", locale) : phase === "completed" ? t("languageChangedSuccessfully", locale) : t("changeLanguage", locale)}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Article Language</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground space-y-3 text-sm">
            {phase === "idle" || phase === "error" ? (
              <>
                <span className="block">{t("languageChangeDescription", locale)}</span>
                <div className="flex items-center justify-center gap-3 rounded-lg border bg-slate-50 p-4 text-sm font-medium text-slate-800">
                  <span className="rounded-full bg-blue-100 px-3 py-1.5 text-blue-800">{current.code} {currentLabel}</span>
                  <MoveRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  <span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-800">{target.code} {targetLabel}</span>
                </div>
                <label className="block text-left text-sm font-medium text-slate-700">
                  {t("targetLanguage", locale)}:
                  <select
                    className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    value={targetLanguage}
                    onChange={(event) => setTargetLanguage(event.target.value as "en" | "rw")}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                {error ? (
                  <span className="flex items-start gap-2 text-sm text-red-600" role="alert">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}{conflictArticleId ? ` ${t("articleWasNotMoved", locale)}` : ` ${t("articleRemainsInClass", locale)}`}</span>
                  </span>
                ) : null}
                {conflictArticleId ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={`/dashboard/articles/${conflictArticleId}/edit`}>{t("viewExistingVersion", locale)}</a>
                  </Button>
                ) : null}
              </>
            ) : (
              <div className="space-y-4" role="status" aria-live="polite">
                <div className="flex items-center justify-center gap-3 rounded-lg border bg-slate-50 p-4 text-sm font-medium text-slate-800">
                  <span className="rounded-full bg-blue-100 px-3 py-1.5 text-blue-800">{current.code} {currentLabel}</span>
                  <MoveRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  <span className={`rounded-full px-3 py-1.5 ${phase === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-violet-100 text-violet-800"}`}>
                    {phase === "completed" ? "✓ " : "⟳ "}{target.code} {targetLabel}
                  </span>
                </div>
                <ol className="space-y-2 text-sm text-slate-700">
                  {progressSteps.map((step, index) => (
                    <li key={step.key} className="flex items-center gap-2">
                      {index < phaseIndex || phase === "completed" ? <Check className="h-4 w-4 text-emerald-600" /> : index === phaseIndex ? <Loader2 className="h-4 w-4 animate-spin text-violet-600" /> : <span className="h-4 w-4 rounded-full border border-slate-300" />}
                      <span>{step.label}{index === phaseIndex && phase !== "completed" ? "..." : ""}</span>
                    </li>
                  ))}
                </ol>
                {phase === "completed" ? <span className="block font-medium text-emerald-700">{t("languageChangedSuccessfully", locale)}</span> : null}
              </div>
            )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {isProcessing ? null : <AlertDialogCancel asChild><Button variant="outline" type="button">{phase === "completed" ? t("close", locale) : t("cancel", locale)}</Button></AlertDialogCancel>}
          {phase !== "completed" && !isProcessing ? (
            <AlertDialogAction asChild>
              <Button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  void handleLanguageChange()
                }}
              >
                {t("changeToLanguage", locale, { language: targetLabel })}
              </Button>
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
