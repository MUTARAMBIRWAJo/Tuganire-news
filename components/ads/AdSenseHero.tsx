'use client'

import Script from "next/script"

interface AdSenseHeroProps {
  adSlot: string
  className?: string
}

export default function AdSenseHero({ adSlot, className = "" }: AdSenseHeroProps) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1524579863977140"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={{ 
          display: "block",
          width: "100%",
          height: "120px"
        }}
        data-ad-client="ca-pub-1524579863977140"
        data-ad-slot={adSlot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
      <Script id={`adsbygoogle-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}
