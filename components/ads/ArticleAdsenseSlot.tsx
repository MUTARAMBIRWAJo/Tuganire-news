'use client'

import { useEffect, useRef, useState } from "react"

interface ArticleAdsenseSlotProps {
  className?: string
}

export default function ArticleAdsenseSlot({ className = "" }: ArticleAdsenseSlotProps) {
  const slotRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = slotRef.current
    if (!node || isVisible) return

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "120px 0px",
        threshold: 0.1,
      },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [isVisible])

  return (
    <div ref={slotRef} className={["not-prose my-8 w-full", className].join(" ")}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          Advertisement
        </div>
        <div className="min-h-[220px] w-full px-4 py-5 sm:min-h-[250px] lg:min-h-[280px]">
          {isVisible ? (
            <div className="flex h-full min-h-[180px] flex-col justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/80">
              <div className="space-y-3">
                <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <div className="h-24 rounded-lg border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70" />
                <div className="hidden h-24 rounded-lg border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 sm:block" />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}