import React from 'react'

interface SectionFallbackProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function SectionFallback({ title = 'Section unavailable', message = 'This part of the page failed to load. Try refreshing or retrying.', onRetry }: SectionFallbackProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          {onRetry && (
            <button onClick={onRetry} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Retry
            </button>
          )}
          <a href="/" className="text-sm text-slate-600 hover:underline dark:text-slate-400">Return home</a>
        </div>
      </div>
    </div>
  )
}
