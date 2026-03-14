import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore news topics by category on Tuganire News.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Categories - Tuganire News",
    description: "Explore news topics by category on Tuganire News.",
    url: "/categories",
  },
  twitter: {
    card: "summary_large_image",
    title: "Categories - Tuganire News",
    description: "Explore news topics by category on Tuganire News.",
  },
}

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
