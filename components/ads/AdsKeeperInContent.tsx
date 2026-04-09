'use client'

import { useEffect } from "react"

interface AdsKeeperInContentProps {
  widgetId?: string
  className?: string
  position?: "top" | "middle" | "bottom"
  adHeightPx?: number
}

export default function AdsKeeperInContent({ 
  widgetId = "1992246",
  className = "",
  position = "middle",
  adHeightPx = 300
}: AdsKeeperInContentProps) {
  useEffect(() => {
    let tries = 0
    const maxTries = 16
    const timer = window.setInterval(() => {
      const queue = (window as any)._mgq
      if (!queue) {
        tries += 1
        if (tries >= maxTries) window.clearInterval(timer)
        return
      }

      queue.push(["_mgc.load"])
      window.clearInterval(timer)
    }, 250)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className={`my-8 ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <div style={{ minHeight: `${adHeightPx}px` }}>
        <div data-type="_mgwidget" data-widget-id={widgetId}></div>
      </div>
    </div>
  )
}
