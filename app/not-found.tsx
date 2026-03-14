import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-white dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">404 Error</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          The page you are looking for does not exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Go to Homepage
          </Link>
          <Link href="/articles" className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-900">
            Browse Articles
          </Link>
          <Link href="/contact" className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-900">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  )
}
