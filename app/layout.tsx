import type React from "react"
import type { Metadata } from "next"
import { Inter, Merriweather, Space_Grotesk } from "next/font/google"
import "./globals.css"
import ChatWidget from "@/components/ai/ChatWidget"
import AdNetworkManager from "@/components/ads/AdNetworkManager"
import { AutoRefresh } from "@/components/auto-refresh"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
  weight: ["300", "400", "700", "900"],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="yandex-verification" content="a0e9f1b474420893" />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <AdNetworkManager />
        {children}
        <AutoRefresh intervalMs={60000} />
        <ChatWidget />
      </body>
    </html>
  )
}
