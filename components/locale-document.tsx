"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { getLocaleFromPath } from "@/lib/i18n"

export function LocaleDocument() {
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.lang = getLocaleFromPath(pathname)
  }, [pathname])

  return null
}
