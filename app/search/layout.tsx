import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search",
  description: "Search published articles, topics, and authors on Tuganire News.",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "Search - Tuganire News",
    description: "Search published articles, topics, and authors on Tuganire News.",
    url: "/search",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search - Tuganire News",
    description: "Search published articles, topics, and authors on Tuganire News.",
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
