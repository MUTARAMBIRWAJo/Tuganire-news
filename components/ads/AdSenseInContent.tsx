'use client'

import Script from "next/script"

interface AdSenseInContentProps {
  adSlot: string
  className?: string
  position?: "top" | "middle" | "bottom"
}

export default function AdSenseInContent({ 
  adSlot, 
  className = "",
  position = "middle"
}: AdSenseInContentProps) {
  const adStyle = { display: "block", width: "100%", height: "120px" }

  return (
    <div className={`my-8 overflow-hidden ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1524579863977140"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <div className="h-[120px] overflow-hidden">
        <ins
          className="adsbygoogle"
          style={adStyle}
          data-ad-client="ca-pub-1524579863977140"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <Script id={`adsbygoogle-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}
