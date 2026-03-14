import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Articles",
  description: "Browse the latest published stories, analysis, and reports from Tuganire News.",
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "Articles - Tuganire News",
    description: "Browse the latest published stories, analysis, and reports from Tuganire News.",
    url: "/articles",
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles - Tuganire News",
    description: "Browse the latest published stories, analysis, and reports from Tuganire News.",
  },
}

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children
}
