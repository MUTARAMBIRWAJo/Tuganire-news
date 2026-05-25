"use client"

import { useEffect, useState } from "react"

export default function ArticleProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const nextProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.max(0, Math.min(100, nextProgress)))
    }

    updateProgress()
    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)
    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  return (
    <div className="fixed left-0 top-0 z-[60] h-1 w-full bg-transparent" aria-hidden>
      <div className="h-full bg-brand-600 transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  )
}
