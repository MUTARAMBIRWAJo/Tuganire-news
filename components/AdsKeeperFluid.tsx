'use client'

import { useEffect } from "react"
import { enqueueAdsKeeperLoad } from "@/lib/adskeeper"

interface AdsKeeperFluidProps {
  widgetId?: string
  className?: string
  adHeightPx?: number
}

const DEFAULT_WIDGET = process.env.NEXT_PUBLIC_ADSKEEPER_WIDGET_DEFAULT || "1992246"

export default function AdsKeeperFluid({ widgetId = DEFAULT_WIDGET, className = "", adHeightPx = 300 }: AdsKeeperFluidProps) {
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
