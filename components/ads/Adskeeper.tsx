"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  AD_NETWORK_SCRIPT_IDS,
  AD_NETWORK_SCRIPT_URLS,
  getAdRouteState,
  syncManagedScript,
} from "@/lib/adManager"

type AdskeeperLoaderProps = {
  nonce?: string
}

export function AdskeeperLoader({ nonce }: AdskeeperLoaderProps) {
  const pathname = usePathname()

  useEffect(() => {
    const { adskeeperEnabled } = getAdRouteState(pathname)

    syncManagedScript({
      id: AD_NETWORK_SCRIPT_IDS.adskeeper,
      src: AD_NETWORK_SCRIPT_URLS.adskeeper,
      enabled: adskeeperEnabled,
      nonce,
      crossOrigin: "anonymous",
      dataset: {
        network: "adskeeper",
      },
    })
  }, [pathname, nonce])

  return null
}

type AdskeeperPlacement = "hero" | "banner" | "in-content" | "sidebar" | "popup"

interface AdskeeperPlaceholderProps {
  placement: AdskeeperPlacement
  title: string
  description: string
  minHeightClassName?: string
  className?: string
}

function AdskeeperPlaceholder({
  placement,
  title,
  description,
  minHeightClassName = "min-h-[120px]",
  className = "",
}: AdskeeperPlaceholderProps) {
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

export function AdskeeperHeroPlaceholder(props: Omit<AdskeeperPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdskeeperPlaceholder
      placement="hero"
      title="AdsKeeper hero"
      description="Reserved for a future hero-area ad slot."
      minHeightClassName="min-h-[260px]"
      {...props}
    />
  )
}

export function AdskeeperBannerPlaceholder(props: Omit<AdskeeperPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdskeeperPlaceholder
      placement="banner"
      title="AdsKeeper banner"
      description="Reserved for a future banner placement."
      minHeightClassName="min-h-[120px]"
      {...props}
    />
  )
}

export function AdskeeperInContentPlaceholder(props: Omit<AdskeeperPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdskeeperPlaceholder
      placement="in-content"
      title="AdsKeeper in-content"
      description="Reserved for a future in-content ad placement."
      minHeightClassName="min-h-[220px]"
      {...props}
    />
  )
}

export function AdskeeperSidebarPlaceholder(props: Omit<AdskeeperPlaceholderProps, "placement" | "title" | "description"> = {}) {
  return (
    <AdskeeperPlaceholder
      placement="sidebar"
      title="AdsKeeper sidebar"
      description="Reserved for a future desktop sidebar ad."
      minHeightClassName="min-h-[300px]"
      {...props}
    />
  )
}
