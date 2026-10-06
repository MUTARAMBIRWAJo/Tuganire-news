"use client"

import { useEffect } from "react"
import "@/lib/tracking"

type VisitorTrackingApi = {
  initVisitorTracking?: () => Promise<unknown>
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
