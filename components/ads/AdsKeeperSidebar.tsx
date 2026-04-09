'use client'

import { useEffect } from "react"

interface AdsKeeperSidebarProps {
  widgetId?: string
  className?: string
}

export default function AdsKeeperSidebar({ widgetId = "1992246", className = "" }: AdsKeeperSidebarProps) {
  useEffect(() => {
    // Trigger AdsKeeper widget load
    if ((window as any)._mgq) {
      ;(window as any)._mgq.push(["_mgc.load"])
    }
  }, [])

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <div className="h-[120px] overflow-hidden">
        <div data-type="_mgwidget" data-widget-id={widgetId}></div>
      </div>
    </div>
  )
}
