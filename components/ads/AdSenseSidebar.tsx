'use client'

import Script from "next/script"

interface AdSenseSidebarProps {
  adSlot: string
  className?: string
}

export default function AdSenseSidebar({ adSlot, className = "" }: AdSenseSidebarProps) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
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
          style={{ 
            display: "block",
            width: "100%",
            height: "120px"
          }}
          data-ad-client="ca-pub-1524579863977140"
          data-ad-slot={adSlot}
          data-ad-format="horizontal"
        />
      </div>
      <Script id={`adsbygoogle-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}
