import Link from "next/link"
import { ArrowRight, BookOpenText, Sparkles } from "lucide-react"
import { listPublishedEditorialContent, type EditorialContentType } from "@/lib/editorial"
import { normalizeLocale, t, type Locale } from "@/lib/i18n"

export const metadata = {
  title: "Editorial Archives | Tuganire",
  description: "Read magazine features, historical essays, research reports and editorial stories from Tuganire.",
}

const typeOrder: Array<EditorialContentType | "all"> = ["all", "magazine", "research", "story", "history"]

function typeLabel(type: EditorialContentType | "all", locale: Locale) {
  if (type === "all") return t("editorialFilterAll", locale)
  if (type === "magazine") return t("editorialFilterMagazine", locale)
  if (type === "research") return t("editorialFilterResearch", locale)
  if (type === "story") return t("editorialFilterStories", locale)
  return t("editorialFilterHistory", locale)
}

function typeTone(type: EditorialContentType | "all") {
  if (type === "magazine") return "bg-[#f6efe4] text-[#1f2937] border-[#d9c7a1]"
  if (type === "research") return "bg-[#eef6ff] text-[#0f172a] border-[#bfdaf7]"
  if (type === "story") return "bg-[#eefbf4] text-[#12372a] border-[#b7d7c6]"
  if (type === "history") return "bg-[#f5f1ee] text-[#2b2a29] border-[#d8c7bb]"
  return "bg-[#eaf9ff] text-[#0a1931] border-[#bfeaf7]"
}

export default async function EditorialArchivePage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; lang?: string }>
}) {
  const params = searchParams ? await searchParams : {}
  const locale = normalizeLocale(params.lang || "en")
  const activeType = typeOrder.includes((params.type as EditorialContentType | "all") || "all")
    ? (params.type as EditorialContentType | "all") || "all"
    : "all"

  const items = await listPublishedEditorialContent(
    activeType === "all" ? undefined : (activeType as EditorialContentType),
    locale,
    12,
  )

  const featured = items[0]
  const supporting = items.slice(1, 5)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.25)] sm:p-7 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#00A1DE]">{t("editorial", locale)}</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                {t("editorialArchive", locale)}
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
              <BookOpenText className="size-4" />
              {items.length} {locale === "rw" ? "ibitekerezo" : "features"}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            {t("editorialArchiveDescription", locale)}
          </p>
        </header>

        <div className="mb-7 flex flex-wrap gap-2">
          {typeOrder.map((type) => {
            const isActive = activeType === type
            return (
              <Link
                key={type}
                href={type === "all" ? "/editorial" : `/editorial?type=${type}`}
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold transition ${
                  isActive
                    ? "border-[#0A1931] bg-[#0A1931] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:text-sky-700"
                }`}
              >
                {typeLabel(type, locale)}
              </Link>
            )
          })}
        </div>

        {items.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_20px_50px_-36px_rgba(15,23,42,0.3)]">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-sky-50 text-[#00A1DE]">
              <Sparkles className="size-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">{t("editorialArchive", locale)}</h2>
            <p className="mt-2 text-sm text-slate-600">{t("noEditorialResults", locale)}</p>
          </div>
        ) : (
          <>
            {featured && (
              <section className="mb-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_26px_60px_-38px_rgba(10,25,49,0.38)]">
                <div className="grid gap-0 lg:grid-cols-[1.35fr_0.9fr]">
                  <Link href={`/editorial/${featured.content_type}/${featured.slug}`} className="group relative block min-h-[330px] bg-slate-200">
                    {featured.featured_image ? (
                      <img src={featured.featured_image} alt={featured.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-full items-end bg-[linear-gradient(135deg,#0A1931,#00A1DE)] p-5 text-left text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                        {typeLabel(featured.content_type, locale)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020b18]/80 via-[#020b18]/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8">
                      <div className="mb-3 flex items-center gap-2">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${typeTone(featured.content_type)}`}>
                          {typeLabel(featured.content_type, locale)}
                        </span>
                        {featured.historical_date && (
                          <span className="rounded-full border border-white/20 bg-slate-900/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90">
                            {featured.historical_date}
                          </span>
                        )}
                      </div>
                      <h2 className="max-w-xl text-2xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">
                        {featured.title}
                      </h2>
                    </div>
                  </Link>

                  <div className="flex flex-col justify-between bg-[#f8fafc] p-5 sm:p-6 lg:p-7">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00A1DE]">{t("editorial", locale)}</p>
                      <h3 className="mt-3 text-xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-2xl">
                        {featured.subtitle || featured.summary || "A deeper look at the stories shaping the present."}
                      </h3>
                    </div>
                    <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                      <p>{featured.summary || featured.subtitle || featured.body}</p>
                      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        {featured.category && <span>{featured.category}</span>}
                        {featured.reading_time && <span>{featured.reading_time} min</span>}
                        {featured.published_at && <span>{new Date(featured.published_at).toLocaleDateString(locale === "rw" ? "fr-FR" : "en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                      </div>
                    </div>
                    <Link href={`/editorial/${featured.content_type}/${featured.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0A1931]">
                      {featured.content_type === "history" ? t("readFeature", locale) : t("readStory", locale)} <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {supporting.length > 0 && (
              <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {supporting.map((item) => (
                  <Link
                    key={item.id}
                    href={`/editorial/${item.content_type}/${item.slug}`}
                    className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_22px_42px_-34px_rgba(15,23,42,0.32)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(0,161,222,0.35)]"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {item.featured_image ? (
                        <img src={item.featured_image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                      ) : (
                        <div className={`flex h-full items-end p-4 text-xs font-bold uppercase tracking-[0.18em] ${typeTone(item.content_type)}`}>
                          {typeLabel(item.content_type, locale)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${typeTone(item.content_type)}`}>
                        {typeLabel(item.content_type, locale)}
                      </span>
                      <h3 className="text-lg font-black leading-snug tracking-[-0.03em] text-slate-950 group-hover:text-sky-700">{item.title}</h3>
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.summary || item.subtitle || item.body}</p>
                    </div>
                  </Link>
                ))}
              </section>
            )}

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.slice(featured ? 5 : 0).map((item) => (
                <Link
                  key={item.id}
                  href={`/editorial/${item.content_type}/${item.slug}`}
                  className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_26px_50px_-30px_rgba(0,161,222,0.32)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-slate-100">
                    {item.featured_image ? (
                      <img src={item.featured_image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className={`flex h-full items-end p-4 text-xs font-bold uppercase tracking-[0.18em] ${typeTone(item.content_type)}`}>
                        {typeLabel(item.content_type, locale)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-3 pb-2">
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      <span className="text-[#00A1DE]">{typeLabel(item.content_type, locale)}</span>
                      {item.historical_date && <span>{item.historical_date}</span>}
                    </div>
                    <h3 className="text-xl font-black leading-snug tracking-[-0.03em] text-slate-950 group-hover:text-sky-700">{item.title}</h3>
                    <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.summary || item.subtitle || item.body}</p>
                    <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                      {item.content_type === "history" ? t("readFeature", locale) : t("readStory", locale)} <ArrowRight className="size-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
