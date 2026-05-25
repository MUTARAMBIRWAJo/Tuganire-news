"use client"

import { useMemo, useState } from "react"
import { Copy, Share2 } from "lucide-react"
import { ShareButton } from "@/components/ShareButton"

interface ArticleShareRailProps {
  url: string
  title: string
  slug?: string
}

export default function ArticleShareRail({ url, title, slug }: ArticleShareRailProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")
  const shareUrl = useMemo(() => url, [url])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyState("copied")
      window.setTimeout(() => setCopyState("idle"), 2000)
    } catch {
      setCopyState("idle")
    }
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
        <Share2 className="size-4" />
        Share
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <ShareButton articleId={slug} url={shareUrl} title={title} size="md" />
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Copy className="size-4" />
          {copyState === "copied" ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  )
}
