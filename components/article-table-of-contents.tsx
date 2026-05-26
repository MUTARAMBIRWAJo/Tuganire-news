"use client"

import { useEffect } from 'react'

interface TocHeading {
  id: string
  text: string
  level: 2 | 3 | 4
}

interface ArticleTableOfContentsProps {
  headings: TocHeading[]
}

export default function ArticleTableOfContents({ headings }: ArticleTableOfContentsProps) {
  if (!headings || headings.length === 0) return null

  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (!anchor || !anchor.hash) return
      const id = anchor.hash.replace('#', '')
      const el = document.getElementById(id)
      if (!el) return
      e.preventDefault()
      const header = document.querySelector('header')
      const offset = (header ? (header as HTMLElement).offsetHeight : 80) + 12
      const top = window.scrollY + el.getBoundingClientRect().top - offset
      window.scrollTo({ top, behavior: 'smooth' })
      // update hash without jumping
      history.replaceState(null, '', `#${id}`)
    }

    const container = document.getElementById('article-toc')
    container?.addEventListener('click', handler)

    // If page loaded with a hash, scroll to it with offset
    if (location.hash) {
      const id = location.hash.replace('#', '')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          const header = document.querySelector('header')
          const offset = (header ? (header as HTMLElement).offsetHeight : 80) + 12
          const top = window.scrollY + el.getBoundingClientRect().top - offset
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }, 120)
    }

    return () => container?.removeEventListener('click', handler)
  }, [headings])

  return (
    <aside id="article-toc" className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Quick navigation
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Table of contents</h2>
      </div>
      <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? 'pl-4' : heading.level === 4 ? 'pl-8' : ''}
          >
            <a
              href={`#${heading.id}`}
              className="inline-flex items-start gap-2 text-left transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50" />
              <span>{heading.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  )
}
