"use client"

import { Facebook, Twitter, Linkedin, MessageCircle, Share2 } from "lucide-react"
import { useState } from "react"

interface ShareMenuProps {
  articleId?: string
  url: string
  title: string
  size?: "sm" | "md"
}

export function ShareMenu({ articleId, url, title, size = "md" }: ShareMenuProps) {
  const [copied, setCopied] = useState(false)
  const iconSize = size === "sm" ? 16 : 20

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const trackShare = (platform: string) => {
    if (!articleId || typeof window === "undefined") return
    ;(window as any)?.VisitorTracking?.trackShare?.({
      articleId,
      platform,
      metadata: { url, title },
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      trackShare("copy")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        onClick={() => trackShare("facebook")}
        className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors p-1.5"
      >
        <Facebook className="" width={iconSize} height={iconSize} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        onClick={() => trackShare("twitter")}
        className="inline-flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors p-1.5"
      >
        <Twitter width={iconSize} height={iconSize} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        onClick={() => trackShare("linkedin")}
        className="inline-flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors p-1.5"
      >
        <Linkedin width={iconSize} height={iconSize} />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors p-1.5 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        <Share2 width={iconSize} height={iconSize} />
      </button>
      {copied && (
        <span className="text-xs text-emerald-500">Copied</span>
      )}
    </div>
  )
}
