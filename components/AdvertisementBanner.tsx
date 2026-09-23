"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import type { PublicAdvertisement } from "@/lib/advertisements"

const isSupportedMediaUrl = (url: string | null, mediaType: "image" | "video") => {
  if (!url) return false
  const extension = mediaType === "video" ? /\.(mp4|webm)(?:[?#]|$)/i : /\.(jpe?g|png|webp|gif|svg)(?:[?#]|$)/i
  return extension.test(url)
}

export default function AdvertisementBanner({ ad }: { ad: PublicAdvertisement }) {
  const [mediaFailed, setMediaFailed] = useState(false)
  if (mediaFailed) return null
  const mobileMedia = isSupportedMediaUrl(ad.mobile_media_url, ad.media_type) ? ad.mobile_media_url : null

  const content = (
    <>
      {ad.media_type === "video" ? (
        <video
          poster={ad.poster_url || undefined}
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
          aria-label={ad.title}
          className="h-24 w-full shrink-0 rounded-lg object-cover sm:h-28 sm:w-56 lg:h-32 lg:w-64"
          onError={() => setMediaFailed(true)}
        >
          {mobileMedia && <source media="(max-width: 639px)" src={mobileMedia} />}
          <source src={ad.media_url} />
        </video>
      ) : (
        <picture className="shrink-0">
          {mobileMedia && <source media="(max-width: 639px)" srcSet={mobileMedia} />}
          <Image
            src={ad.media_url}
            alt={ad.title}
            width={128}
            height={96}
            unoptimized
            className="h-16 w-24 rounded-md object-cover sm:h-20 sm:w-32"
            onError={() => setMediaFailed(true)}
          />
        </picture>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="mb-1 font-display text-lg font-black leading-tight tracking-[0.01em] text-white sm:text-2xl">{ad.title}</h2>
        {ad.description && <p className="mb-0 line-clamp-2 text-sm leading-5 text-slate-200">{ad.description}</p>}
      </div>
      {ad.cta_text && <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#fad201] px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-slate-950">{ad.cta_text}<ArrowUpRight className="size-4" aria-hidden="true" /></span>}
    </>
  )

  return (
    <section aria-label="Advertisement" className="relative overflow-hidden border-b border-slate-800/20 bg-[#071b38] text-white shadow-[0_10px_30px_-22px_rgba(2,18,48,0.8)]">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_80%_20%,rgba(0,161,222,0.26),transparent_34%),linear-gradient(115deg,transparent_0%,rgba(250,210,1,0.08)_48%,transparent_72%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-[#00a1de] to-transparent motion-safe:animate-[ad-shimmer_8s_linear_infinite]" aria-hidden="true" />
      {ad.link_url ? <Link href={ad.link_url} target={/^https?:\/\//.test(ad.link_url) ? "_blank" : undefined} rel={/^https?:\/\//.test(ad.link_url) ? "noopener noreferrer" : undefined} className="relative mx-auto flex max-w-7xl flex-col items-stretch gap-3 px-4 py-3 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex-row sm:items-center sm:gap-4 sm:px-6 lg:px-8">{content}</Link> : <div className="relative mx-auto flex max-w-7xl flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 lg:px-8">{content}</div>}
    </section>
  )
}
