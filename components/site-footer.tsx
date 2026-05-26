import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, Rss, MapPin, Mail } from "lucide-react"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 py-14 text-slate-300 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[24px] border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-white">About Tuganire News</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Tuganire News is an independent digital newsroom focused on verified reporting, public-interest journalism, and transparent editorial standards across Rwanda, Africa, and global affairs.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
            <span className="rounded-full border border-slate-700 px-3 py-1">Independent media</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Editorial review</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Fact-checking commitment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Trust & company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  About Tuganire News
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="transition-colors hover:text-white">
                  Advertise With Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="transition-colors hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/articles" className="transition-colors hover:text-white">
                  All Articles
                </Link>
              </li>
              <li>
                <Link href="/categories" className="transition-colors hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="transition-colors hover:text-white">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="inline-flex items-center gap-1 transition-colors hover:text-white">
                  <Rss className="h-3 w-3" />
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Follow</h4>
            <div className="flex gap-3">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-slate-700 p-2 transition-colors hover:border-slate-500 hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="rounded-full border border-slate-700 p-2 transition-colors hover:border-slate-500 hover:text-white">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full border border-slate-700 p-2 transition-colors hover:border-slate-500 hover:text-white">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-slate-700 p-2 transition-colors hover:border-slate-500 hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Rwanda and global coverage
              </p>
              <a href="mailto:tuganire.tntorg@gmail.com" className="flex items-center gap-1 transition-colors hover:text-white">
                <Mail className="h-3.5 w-3.5" />
                tuganire.tntorg@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400">
          <p>&copy; {currentYear} Tuganire News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
