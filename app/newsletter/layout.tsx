import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Subscribe to the Tuganire News newsletter for top stories and analysis.",
  alternates: {
    canonical: "/newsletter",
  },
  openGraph: {
    title: "Newsletter - Tuganire News",
    description: "Subscribe to the Tuganire News newsletter for top stories and analysis.",
    url: "/newsletter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter - Tuganire News",
    description: "Subscribe to the Tuganire News newsletter for top stories and analysis.",
  },
}

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children
}
