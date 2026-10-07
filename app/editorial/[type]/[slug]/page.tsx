import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpenText, Clock3, MapPin, Sparkles } from "lucide-react"
import { getEditorialBySlug, type EditorialContentType } from "@/lib/editorial"

const typeStyles: Record<EditorialContentType, string> = {
  magazine: "bg-[#f6efe4] text-[#1f2937] border-[#d9c7a1]",
  research: "bg-[#eef6ff] text-[#0f172a] border-[#bfdaf7]",
  story: "bg-[#eefbf4] text-[#12372a] border-[#b7d7c6]",
  history: "bg-[#f5f1ee] text-[#2b2a29] border-[#d8c7bb]",
}

const typeLabel = (value: string) => {
  if (value === "magazine") return "Magazine"
  if (value === "research") return "Research"
  if (value === "story") return "Stories"
  if (value === "history") return "History"
  return value
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string }>
}) {
  const resolved = await params
  const type = (resolved.type as EditorialContentType) || "story"
  const item = await getEditorialBySlug(type, resolved.slug)

  if (!item) {
    return { title: "Editorial item not found" }
  }

  return {
    title: `${item.title} | Tuganire Editorial`,
    description: item.summary || item.subtitle || item.body || "",
  }
}

export default async function EditorialDetailPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>
}) {
  const resolved = await params
  const type = (resolved.type as EditorialContentType) || "story"
  const item = await getEditorialBySlug(type, resolved.slug)

  if (!item) return notFound()

  const media = Array.isArray(item.media) ? item.media : []
  const featureImage = media.find((entry: any) => entry.is_featured)?.url || item.featured_image || media[0]?.url || null
  const labels = [item.content_type, item.category].filter(Boolean)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link href="/editorial" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950">
          <ArrowLeft className="size-4" /> Back to editorial
        </Link>

        <article className="mt-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_64px_-42px_rgba(15,23,42,0.42)]">
          {featureImage && (
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <img src={featureImage} alt={item.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="space-y-8 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00A1DE]">
              <span className={`rounded-full border px-2.5 py-1 ${typeStyles[(item.content_type as EditorialContentType) || "story"]}`}>
                {typeLabel(String(item.content_type))}
              </span>
              {item.category && <span className="text-slate-500">{item.category}</span>}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-3xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-[3.5rem]">{item.title}</h1>
              {item.subtitle && <p className="max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">{item.subtitle}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><Clock3 className="size-4" /> {item.reading_time || 6} min read</span>
              {item.historical_date && <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><MapPin className="size-4" /> {item.historical_date}</span>}
              {item.historical_location && <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><Sparkles className="size-4" /> {item.historical_location}</span>}
            </div>

            {item.summary && <p className="max-w-3xl text-lg leading-8 text-slate-700">{item.summary}</p>}

            {item.body && (
              <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-[-0.03em] prose-p:text-lg prose-p:leading-8 prose-li:text-lg prose-li:leading-7 text-slate-800" dangerouslySetInnerHTML={{ __html: item.body }} />
            )}

            {item.sources?.length ? (
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00A1DE]">
                  <BookOpenText className="size-4" /> Sources
                </div>
                <ul className="space-y-3 text-sm text-slate-700">
                  {item.sources.map((source: any) => (
                    <li key={source.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="font-semibold text-slate-900">{source.source_name || source.organization || "Source"}</div>
                      {source.url && <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sky-700 underline">{source.url}</a>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(item.research_question || item.main_findings || item.why_it_matters_today) && (
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                {item.research_question && (
                  <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-5 sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00A1DE]">Research question</p>
                    <p className="mt-3 text-xl font-black leading-snug tracking-[-0.03em] text-slate-950">{item.research_question}</p>
                  </div>
                )}
                {item.main_findings && (
                  <div className="rounded-[24px] border border-slate-200 bg-[#0A1931] p-5 text-white sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAD201]">Main findings</p>
                    <p className="mt-3 text-base leading-7 text-slate-200">{item.main_findings}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  )
}
