'use client'

import Script from "next/script"

interface AdSenseBannerProps {
  adSlot: string
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical"
  className?: string
  fullWidth?: boolean
}

export default function AdSenseBanner({ 
  adSlot, 
  adFormat = "auto", 
  className = "",
  fullWidth = true 
}: AdSenseBannerProps) {
  const adStyle = {
    display: "block",
    width: fullWidth ? "100%" : "300px",
    height: "120px"
  }

  return (
    <div className={`w-full flex justify-center overflow-hidden ${className}`}>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1524579863977140"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <div className="h-[120px] w-full overflow-hidden">
        <ins
          className="adsbygoogle"
          style={adStyle}
          data-ad-client="ca-pub-1524579863977140"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidth ? "true" : "false"}
        />
      </div>
      <Script id={`adsbygoogle-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}
