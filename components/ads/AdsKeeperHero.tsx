'use client'

import { useEffect } from "react"

interface AdsKeeperHeroProps {
  widgetId?: string
  className?: string
  adHeightPx?: number
}

export default function AdsKeeperHero({ widgetId = "1992246", className = "", adHeightPx = 260 }: AdsKeeperHeroProps) {
  useEffect(() => {
    // Trigger AdsKeeper widget load
    if ((window as any)._mgq) {
      ;(window as any)._mgq.push(["_mgc.load"])
    }
  }, [])

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <div className="overflow-hidden" style={{ height: `${adHeightPx}px` }}>
        <div data-type="_mgwidget" data-widget-id={widgetId}></div>
      </div>
    </div>
  )
}
