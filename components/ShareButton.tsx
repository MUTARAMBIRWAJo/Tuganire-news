"use client"

import { Share2 } from "lucide-react"
import { useState } from "react"
import { ShareMenu } from "./ShareMenu"

interface ShareButtonProps {
  articleId?: string
  url: string
  title: string
  size?: "sm" | "md"
}

export function ShareButton({ articleId, url, title, size = "sm" }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const iconSize = size === "sm" ? 16 : 20

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Share this article"
        className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors p-1.5 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        <Share2 width={iconSize} height={iconSize} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-max rounded-lg bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-700 p-2 z-20">
          <ShareMenu articleId={articleId} url={url} title={title} size={size} />
        </div>
      )}
    </div>
  )
}
