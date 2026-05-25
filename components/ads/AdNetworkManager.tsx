"use client"

import { GoogleAdsenseLoader } from "@/components/ads/GoogleAdsense"
import { AdskeeperLoader } from "@/components/ads/Adskeeper"

export default function AdNetworkManager() {
  return (
    <>
      <GoogleAdsenseLoader />
      <AdskeeperLoader />
    </>
  )
}
