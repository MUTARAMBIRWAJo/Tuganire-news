'use client'

import { useEffect } from "react"
import { enqueueAdsKeeperLoad } from "@/lib/adskeeper"

interface AdsKeeperHeroProps {
  widgetId?: string
  className?: string
  adHeightPx?: number
}

const DEFAULT_WIDGET = process.env.NEXT_PUBLIC_ADSKEEPER_WIDGET_DEFAULT || "1992246"

export default function AdsKeeperHero({ widgetId = DEFAULT_WIDGET, className = "", adHeightPx = 260 }: AdsKeeperHeroProps) {
  useEffect(() => {
    enqueueAdsKeeperLoad()
  }, [])

  const minHeightPx = Math.max(adHeightPx, widgetId === "1992830" ? 300 : adHeightPx)

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Advertisement
      </div>
      <div
        className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_32px_-26px_rgba(15,23,42,0.36)] ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-800"
        style={{ minHeight: `${minHeightPx}px` }}
      >
        <div data-type="_mgwidget" data-widget-id={widgetId}></div>
      </div>
    </div>
  )
}
