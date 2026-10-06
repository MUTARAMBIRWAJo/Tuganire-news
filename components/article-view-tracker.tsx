"use client"

import { useEffect } from "react"

interface VisitorTrackingApi {
  initArticleTracking?: (articleId: string) => void
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
