"use client"

import { getLocaleFromPath, t } from "@/lib/i18n"

export default function Loading() {
  const locale = getLocaleFromPath(typeof window === "undefined" ? undefined : window.location.pathname)
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <span className="sr-only">{t("loading", locale)}</span>
      {/* Breaking bar skeleton */}
      <div className="w-full bg-brand-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="h-4 w-28 rounded bg-white/30 animate-pulse" />
        </div>
      </div>

      {/* Header placeholder height */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800" />

      <main className="max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8 space-y-8">
        {/* Hero skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative aspect-video md:col-span-2 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="space-y-3">
            <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-10 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>

        {/* Trending rail skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[4/3] w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Category rows skeleton */}
        {Array.from({ length: 3 }).map((_, r) => (
          <div key={r} className="space-y-4">
            <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[4/3] w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
