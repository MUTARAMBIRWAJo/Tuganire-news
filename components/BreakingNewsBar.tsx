import Link from "next/link"

interface BreakingNewsItem {
  slug: string
  title: string
}

interface BreakingNewsBarProps {
  items: BreakingNewsItem[]
  className?: string
}

export default function BreakingNewsBar({ items, className = "" }: BreakingNewsBarProps) {
  if (!items || items.length === 0) return null

  const row = items.map((item, idx) => (
    <span key={`${item.slug}-${idx}`} className="inline-flex items-center gap-3 whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden />
      <Link href={`/articles/${item.slug}`} className="text-sm font-medium text-white/95 transition-colors hover:text-white hover:underline">
        {item.title}
      </Link>
    </span>
  ))

  return (
    <section className={`w-full border-b border-blue-900/20 bg-gradient-to-r from-[#0b2a5b] via-[#113b76] to-[#1650a3] text-white shadow-sm ${className}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-hidden px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex-shrink-0 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#113b76] shadow-sm">
          Breaking
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden" aria-live="polite">
          <div className="ticker-mask pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0b2a5b] to-transparent sm:w-12" aria-hidden />
          <div className="ticker-mask pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#1650a3] to-transparent sm:w-12" aria-hidden />
          <div className="ticker-track flex w-max items-center gap-6 whitespace-nowrap will-change-transform">
            {row}
            {row}
          </div>
        </div>
      </div>
    </section>
  )
}
