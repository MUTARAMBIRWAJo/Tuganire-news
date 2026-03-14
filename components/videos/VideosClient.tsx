"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import Image from "next/image"

type VideoItem = {
  id: string | number
  slug?: string | null
  title: string
  excerpt?: string | null
  summary?: string | null
  youtube_link?: string | null
  published_at?: string | null
}

function youtubeId(url?: string | null): string | null {
  if (!url) return null
  try {
    const short = url.match(/^https?:\/\/youtu\.be\/([\w-]{6,})/i)
    if (short) return short[1]
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return v
    const m = url.match(/\/embed\/([\w-]{6,})/)
    return m ? m[1] : null
  } catch {
    const m = url.match(/(?:v=|\/embed\/)([\w-]{6,})/)
    return m ? m[1] : null
  }
}

function toEmbedUrl(url?: string | null): string {
  if (!url) return ""
  try {
    const short = url.match(/^https?:\/\/youtu\.be\/([\w-]{6,})/i)
    if (short) return `https://www.youtube.com/embed/${short[1]}`
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return `https://www.youtube.com/embed/${v}`
    return url.replace("watch?v=", "embed/")
  } catch {
    return url.replace("watch?v=", "embed/")
  }
}

export default function VideosClient({ videos }: { videos: VideoItem[] }) {
  const [selected, setSelected] = useState<VideoItem | null>(null)

  const hero = useMemo(() => (videos?.length ? videos[0] : null), [videos])
  const rest = useMemo(() => (videos?.length ? videos.slice(1) : []), [videos])
  const sidebar = useMemo(() => rest.slice(0, 6), [rest])
  const remaining = useMemo(() => rest.slice(6), [rest])

  // Close on escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const thumb = useCallback((v: VideoItem) => {
    const id = youtubeId(v.youtube_link || undefined)
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      {/* Hero + Sidebar */}
      {hero ? (
        <section className="mb-10">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Hero (smaller visual presence via tighter spacing/rounded) */}
            <div className="lg:col-span-2">
              <div className="mx-auto w-full max-w-3xl h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-black shadow">
                <iframe
                  className="w-full h-full"
                  src={toEmbedUrl(hero.youtube_link)}
                  title={hero.title}
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <h1 className="text-lg md:text-xl font-semibold mt-2 text-slate-900 dark:text-white">{hero.title}</h1>
              {(hero.excerpt || hero.summary) && (
                <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm">{hero.excerpt || hero.summary}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {hero.slug && (
                  <a href={`/articles/${hero.slug}`} className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Watch here</a>
                )}
                {hero.youtube_link && (
                  <a href={hero.youtube_link} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">YouTube</a>
                )}
              </div>
            </div>

            {/* Sidebar: Recent videos list */}
            <aside className="lg:col-span-1">
              <h2 className="text-base font-semibold mb-3 text-slate-900 dark:text-white">Recent videos</h2>
              <div className="space-y-3">
                {sidebar.length === 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">No more videos.</p>
                )}
                {sidebar.map((v) => {
                  const id = youtubeId(v.youtube_link || undefined)
                  const t = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
                  return (
                    <button
                      key={String(v.id)}
                      type="button"
                      onClick={() => setSelected(v)}
                      className="w-full flex items-center gap-3 rounded-md border border-slate-200 dark:border-slate-700 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <div className="relative flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 w-28 h-[80px] aspect-video">
                        {t ? (
                          <Image src={t} alt={v.title} fill unoptimized loading="lazy" className="object-cover object-center" />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-slate-400 text-xs">No preview</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{v.title}</p>
                        {(v.excerpt || v.summary) && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{v.excerpt || v.summary}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>
          </div>
        </section>
      ) : (
        <p className="text-slate-600">No video articles yet.</p>
      )}

      {/* Grid */}
      {remaining.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">More videos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {remaining.map((v) => {
              const t = thumb(v)
              return (
                <article key={String(v.id)} className="rounded-lg border bg-white dark:bg-slate-900 overflow-hidden hover:shadow transition-shadow">
                  <button type="button" onClick={() => setSelected(v)} className="block w-full text-left">
                    <div className="relative overflow-hidden rounded-xl bg-gray-100 w-full aspect-video h-[180px]">
                      {t ? (
                        <Image src={t} alt={v.title} fill unoptimized loading="lazy" className="object-cover object-center" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No preview</div>
                      )}
                    </div>
                  </button>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{v.title}</h3>
                    {(v.excerpt || v.summary) && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{v.excerpt || v.summary}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2 justify-end">
                      {v.slug && (
                        <a href={`/articles/${v.slug}`} className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Watch here</a>
                      )}
                      {v.youtube_link && (
                        <a href={v.youtube_link} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">YouTube</a>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-slate-950 rounded-lg p-3 w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video rounded-md overflow-hidden bg-black">
              <iframe
                className="w-full h-full"
                src={toEmbedUrl(selected.youtube_link)}
                title={selected.title}
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{selected.title}</h3>
                {(selected.excerpt || selected.summary) && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">{selected.excerpt || selected.summary}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selected.slug && (
                  <a href={`/articles/${selected.slug}`} className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Watch here</a>
                )}
                {selected.youtube_link && (
                  <a href={selected.youtube_link} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">YouTube</a>
                )}
                <button className="text-sm px-3 py-1 rounded border border-slate-300 dark:border-slate-600" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
