"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Mail, CheckCircle } from "lucide-react"
import { getLocaleFromPath, t } from "@/lib/i18n"
import { usePathname } from "next/navigation"
import { LocaleSwitcher } from "@/components/locale-switcher"

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const locale = getLocaleFromPath(usePathname())

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const supabases = supabase

    try {
      const { error } = await supabases.from("newsletter_subscribers").insert({
        email,
        full_name: fullName || null,
        is_verified: true, // Auto-verify for simplicity
      })

      if (error) {
        if (error.code === "23505") {
          throw new Error(t("alreadySubscribed", locale))
        }
        throw error
      }

      setSuccess(true)
      setEmail("")
      setFullName("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("somethingWentWrong", locale))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/placeholder-logo.png"
                alt={t("brand", locale)}
                width={40}
                height={40}
                className="h-8 w-8 md:h-10 md:w-10"
                priority
              />
              <span className="text-xl md:text-2xl font-bold text-slate-900">{t("brand")}</span>
            </Link>
            <div className="flex items-center gap-3">
              <LocaleSwitcher />
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}`}>{t("backHome", locale)}</Link>
              </Button>
              <Link href="/careers" className="text-sm text-slate-600 hover:text-slate-900">
                {t("careers", locale)}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="w-full max-w-md">
          {success ? (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">{t("subscribedTitle", locale)}</CardTitle>
                <CardDescription>{t("subscribedDescription", locale)}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  {t("subscribedDetails", locale)}
                </p>
                <Button asChild className="w-full">
                  <Link href={`/${locale}`}>{t("backHome", locale)}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("newsletterTitle", locale)}</CardTitle>
                <CardDescription>{t("newsletterDescription", locale)}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("fullNameOptional", locale)}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("emailAddress", locale)}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className="rounded-md bg-red-50 p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("subscribing", locale) : t("subscribe", locale)}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {t("privacyConsent", locale)}
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
