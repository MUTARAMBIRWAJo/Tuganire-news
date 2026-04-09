'use client'

import { useEffect } from "react"

interface AdsKeeperHeroProps {
  widgetId?: string
  className?: string
  adHeightPx?: number
}

export default function AdsKeeperHero({ widgetId = "1992246", className = "", adHeightPx = 260 }: AdsKeeperHeroProps) {
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
      window.setTimeout(() => queue.push(["_mgc.load"]), 250)
      window.clearInterval(timer)
    }, 250)

    return () => window.clearInterval(timer)
  }, [])

  const minHeightPx = Math.max(adHeightPx, widgetId === "1992830" ? 300 : adHeightPx)

  return (
    <div className={`w-full ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <div style={{ minHeight: `${minHeightPx}px` }}>
        <div data-type="_mgwidget" data-widget-id={widgetId}></div>
      </div>
    </div>
  )
}
