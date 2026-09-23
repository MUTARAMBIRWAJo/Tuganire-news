"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Moon, Sun, User, Menu, X, Facebook, Instagram, Youtube, CloudSun, Clock3 } from "lucide-react"
import { usePathname } from "next/navigation"
import { LocaleSwitcher } from "@/components/locale-switcher"
import BreakingNewsBar from "@/components/BreakingNewsBar"
import AdvertisementSlot from "@/components/AdvertisementSlot"
import { nav } from '@/components/nav'
import { getLocaleFromPath, t } from '@/lib/i18n'

interface BreakingNewsItem {
  slug: string
  title: string
}

interface SiteHeaderProps {
  breakingItems?: BreakingNewsItem[]
  showAdvertisement?: boolean
}

export function SiteHeader({ breakingItems = [], showAdvertisement = false }: SiteHeaderProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [kigaliDate, setKigaliDate] = useState("")
  const [topPromotionsVisible, setTopPromotionsVisible] = useState(true)

  useEffect(() => {
    setKigaliDate(new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Kigali" }).format(new Date()))
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)

    setDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setTopPromotionsVisible(window.scrollY < 12)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)
  const localize = (href: string) => `/${locale}${href === "/" ? "" : href}`

  const linkClass = (href: string) => {
    const active = pathname === href || (href !== localize("/") && pathname.startsWith(`${href}/`))
    return [
      "nav-link inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold tracking-[0.01em] transition-all duration-200 ease-out",
      active
        ? "bg-slate-950 text-white shadow-[0_8px_18px_-12px_rgba(15,23,42,0.7)] dark:bg-brand-500 dark:text-slate-950"
        : "text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-950 hover:shadow-[0_8px_18px_-14px_rgba(15,23,42,0.18)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
    ].join(" ")
  }

  const primaryNav = nav.map((item) => ({ ...item, href: localize(item.href), label: t(item.key as Parameters<typeof t>[0], locale) }))

  return (
    <>
    {(showAdvertisement || breakingItems.length > 0) && <div className={`w-full overflow-hidden transition-[max-height,opacity] duration-300 ${topPromotionsVisible ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"}`}>
      {showAdvertisement && <AdvertisementSlot placement="HOME_BELOW_BREAKING_NEWS" />}
      {breakingItems.length > 0 && <div className="border-b border-slate-200/70 dark:border-slate-800/80"><BreakingNewsBar items={breakingItems} className="bg-transparent shadow-none" /></div>}
    </div>}
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_30px_-20px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-slate-950/90">
      <script dangerouslySetInnerHTML={{ __html: "(() => { try { const theme = localStorage.getItem('theme'); const dark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches); if (dark) document.documentElement.classList.add('dark'); } catch {} })();" }} />
      <div className="border-b border-slate-200/70 bg-slate-50/80 dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px] font-medium text-slate-500 sm:px-6 lg:px-8">
          <div className="hidden items-center gap-4 sm:flex"><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-brand-600" />Kigali, Rwanda · <span className="min-w-[112px]">{kigaliDate || "Today"}</span></span><span className="inline-flex items-center gap-1.5"><CloudSun className="size-3.5 text-[#00A1DE]" />28°C Kigali</span></div>
          <div className="flex items-center gap-2 sm:gap-3"><span className="hidden items-center gap-2 md:flex"><a href="https://www.facebook.com" aria-label="Facebook"><Facebook className="size-3.5 hover:text-brand-600" /></a><a href="https://www.instagram.com" aria-label="Instagram"><Instagram className="size-3.5 hover:text-brand-600" /></a><a href="https://www.youtube.com" aria-label="YouTube"><Youtube className="size-3.5 hover:text-brand-600" /></a></span><div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex h-6 items-center border-r border-slate-200 px-1 dark:border-slate-700"><LocaleSwitcher /></div>
            <Button variant="ghost" size="icon" asChild className="size-6 rounded-full text-slate-600 hover:bg-slate-100 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800">
              <Link href={localize("/auth/login")} aria-label={t("login", locale)}><User className="size-3" /></Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label={t("toggleDarkMode", locale)} className="size-6 rounded-full text-slate-600 hover:bg-slate-100 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800">
              {darkMode ? <Sun className="size-3 text-yellow-400" /> : <Moon className="size-3" />}
            </Button>
          </div></div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-2.75 lg:gap-5">
          <Link href={localize("/")} className="flex shrink-0 items-center gap-3 rounded-full pr-1 transition-transform duration-200 hover:-translate-y-0.5">
            <Image
              src="/placeholder-logo.png"
              alt="Tuganire"
              width={56}
              height={56}
              priority
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
            />
            <div className="hidden min-w-0 sm:block">
              <div className="category-badge text-[9px] font-bold tracking-[0.2em] text-brand-600 dark:text-brand-400">
                {t("coverage", locale)}
              </div>
              <div className="font-serif text-base font-black tracking-[-0.03em] text-slate-950 dark:text-white sm:text-[1.08rem]">
                Tuganire News
              </div>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden flex-1 items-center justify-center gap-1 overflow-x-auto lg:flex lg:py-1">
            {primaryNav.map((n) => (
              <Link key={n.href} href={n.href} className={linkClass(n.href)}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t("closeMenu", locale) : t("openMenu", locale)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200/70 py-4 dark:border-slate-800 lg:hidden">
            <div className="mb-4 flex items-center justify-end gap-3">
              <span className="text-xs text-slate-500">{t("switchLanguage", locale)}</span>
            </div>
            <nav aria-label="Mobile primary navigation" className="grid gap-2 sm:grid-cols-2">
              {primaryNav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`${linkClass(n.href)} rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {n.label}
                </Link>
              ))}
              <Link
                href={localize("/auth/login")}
                className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("login", locale)}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  )
}
