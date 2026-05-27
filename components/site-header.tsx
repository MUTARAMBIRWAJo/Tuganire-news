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

  // use centralized nav from components/nav

  const linkClass = (href: string) => {
    const active = pathname === href
    return [
      "nav-link inline-flex items-center rounded-full px-2.5 py-1.5 text-sm transition-colors duration-200",
      active
        ? "bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-100"
        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white",
    ].join(" ")
  }

  const primaryNav = nav

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-slate-950/88">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {breakingItems.length > 0 && (
          <div className="border-b border-slate-200/70 dark:border-slate-800/80">
            <BreakingNewsBar items={breakingItems} className="bg-transparent shadow-none" />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 py-3.5 lg:gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/placeholder-logo.png"
              alt="Tuganire News logo"
              width={40}
              height={40}
              className="h-9 w-9 rounded-full"
              priority
            />
            <div className="hidden sm:block">
              <div className="category-badge text-brand-600 dark:text-brand-400">
                International newsroom
              </div>
              <div className="font-serif text-lg font-bold tracking-tight text-slate-950 dark:text-white">Tuganire News</div>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 overflow-x-auto lg:flex">
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
              onClick={() => router.push("/search")}
              className="hidden sm:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/auth/login" aria-label="Login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="transition-transform hover:scale-110"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200/70 py-4 dark:border-slate-800 lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <LocaleSwitcher />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/search" onClick={() => setMobileMenuOpen(false)}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Link>
              </Button>
            </div>
            <nav className="grid gap-2 sm:grid-cols-2">
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
                href="/auth/login"
                className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
