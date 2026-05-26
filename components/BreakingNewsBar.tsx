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
  const joinedTitles = items

  // build a single content node and duplicate it for smooth infinite scroll
  const content = (
    <div className="inline-flex whitespace-nowrap gap-6 text-xs font-medium md:text-sm">
      {joinedTitles.map((item, idx) => (
        <span key={item.slug + idx} className="inline-flex items-center gap-2">
          <Link href={`/articles/${item.slug}`} className="hover:underline text-white hover:text-blue-100">
            {item.title}
          </Link>
          {idx < joinedTitles.length - 1 && <span className="opacity-60">•</span>}
        </span>
      ))}
    </div>
  )

  return (
    <section className={`w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-sm ${className}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-hidden px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex-shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Breaking
        </div>
        <div className="relative flex-1 overflow-hidden" aria-live="polite">
          <div className="flex items-center">
            <div className="min-w-full" aria-hidden>
              <div className="flex" style={{ minWidth: '200%' }}>
                <div className="flex items-center" style={{ minWidth: '50%' }}>
                  <div className="animate-marquee">{content}{content}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
