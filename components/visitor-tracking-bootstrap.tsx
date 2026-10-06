"use client"

import { useEffect } from "react"
import "@/lib/tracking"

type VisitorTrackingApi = {
  initVisitorTracking?: () => Promise<unknown>
  initArticleTracking?: (articleId: string) => void
  trackShare?: (params: { articleId: string; platform: string; metadata?: Record<string, unknown> }) => Promise<void>
}

declare global {
  interface Window {
    VisitorTracking?: VisitorTrackingApi
  }
}

export function VisitorTrackingBootstrap() {
  useEffect(() => {
    void window.VisitorTracking?.initVisitorTracking?.()
  }, [])

  return null
}
