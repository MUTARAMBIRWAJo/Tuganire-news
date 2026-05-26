import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, User } from "lucide-react"

interface AuthorProfileCardProps {
  author: any
}

function titleFromAuthor(author: any) {
  return author?.job_title || author?.title || author?.role || "Staff Reporter"
}

function bioFromAuthor(author: any) {
  return (
    author?.bio ||
    author?.short_bio ||
    "Covers public-interest stories with a focus on accuracy, accountability, and community impact."
  )
}

function socialLinks(author: any) {
  const values = [
    { label: "X", href: author?.twitter_url || author?.x_url },
    { label: "LinkedIn", href: author?.linkedin_url },
    { label: "Instagram", href: author?.instagram_url },
    { label: "Website", href: author?.website_url || author?.website },
  ]

  return values.filter((entry) => typeof entry.href === "string" && /^https?:\/\//i.test(entry.href))
}

export default function AuthorProfileCard({ author }: AuthorProfileCardProps) {
  const displayName = author?.display_name || author?.full_name || "Newsroom Reporter"
  const role = titleFromAuthor(author)
  const bio = bioFromAuthor(author)
  const articleCount = Number(author?.article_count || 0)
  const links = socialLinks(author)

  return (
    <section aria-label="Author profile" className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {author?.avatar_url ? (
            <Image
              src={author.avatar_url}
              alt={displayName}
              width={84}
              height={84}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <User className="h-9 w-9" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
              <BadgeCheck className="h-4 w-4" />
              Author profile
            </div>
            <h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{displayName}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{role}</p>
          </div>

          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{bio}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium dark:border-slate-700 dark:bg-slate-900">
              {Number.isFinite(articleCount) ? `${articleCount} published articles` : "Contributor"}
            </span>
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-200 px-3 py-1 font-medium transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
