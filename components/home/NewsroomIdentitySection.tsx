export default function NewsroomIdentitySection() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">Newsroom identity</div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Independent journalism for informed communities.</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
        Tuganire News delivers verified reporting, on-the-ground context, and accountable editorial decisions. We prioritize public-interest journalism over sensationalism and maintain clear separation between editorial and commercial content.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Mission</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Publish accurate, accessible reporting that helps readers make informed decisions.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Journalism standards</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fact-checking, source verification, editorial review, and transparent updates when stories change.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Independent media</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Commercial partnerships are clearly labeled to protect newsroom trust and reader confidence.</p>
        </div>
      </div>
    </section>
  )
}