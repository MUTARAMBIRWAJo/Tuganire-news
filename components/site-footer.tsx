"use client"

import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, Rss, MapPin, Mail } from "lucide-react"
import { usePathname } from "next/navigation"
import { getLocaleFromPath, t } from "@/lib/i18n"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()
  const locale = getLocaleFromPath(usePathname())
  const localize = (href: string) => `/${locale}${href === "/" ? "" : href}`

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-950 py-14 text-slate-300 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[28px] border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/80 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-400">{t("newsroom", locale)}</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{t("independentReporting", locale)}</h3>
            </div>
            <Link href={localize("/newsletter")} className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
              {t("subscribeToUpdates", locale)}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">{t("trustAndCompany", locale)}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={localize("/about")} className="transition-colors hover:text-white">{t("brand", locale)}</Link></li>
              <li><Link href={localize("/terms")} className="transition-colors hover:text-white">{t("editorialPolicy", locale)}</Link></li>
              <li><Link href={localize("/advertise")} className="transition-colors hover:text-white">{t("advertiseWithUs", locale)}</Link></li>
              <li><Link href={localize("/contact")} className="transition-colors hover:text-white">{t("contact", locale)}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">{t("legal", locale)}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={localize("/privacy-policy")} className="transition-colors hover:text-white">{t("privacyPolicy", locale)}</Link></li>
              <li><Link href={localize("/terms")} className="transition-colors hover:text-white">{t("terms", locale)}</Link></li>
              <li><Link href={localize("/cookie-policy")} className="transition-colors hover:text-white">{t("cookiePolicy", locale)}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">{t("navigate", locale)}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={localize("/articles")} className="transition-colors hover:text-white">{t("allArticles", locale)}</Link></li>
              <li><Link href={localize("/categories")} className="transition-colors hover:text-white">{t("categories", locale)}</Link></li>
              <li><Link href={localize("/search")} className="transition-colors hover:text-white">{t("search", locale)}</Link></li>
              <li><Link href={localize("/rss.xml")} className="inline-flex items-center gap-1 transition-colors hover:text-white"><Rss className="h-3 w-3" />{t("rssFeed", locale)}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">{t("follow", locale)}</h4>
            <div className="flex gap-3">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-slate-700 p-2 transition-colors hover:border-brand-400 hover:text-white"><Facebook className="h-4 w-4" /></a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="rounded-full border border-slate-700 p-2 transition-colors hover:border-brand-400 hover:text-white"><Twitter className="h-4 w-4" /></a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full border border-slate-700 p-2 transition-colors hover:border-brand-400 hover:text-white"><Linkedin className="h-4 w-4" /></a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-slate-700 p-2 transition-colors hover:border-brand-400 hover:text-white"><Instagram className="h-4 w-4" /></a>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{t("globalCoverage", locale)}</p>
              <a href="mailto:tuganire.tntorg@gmail.com" className="flex items-center gap-1 transition-colors hover:text-white"><Mail className="h-3.5 w-3.5" />tuganire.tntorg@gmail.com</a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400">
          <p>&copy; {currentYear} {t("brand", locale)}. {t("allRightsReserved", locale)}</p>
        </div>
      </div>
    </footer>
  )
}
