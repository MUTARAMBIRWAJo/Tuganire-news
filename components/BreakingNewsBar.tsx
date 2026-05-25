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

  return (
    <section className={`w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ${className}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-hidden px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex-shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900">
          Breaking
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="inline-flex animate-marquee whitespace-nowrap gap-6 text-xs font-medium md:text-sm">
            {joinedTitles.map((item, idx) => (
              <span key={item.slug + idx} className="inline-flex items-center gap-2">
                <Link href={`/articles/${item.slug}`} className="hover:underline">
                  {item.title}
                </Link>
                {idx < joinedTitles.length - 1 && <span className="opacity-60">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
