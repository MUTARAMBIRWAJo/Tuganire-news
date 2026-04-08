import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Inter, Merriweather } from "next/font/google"
import "./globals.css"
import ChatWidget from "@/components/ai/ChatWidget"
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
const adSenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-REPLACE_WITH_MY_PUBLISHER_ID"
const shouldLoadAdSense = process.env.NODE_ENV === "production" && adSenseClient.startsWith("ca-pub-") && !adSenseClient.includes("REPLACE_WITH")

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
        {shouldLoadAdSense && <meta name="google-adsense-account" content={adSenseClient} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* AdsKeeper Ad Network */}
        <Script 
          src="https://jsc.adskeeper.com/site/1087913.js" 
          async 
          strategy="afterInteractive"
        />
        {shouldLoadAdSense && (
          <>
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <Script
              async
              custom-element="amp-auto-ads"
              src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
              strategy="afterInteractive"
            />
          </>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${merriweather.variable} font-sans antialiased`}>
        {shouldLoadAdSense && <amp-auto-ads type="adsense" data-ad-client={adSenseClient}></amp-auto-ads>}
        {children}
        <AutoRefresh intervalMs={60000} />
        <ChatWidget />
      </body>
    </html>
  )
}
