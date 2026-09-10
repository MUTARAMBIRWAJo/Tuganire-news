"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Search, User, Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { LocaleSwitcher } from "@/components/locale-switcher"
import BreakingNewsBar from "@/components/BreakingNewsBar"
import { nav } from '@/components/nav'
import { getLocaleFromPath, t } from '@/lib/i18n'

interface BreakingNewsItem {
  slug: string
  title: string
}

interface SiteHeaderProps {
  breakingItems?: BreakingNewsItem[]
}

export function SiteHeader({ breakingItems = [] }: SiteHeaderProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
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

  const router = useRouter()
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
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_30px_-20px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {breakingItems.length > 0 && (
          <div className="border-b border-slate-200/70 dark:border-slate-800/80">
            <BreakingNewsBar items={breakingItems} className="bg-transparent shadow-none" />
          </div>
        )}

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
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(localize("/search"))}
              className="hidden rounded-full sm:flex"
                aria-label={t("search", locale)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden rounded-full sm:flex">
              <Link href={localize("/auth/login")} aria-label={t("login", locale)}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={t("toggleDarkMode", locale)}
              className="rounded-full transition-transform hover:scale-110"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </Button>
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <LocaleSwitcher />
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link href={localize("/search")} onClick={() => setMobileMenuOpen(false)}>
                  <Search className="mr-2 h-4 w-4" />
                  {t("search", locale)}
                </Link>
              </Button>
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
  )
}
