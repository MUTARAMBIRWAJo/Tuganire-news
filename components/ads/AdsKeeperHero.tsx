'use client'

import { useEffect } from "react"

interface AdsKeeperHeroProps {
  widgetId?: string
  className?: string
  adHeightPx?: number
}

export default function AdsKeeperHero({ widgetId = "1992246", className = "", adHeightPx = 260 }: AdsKeeperHeroProps) {
  useEffect(() => {
    const queue = (window as any)._mgq
    if (!queue) return

    // Retry load a few times so all widgets in a multi-column row can initialize.
    const loadWidget = () => queue.push(["_mgc.load"])
    loadWidget()
    const t1 = window.setTimeout(loadWidget, 250)
    const t2 = window.setTimeout(loadWidget, 900)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  const widgetStyle = widgetId === "1992830" ? { minHeight: "300px" } : undefined

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <div className="overflow-hidden" style={{ height: `${adHeightPx}px` }}>
        <div data-type="_mgwidget" data-widget-id={widgetId} style={widgetStyle}></div>
      </div>
    </div>
  )
}
