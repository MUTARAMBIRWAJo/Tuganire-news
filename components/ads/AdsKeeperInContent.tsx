'use client'

import { useEffect } from "react"
import { enqueueAdsKeeperLoad } from "@/lib/adskeeper"

interface AdsKeeperInContentProps {
  widgetId?: string
  className?: string
  position?: "top" | "middle" | "bottom"
  adHeightPx?: number
}

const DEFAULT_WIDGET = process.env.NEXT_PUBLIC_ADSKEEPER_WIDGET_DEFAULT || "1992246"

export default function AdsKeeperInContent({ 
  widgetId = DEFAULT_WIDGET,
  className = "",
  position = "middle",
  adHeightPx = 300
}: AdsKeeperInContentProps) {
  useEffect(() => {
    enqueueAdsKeeperLoad()
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
