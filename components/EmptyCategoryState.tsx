"use client"

import Link from 'next/link'

export default function EmptyCategoryState({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{title ?? 'No articles yet'}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message ?? 'There are no articles in this category yet. Try exploring other categories or return to the homepage.'}</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/categories" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Browse categories</Link>
          <Link href="/" className="px-4 py-2 border border-slate-200 rounded-md text-sm dark:border-slate-700">Go home</Link>
        </div>
      </div>
    </div>
  )
}
