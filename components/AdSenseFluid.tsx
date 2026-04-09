'use client'

import Script from "next/script"

interface AdSenseFluidProps {
  adSlot: string
  className?: string
}

export default function AdSenseFluid({ adSlot, className = "" }: AdSenseFluidProps) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1524579863977140"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <div className="h-[120px] overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "120px" }}
          data-ad-format="fluid"
          data-ad-layout-key="-h9+13+6n-1g-c5"
          data-ad-client="ca-pub-1524579863977140"
          data-ad-slot={adSlot}
        />
      </div>
      <Script id={`adsbygoogle-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}
