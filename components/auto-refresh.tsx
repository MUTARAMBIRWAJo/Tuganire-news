'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AutoRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const refreshPage = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        router.refresh()
      }
    }

    const intervalId = window.setInterval(refreshPage, intervalMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [intervalMs, router])

  return null
}
