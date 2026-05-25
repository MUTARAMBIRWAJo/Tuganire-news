"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  AD_NETWORK_SCRIPT_IDS,
  AD_NETWORK_SCRIPT_URLS,
  getAdRouteState,
  syncManagedScript,
} from "@/lib/adManager"

type GoogleAdsenseLoaderProps = {
  nonce?: string
}

export function GoogleAdsenseLoader({ nonce }: GoogleAdsenseLoaderProps) {
  const pathname = usePathname()

  useEffect(() => {
    const { adsenseEnabled } = getAdRouteState(pathname)

    syncManagedScript({
      id: AD_NETWORK_SCRIPT_IDS.adsense,
      src: AD_NETWORK_SCRIPT_URLS.adsense,
      enabled: adsenseEnabled,
      nonce,
      crossOrigin: "anonymous",
      dataset: {
        network: "adsense",
      },
    })
  }, [pathname, nonce])

  return null
}

type AdPlacement = "top-banner" | "in-article" | "sidebar" | "footer" | "mobile-sticky"

interface AdPlaceholderProps {
  placement: AdPlacement
  title: string
  description: string
  minHeightClassName?: string
  className?: string
}

function AdPlaceholder({
  placement,
  title,
  description,
  minHeightClassName = "min-h-[120px]",
  className = "",
}: AdPlaceholderProps) {
  return (
    <aside
      aria-label={title}
      className={[
        "rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-600 shadow-sm",
        "dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
        minHeightClassName,
        className,
      ].join(" ")}
      data-ad-placement={placement}
    >
      <div className="flex h-full min-h-[inherit] flex-col justify-center gap-1 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <span className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</span>
      </div>
    </aside>
  )
}

export function GoogleTopBannerAdPlaceholder(props: Omit<AdPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdPlaceholder
      placement="top-banner"
      title="AdSense top banner"
      description="Reserved for a future high-visibility ad slot above the article feed."
      minHeightClassName="min-h-[90px]"
      {...props}
    />
  )
}

export function GoogleInArticleAdPlaceholder(props: Omit<AdPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdPlaceholder
      placement="in-article"
      title="AdSense in-article"
      description="Reserved for a contextual ad between story sections."
      minHeightClassName="min-h-[250px]"
      {...props}
    />
  )
}

export function GoogleSidebarAdPlaceholder(props: Omit<AdPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdPlaceholder
      placement="sidebar"
      title="AdSense sidebar"
      description="Reserved for a desktop sidebar placement."
      minHeightClassName="min-h-[280px]"
      {...props}
    />
  )
}

export function GoogleFooterAdPlaceholder(props: Omit<AdPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdPlaceholder
      placement="footer"
      title="AdSense footer"
      description="Reserved for a low-pressure placement near the footer."
      minHeightClassName="min-h-[120px]"
      {...props}
    />
  )
}

export function GoogleMobileStickyAdPlaceholder(props: Omit<AdPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdPlaceholder
      placement="mobile-sticky"
      title="AdSense mobile sticky"
      description="Reserved for a future mobile-only sticky slot."
      minHeightClassName="min-h-[80px]"
      {...props}
    />
  )
}
