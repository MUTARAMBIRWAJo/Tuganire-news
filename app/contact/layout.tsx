import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Tuganire News for editorial tips, partnerships, and advertising inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Tuganire News",
    description: "Contact Tuganire News for editorial tips, partnerships, and advertising inquiries.",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Tuganire News",
    description: "Contact Tuganire News for editorial tips, partnerships, and advertising inquiries.",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
