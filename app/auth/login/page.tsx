"use client"

import type React from "react"

import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { roleFromHost } from "@/lib/host"
import { getRedirectTarget } from "@/lib/auth-redirect"
import { getLocaleFromPath, t } from "@/lib/i18n"
import { usePathname } from "next/navigation"
import { LocaleSwitcher } from "@/components/locale-switcher"

type PendingMfaState = {
  factorId: string
  challengeId: string
  factorName: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingMfa, setPendingMfa] = useState<PendingMfaState | null>(null)
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const [isMfaSetupRequired, setIsMfaSetupRequired] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getRedirectTarget(searchParams.get("redirectTo"))
  const locale = getLocaleFromPath(usePathname())

  const clearCurrentSession = async () => {
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" })

    if (signOutError) {
      console.error("[login] current session cleanup failed", {
        browserSignOutFailed: true,
      })
    }
  }

  const resolveDashboardTarget = (profileRole: string) => {
    let target = redirectTo
    const hostRole = roleFromHost(typeof window !== "undefined" ? window.location.host : "")
    if (target === "/dashboard") {
      if (hostRole) target = `/dashboard/${hostRole}`
      if (profileRole === "admin") target = "/dashboard/admin"
      else if (profileRole === "superadmin") target = "/dashboard/superadmin"
      else if (profileRole === "reporter") target = "/dashboard/reporter"
      else if (profileRole === "subscriber") target = "/dashboard/subscriber"
      else if (profileRole === "advertiser") target = "/dashboard/advertiser"
      else if (profileRole === "supporter") target = "/dashboard/supporter"
      else target = "/dashboard/public"
    }
    return target
  }

  const completeLogin = async () => {
    type UserProfileRow = { is_approved: boolean; role: string }
    const { data: profile, error: profileError } = (await supabase
      .rpc("get_current_user_profile")
      .single()) as { data: UserProfileRow | null; error: { message: string } | null }

    if (profileError || !profile) {
      setError(locale === "rw" ? "Kwinjira byanze. Ongera ugerageze." : "Unable to verify your account. Please try again.")
      return
    }

    if (!profile.is_approved) {
      await clearCurrentSession()
      setIsPendingApproval(true)
      setError(locale === "rw" ? "Konti yawe itegereje kwemezwa. Tegereza cyangwa utwandikire." : "Your account is pending approval. Please wait or contact the administrator.")
      return
    }

    router.replace(resolveDashboardTarget(profile.role))
  }

  const startMfaChallengeIfRequired = async (): Promise<"required" | "not-required" | "error"> => {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError || !aalData) {
      setError("Unable to verify the authentication assurance level. Please try again.")
      return "error"
    }

    const { data: userData } = await supabase.auth.getUser()
    const mfaRequired = userData.user?.app_metadata?.mfa_required === true

    if (aalData.nextLevel !== "aal2" || aalData.currentLevel === "aal2") {
      if (mfaRequired && aalData.currentLevel !== "aal2") {
        setIsMfaSetupRequired(true)
        setError("Your administrator requires MFA. Set up an authenticator before continuing.")
        return "error"
      }
      return "not-required"
    }

    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
    if (factorsError) {
      setError("This account requires MFA, but the authenticator configuration could not be loaded.")
      return "error"
    }

    const verifiedTotpFactor = (factorsData?.all ?? []).find((factor) => {
      return factor.factor_type === "totp" && factor.status === "verified"
    })

    if (!verifiedTotpFactor) {
      if (mfaRequired) {
        setIsMfaSetupRequired(true)
      }
      setError("This account requires MFA, but no verified authenticator factor is available.")
      return "error"
    }

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: verifiedTotpFactor.id,
    })

    if (challengeError || !challengeData?.id) {
      setError("Unable to start the MFA verification challenge.")
      return "error"
    }

    setPendingMfa({
      factorId: verifiedTotpFactor.id,
      challengeId: challengeData.id,
      factorName: verifiedTotpFactor.friendly_name ?? "Authenticator app",
    })
    setMfaCode("")
    setError(null)
    return "required"
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Authentication service is not configured. Please contact support.")
      return
    }

    let cancelled = false
    ;(async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        if (!cancelled) setError("Unable to verify your current session. Please sign in again.")
        return
      }
      if (!data.session) return
      try {
        const mfaResult = await startMfaChallengeIfRequired()
        if (cancelled || mfaResult !== "not-required") return
        await completeLogin()
      } catch {
        if (!cancelled) setError(locale === "rw" ? "Kwinjira byanze. Ongera ugerageze." : "Unable to verify your account. Please sign in again.")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router, redirectTo])

  const handleMfaVerification = async () => {
    if (!pendingMfa) return

    if (!mfaCode.trim() || mfaCode.trim().length < 6) {
      setError("Enter the 6-digit code from your authenticator app.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: pendingMfa.factorId,
        challengeId: pendingMfa.challengeId,
        code: mfaCode.trim(),
      })

      if (verifyError) {
        setMfaCode("")
        setError("Invalid verification code. Please try again. If the challenge has expired, cancel and sign in again.")
        return
      }

      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aalError || aalData?.currentLevel !== "aal2") {
        setMfaCode("")
        setError("MFA verification did not complete successfully. Please try again.")
        await startMfaChallengeIfRequired()
        return
      }

      setPendingMfa(null)
      setMfaCode("")
      await completeLogin()
    } catch {
      setMfaCode("")
      setError(locale === "rw" ? "Kwinjira byanze. Ongera ugerageze." : "MFA verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getLoginErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("failed to fetch") || message.includes("network")) {
        return locale === "rw"
          ? "Uruzinduko rw'amakuru rwahagaritswe. Reba intaneti cyangwa ugerageze nyuma."
          : "Network connection failed while signing in. Please check your connection and try again."
      }
      if (message.includes("invalid login credentials") || message.includes("invalid_grant") || message.includes("user not found")) {
        return locale === "rw"
          ? "Amakuru yo kwinjira ntabwo ahura. Reba imeyili n'ijambobanga."
          : "The email or password is incorrect. Please try again."
      }
      if (message.includes("auth") && message.includes("service") && message.includes("configure")) {
        return locale === "rw"
          ? "Serivisi yo kwinjira ntishobora gukorwa. Twandikire ubufasha."
          : "Authentication service is temporarily unavailable. Please contact support."
      }
      return locale === "rw"
        ? "Kwinjira byanze. Ongera ugerageze."
        : "Login failed. Please try again."
    }

    return locale === "rw"
      ? "Kwinjira byanze. Ongera ugerageze."
      : "Login failed. Please try again."
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError("Authentication service is not configured. Please contact support.")
      return
    }

    setIsLoading(true)
    setError(null)
    setIsPendingApproval(false)
    setIsMfaSetupRequired(false)
    setPendingMfa(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        setError(locale === "rw" ? "Kwinjira byanze. Ongera ugerageze." : "Login failed. Please try again.")
        return
      }

      if (!authData.session) {
        await clearCurrentSession()
        setError(locale === "rw" ? "Kwinjira byanze. Ongera ugerageze." : "Unable to establish a secure session. Please try again.")
        return
      }

      const mfaResult = await startMfaChallengeIfRequired()
      if (mfaResult === "error") return
      if (mfaResult === "not-required") await completeLogin()
    } catch (error) {
      setError(getLoginErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelMfa = async () => {
    await clearCurrentSession()
    setPendingMfa(null)
    setMfaCode("")
    setError(locale === "rw" ? "Ihuzagura ryahagaritswe. Ongera winjire." : "MFA verification was canceled. Please sign in again.")
  }

  const renderMfaGate = () => {
    if (!pendingMfa) return null

    return (
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Your password was accepted. Enter the 6-digit code from your authenticator app.
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mfa-code">Verification code</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={handleCancelMfa} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={handleMfaVerification} disabled={isLoading || mfaCode.length < 6}>
            {isLoading ? "Verifying…" : "Verify"}
          </Button>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl">{pendingMfa ? "Two-Factor Authentication" : t("login", locale)}</CardTitle>
            <CardDescription>
              {pendingMfa ? `Use the six-digit code from ${pendingMfa.factorName}.` : t("enterCredentials", locale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingMfa ? (
              renderMfaGate()
            ) : (
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("email", locale)}</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="username"
                      placeholder="reporter@tuganire.com"
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
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className={`rounded-md p-3 ${isPendingApproval ? "bg-amber-50" : "bg-red-50"}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          className={`h-5 w-5 mt-0.5 ${isPendingApproval ? "text-amber-600" : "text-red-600"}`}
                        />
                        <div>
                          <p className={`text-sm font-medium ${isPendingApproval ? "text-amber-900" : "text-red-900"}`}>
                            {isPendingApproval ? t("pendingApproval", locale) : t("loginFailed", locale)}
                          </p>
                          <p className={`text-sm mt-1 ${isPendingApproval ? "text-amber-700" : "text-red-600"}`}>
                            {error}
                          </p>
                          {isMfaSetupRequired && (
                            <Link href="/dashboard/public/security" className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
                              Open 2FA Setup
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("loggingIn", locale) : t("login", locale)}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  {t("noAccount", locale)}{" "}
                  <Link href={`/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-medium text-primary underline-offset-4 hover:underline">
                    {t("signUp", locale)}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
