import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Inter, Merriweather } from "next/font/google"
import "./globals.css"
import ChatWidget from "@/components/ai/ChatWidget"
import AdsKeeperPopup from "@/components/ads/AdsKeeperPopup"
import { AutoRefresh } from "@/components/auto-refresh"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

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
        <meta name="yandex-verification" content="f6575f91308a959a" />
        {/* AdsKeeper Ad Network */}
        <Script 
          src="https://jsc.adskeeper.com/site/1087913.js" 
          async 
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${merriweather.variable} font-sans antialiased`}>
        {children}
        <AdsKeeperPopup widgetId="1999345" />
        <AutoRefresh intervalMs={60000} />
        <ChatWidget />
      </body>
    </html>
  )
}
