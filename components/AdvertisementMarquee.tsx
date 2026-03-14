"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

interface Advertisement {
  id: string
  title: string
  description: string | null
  media_type: "image" | "video"
  media_url: string
  link_url: string | null
}

export default function AdvertisementMarquee() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch("/api/public/advertisements")
        if (!response.ok) throw new Error("Failed to fetch ads")
        const data = await response.json()
        setAds(data.ads || [])
      } catch (error) {
        console.error("Error fetching advertisements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [])

  // rotate every 60s
  useEffect(() => {
    if (!ads || ads.length === 0) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length)
    }, 60_000)
    return () => clearInterval(id)
  }, [ads])

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading ads...</div>
      </div>
    )
  }

  if (ads.length === 0) {
    return null
  }

  const AdContent = ({ ad }: { ad: Advertisement }) => {
    const content = (
      <div className="mb-2">
        {ad.media_type === "video" ? (
          <video
            src={ad.media_url}
            className="w-full h-auto rounded-lg"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <Image
            src={ad.media_url}
            alt={ad.title || "Advertisement"}
            width={1200}
            height={600}
            loading="lazy"
            unoptimized
            className="w-full h-auto rounded-lg"
          />
        )}
        {(ad.title || ad.description) && (
          <div className="mt-2 text-center">
            {ad.title && (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ad.title}</p>
            )}
            {ad.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400">{ad.description}</p>
            )}
          </div>
        )}
      </div>
    )

    if (ad.link_url) {
      return (
        <Link
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
          onClick={() => {
            // Track click
            fetch(`/api/public/advertisements/${ad.id}/click`, { method: "POST" }).catch(() => {})
          }}
        >
          {content}
        </Link>
      )
    }

    return content
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Advertisement</h3>
      </div>
      <div>
        <AdContent ad={ads[index]} />
        {ads.length > 1 && (
          <div className="mt-2 flex items-center justify-center gap-1">
            {ads.map((_, i) => (
              <span
                key={i}
                className={`inline-block h-1.5 w-1.5 rounded-full ${i === index ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
              />)
            )}
          </div>
        )}
      </div>
    </div>
  )
}

