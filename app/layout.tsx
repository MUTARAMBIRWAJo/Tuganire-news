import type React from "react"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import "./globals.css"
import { LocaleDocument } from "@/components/locale-document"

const AdNetworkManager = dynamic(() => import("@/components/ads/AdNetworkManager"))

const AutoRefresh = dynamic(() => import("@/components/auto-refresh").then((mod) => mod.AutoRefresh))

const ChatWidget = dynamic(() => import("@/components/ai/ChatWidget"))

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tuganire.site"
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tuganire News - Breaking News and In-Depth Analysis",
    template: "%s | Tuganire News",
  },
  description: "Independent journalism and verified reporting from Rwanda, Africa, and around the world.",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Tuganire News",
    title: "Tuganire News - Breaking News and In-Depth Analysis",
    description: "Independent journalism and verified reporting from Rwanda, Africa, and around the world.",
    images: ["/placeholder-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuganire News - Breaking News and In-Depth Analysis",
    description: "Independent journalism and verified reporting from Rwanda, Africa, and around the world.",
    images: ["/placeholder-logo.png"],
  },
  icons: {
    icon: "/placeholder-logo.png",
    shortcut: "/placeholder-logo.png",
    apple: "/placeholder-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="yandex-verification" content="a0e9f1b474420893" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <LocaleDocument />
        <AdNetworkManager />
        {children}
        <AutoRefresh intervalMs={60000} />
        <ChatWidget />
      </body>
    </html>
  )
}
