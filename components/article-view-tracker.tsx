"use client"

import { useEffect } from "react"

interface VisitorTrackingApi {
  initVisitorTracking?: () => Promise<unknown>
  initArticleTracking?: (articleId: string) => void
  trackShare?: (params: { articleId: string; platform: string; metadata?: Record<string, unknown> }) => Promise<void>
}

declare global {
  interface Window {
    VisitorTracking?: VisitorTrackingApi
  }
}

export function ArticleViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    window.VisitorTracking?.initArticleTracking?.(articleId)
  }, [articleId])

  return null
}
