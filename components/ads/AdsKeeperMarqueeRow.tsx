'use client'

import { useEffect, useMemo, useState } from "react"
import AdsKeeperHero from "@/components/ads/AdsKeeperHero"

interface MarqueeAdItem {
  widgetId: string
  adHeightPx?: number
}

interface AdsKeeperMarqueeRowProps {
  ads: MarqueeAdItem[]
  className?: string
  intervalMs?: number
}

export default function AdsKeeperMarqueeRow({
  ads,
  className = "",
  intervalMs = 12000,
}: AdsKeeperMarqueeRowProps) {
  const normalizedAds = useMemo(() => ads.filter((ad) => ad.widgetId), [ads])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (normalizedAds.length <= 1) return

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % normalizedAds.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [normalizedAds.length, intervalMs])

  if (normalizedAds.length === 0) return null

  const activeAd = normalizedAds[index]

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="transition-opacity duration-700 ease-in-out">
        <AdsKeeperHero
          key={`${activeAd.widgetId}-${index}`}
          widgetId={activeAd.widgetId}
          adHeightPx={activeAd.adHeightPx ?? 300}
        />
      </div>
      {normalizedAds.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1">
          {normalizedAds.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-1.5 w-1.5 rounded-full ${i === index ? "bg-slate-700" : "bg-slate-300"}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
