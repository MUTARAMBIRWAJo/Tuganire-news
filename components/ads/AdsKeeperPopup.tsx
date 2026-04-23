'use client'

import { useEffect, useState } from "react"
import { enqueueAdsKeeperLoad } from "@/lib/adskeeper"

interface AdsKeeperPopupProps {
  widgetId?: string
  adHeightPx?: number
  delayMs?: number
}

type PopupWindow = Window & {
  __adsKeeperPopupMounted?: boolean
}

export default function AdsKeeperPopup({
  widgetId = "1999345",
  adHeightPx = 320,
  delayMs = 5000,
}: AdsKeeperPopupProps) {
  const [open, setOpen] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const w = window as PopupWindow
    if (w.__adsKeeperPopupMounted) return

    w.__adsKeeperPopupMounted = true
    setIsOwner(true)

    const isDismissed = window.sessionStorage.getItem("adskeeper-popup-dismissed") === "1"
    if (isDismissed) return () => {
      w.__adsKeeperPopupMounted = false
    }

    const timer = window.setTimeout(() => {
      setOpen(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timer)
      w.__adsKeeperPopupMounted = false
    }
  }, [delayMs])

  useEffect(() => {
    if (!isOwner || !open) return
    enqueueAdsKeeperLoad()
  }, [isOwner, open])

  const closePopup = () => {
    window.sessionStorage.setItem("adskeeper-popup-dismissed", "1")
    setOpen(false)
  }

  if (!isOwner || !open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Advertisement popup">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-4 shadow-2xl">
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close advertisement"
          className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          Close
        </button>
        <div className="mb-2 text-center text-xs text-gray-500">Advertisement</div>
        <div style={{ minHeight: `${adHeightPx}px` }}>
          <div data-type="_mgwidget" data-widget-id={widgetId}></div>
        </div>
      </div>
    </div>
  )
}
