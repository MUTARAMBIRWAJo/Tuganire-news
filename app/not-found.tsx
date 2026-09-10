"use client"

import Link from "next/link"
import { getLocaleFromPath, t } from "@/lib/i18n"

export default function NotFound() {
  const locale = getLocaleFromPath(typeof window === "undefined" ? undefined : window.location.pathname)
  const localize = (href: string) => `/${locale}${href === "/" ? "" : href}`
  return (
    <main className="min-h-[70vh] bg-white dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">404 {t("error", locale)}</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{t("pageNotFound", locale)}</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          {t("pageNotFoundDescription", locale)}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={localize("/")} className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            {t("goHome", locale)}
          </Link>
          <Link href={localize("/articles")} className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-900">
            {t("browseArticles", locale)}
          </Link>
          <Link href={localize("/contact")} className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-900">
            {t("contactUs", locale)}
          </Link>
        </div>
      </div>
    </main>
  )
}
