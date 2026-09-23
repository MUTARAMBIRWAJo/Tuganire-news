"use client"

import { useEffect, useRef } from "react"

interface GoogleAdSenseUnitProps {
  publisherId: string
  adSlot: string
  format?: string
  responsive?: boolean
}

export default function GoogleAdSenseUnit({ publisherId, adSlot, format = "auto", responsive = true }: GoogleAdSenseUnitProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      const ads = (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle ||= []
      ads.push({})
    } catch {
      initialized.current = false
    }
  }, [])

  return (
    <ins
      className="adsbygoogle block min-h-0 overflow-hidden"
      style={{ display: "block" }}
      data-ad-client={publisherId}
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
      aria-label="Advertisement"
    />
  )
}
