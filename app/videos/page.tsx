import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import VideosClient from "@/components/videos/VideosClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Videos",
  description: "Watch latest video reports and featured clips from Tuganire News.",
  alternates: {
    canonical: "/videos",
  },
  openGraph: {
    title: "Videos - Tuganire News",
    description: "Watch latest video reports and featured clips from Tuganire News.",
    url: "/videos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Videos - Tuganire News",
    description: "Watch latest video reports and featured clips from Tuganire News.",
  },
}

export const dynamic = "force-dynamic"

function toEmbedUrl(url: string): string {
  if (!url) return ""
  try {
    // Handle youtu.be short links
    const short = url.match(/^https?:\/\/youtu\.be\/([\w-]{6,})/i)
    if (short) return `https://www.youtube.com/embed/${short[1]}`
    // Handle standard watch URLs
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return `https://www.youtube.com/embed/${v}`
    // Fallback: replace watch?v=
    return url.replace("watch?v=", "embed/")
  } catch {
    return url.replace("watch?v=", "embed/")
  }
}

function youtubeId(url: string): string | null {
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

export default async function VideosPage() {
  const supabase = await createClient()
  const { data: videos } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, published_at, youtube_link, article_type")
    .eq("article_type", "video")
    .order("created_at", { ascending: false })
    .limit(30)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />
      <main>
        <div className="mb-6 container mx-auto px-4 pt-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Videos</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Latest video stories</p>
        </div>
        <VideosClient videos={videos ?? []} />
      </main>
      <SiteFooter />
    </div>
  )
}
