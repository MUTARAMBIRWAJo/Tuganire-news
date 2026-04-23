'use client'

import { useEffect } from "react"
import { enqueueAdsKeeperLoad } from "@/lib/adskeeper"

interface AdsKeeperBannerProps {
  widgetId?: string
  className?: string
  fullWidth?: boolean
  adHeightPx?: number
}

export default function AdsKeeperBanner({ 
  widgetId = "1992246",
  className = "",
  fullWidth = true,
  adHeightPx = 300
}: AdsKeeperBannerProps) {
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
