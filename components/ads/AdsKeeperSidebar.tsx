'use client'

import { useEffect } from "react"
import { enqueueAdsKeeperLoad } from "@/lib/adskeeper"

interface AdsKeeperSidebarProps {
  widgetId?: string
  className?: string
  adHeightPx?: number
}

export default function AdsKeeperSidebar({ widgetId = "1992246", className = "", adHeightPx = 300 }: AdsKeeperSidebarProps) {
  useEffect(() => {
    enqueueAdsKeeperLoad()
  }, [])

  return (
    <div className={`w-full ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <div style={{ minHeight: `${adHeightPx}px` }}>
        <div data-type="_mgwidget" data-widget-id={widgetId}></div>
      </div>
    </div>
  )
}
