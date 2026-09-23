"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getLocaleFromPath } from "@/lib/i18n"
import type { AdvertisementPlacement, PublicAdvertisement } from "@/lib/advertisements"
import AdvertisementBanner from "@/components/AdvertisementBanner"
import GoogleAdSenseUnit from "@/components/ads/GoogleAdSenseUnit"

type AdSenseUnit = { publisherId: string; adSlot: string; format: string; responsive: boolean }

export default function AdvertisementSlot({ placement }: { placement: AdvertisementPlacement }) {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)
  const [ads, setAds] = useState<PublicAdvertisement[]>([])
  const [adsenseUnit, setAdsenseUnit] = useState<AdSenseUnit | null>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    setAds([])
    setAdsenseUnit(null)
    setIndex(0)

    fetch(`/api/public/advertisements?placement=${encodeURIComponent(placement)}&locale=${locale}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { ads: [] })
      .then((payload: { ads?: PublicAdvertisement[] }) => {
        if (!cancelled) setAds(Array.isArray(payload.ads) ? payload.ads : [])
      })
      .catch(() => {
        if (!cancelled) setAds([])
      })

    fetch(`/api/public/adsense?placement=${encodeURIComponent(placement)}&locale=${locale}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { unit: null })
      .then((payload: { unit?: AdSenseUnit | null }) => {
        if (!cancelled) setAdsenseUnit(payload.unit || null)
      })
      .catch(() => {
        if (!cancelled) setAdsenseUnit(null)
      })

    return () => { cancelled = true }
  }, [locale, placement])

  useEffect(() => {
    if (ads.length < 2) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % ads.length), 60_000)
    return () => window.clearInterval(timer)
  }, [ads.length])

  const ad = ads[index]
  if (!ad && !adsenseUnit) return null
  if (!ad && adsenseUnit) {
    return <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8"><GoogleAdSenseUnit {...adsenseUnit} /></div>
  }
  return <AdvertisementBanner ad={ad} />
}
