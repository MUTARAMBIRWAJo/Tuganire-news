"use client"

import type React from "react"

import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { getRedirectTarget } from "@/lib/auth-redirect"
import { getLocaleFromPath, t } from "@/lib/i18n"
import { usePathname } from "next/navigation"
import { LocaleSwitcher } from "@/components/locale-switcher"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getRedirectTarget(searchParams.get("redirectTo"))
  const locale = getLocaleFromPath(usePathname())

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabases = supabase
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError(t("passwordsMismatch", locale))
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError(t("passwordMin", locale))
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabases.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}${redirectTo}`,
          data: {
            full_name: fullName,
            role: "public",
          },
        },
      })
      if (error) throw error

      // Call Supabase Edge Function to notify admins
      try {
        await fetch("/functions/v1/notify-user-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ record: { email, display_name: fullName } }),
        })
      } catch (notifyErr) {
        // Optionally log notification error
        console.warn("Admin notification failed", notifyErr)
      }

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(locale === "rw" ? "Konti ntiyashoboye gukorwa. Ongera ugerageze." : "Account creation failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center"><LocaleSwitcher /></div>
          <Image
            src="/placeholder-logo.png"
            alt={t("brand", locale)}
            width={48}
            height={48}
            className="mx-auto h-12 w-12 mb-2"
            priority
          />
          <h1 className="text-3xl font-bold text-slate-900">Tuganire TNT</h1>
          <p className="text-slate-600 mt-2">{t("platformDescription", locale)}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("createAccount", locale)}</CardTitle>
            <CardDescription>{t("signUpDescription", locale)}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">{t("fullName", locale)}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="First Name   Last Name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("email", locale)}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder=".............@gmail.com/@yahoo.com etc.."
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{locale === "rw" ? "Ijambobanga" : "Password"}</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">{t("confirmPassword", locale)}</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("creatingAccount", locale) : t("signUp", locale)}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {t("alreadyAccount", locale)}{" "}
                <Link href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  {t("login", locale)}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
