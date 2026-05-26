"use client"

import type React from "react"

import { supabase } from "@/lib/supabaseClient"
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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getRedirectTarget(searchParams.get("redirectTo"))

  // If already authenticated, route away from login immediately
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return
      try {
        const { data: profile } = (await supabase
          .rpc("get_current_user_profile")
          .single()) as { data: { role: string } | null }
        let target = redirectTo
        const hostRole = roleFromHost(typeof window !== "undefined" ? window.location.host : "")
        if (target === "/dashboard" && hostRole) target = `/dashboard/${hostRole}`
        if (profile?.role === "admin") target = "/dashboard/admin"
        else if (profile?.role === "superadmin") target = "/dashboard/superadmin"
        else if (profile?.role === "reporter") target = "/dashboard/reporter"
        else if (profile?.role === "subscriber") target = "/dashboard/subscriber"
        else if (profile?.role === "advertiser") target = "/dashboard/advertiser"
        else if (profile?.role === "supporter") target = "/dashboard/supporter"
        else target = "/dashboard/public"
        if (!cancelled) router.replace(target)
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabases = supabase
    setIsLoading(true)
    setError(null)
    setIsPendingApproval(false)

    try {
      const { data: authData, error: authError } = await supabases.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Ensure server-side session cookies are set before navigating
        const { data: sessionData, error: sessionErr } = await supabases.auth.getSession()
        if (sessionErr) console.error("[login] getSession error", sessionErr)
        console.debug("[login] session after signIn", sessionData.session)
        const access_token = sessionData.session?.access_token
        const refresh_token = sessionData.session?.refresh_token
        if (access_token && refresh_token) {
          try {
            const resp = await fetch("/api/auth/set-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ access_token, refresh_token }),
              credentials: "include",
            })
            if (!resp.ok) {
              const j = await resp.json().catch(() => ({}))
              console.error("[login] set-session failed", resp.status, j)
            } else {
              console.debug("[login] set-session ok")
            }
          } catch {}
        }

        type UserProfileRow = { is_approved: boolean; role: "public" | "subscriber" | "advertiser" | "supporter" | "reporter" | "admin" | "superadmin" }
        const { data: profile, error: rpcError } = (await supabases
          .rpc("get_current_user_profile")
          .single()) as { data: UserProfileRow | null; error: any }

        if (rpcError) {
          // Non-fatal: fallback to dashboard
          router.push(redirectTo)
          router.refresh()
          setTimeout(() => {
            if (window.location.pathname.startsWith("/auth")) {
              window.location.href = redirectTo
            }
          }, 150)
          return
        }

        // If the profile row doesn't exist yet (trigger delay), proceed for now
        if (!profile) {
          router.push(redirectTo)
          router.refresh()
          setTimeout(() => {
            if (window.location.pathname.startsWith("/auth")) {
              window.location.href = redirectTo
            }
          }, 150)
          return
        }

        if (!profile.is_approved) {
          await supabases.auth.signOut()
          setIsPendingApproval(true)
          setError("Your account is pending approval. Please wait or contact the SuperAdmin.")
          return
        }

        // Role-based routing
        let target = "/dashboard"
        const hostRole = roleFromHost(typeof window !== "undefined" ? window.location.host : "")
        if (hostRole) target = `/dashboard/${hostRole}`
        if (profile.role === "admin") target = "/dashboard/admin"
        else if (profile.role === "superadmin") target = "/dashboard/superadmin"
        else if (profile.role === "reporter") target = "/dashboard/reporter"
        else if (profile.role === "subscriber") target = "/dashboard/subscriber"
        else if (profile.role === "advertiser") target = "/dashboard/advertiser"
        else if (profile.role === "supporter") target = "/dashboard/supporter"
        else target = "/dashboard/public"

        // Small confirmation the session exists before navigation
        const { data: confirm } = await supabases.auth.getSession()
        console.debug("[login] confirm session before redirect", !!confirm.session)
        router.replace(target)
        // Hard navigation fallback (in case client-side routing is blocked)
        setTimeout(() => {
          if (window.location.pathname.startsWith("/auth")) {
            window.location.href = target
          }
        }, 200)
        return
      }

      // Fallback
      router.push(redirectTo)
      router.refresh()
      setTimeout(() => {
        if (window.location.pathname.startsWith("/auth")) {
          window.location.href = redirectTo
        }
      }, 150)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/placeholder-logo.png"
            alt="Tuganire News logo"
            width={48}
            height={48}
            className="mx-auto h-12 w-12 mb-2"
            priority
          />
          <h1 className="text-3xl font-bold text-slate-900">Tuganire TNT</h1>
          <p className="text-slate-600 mt-2">News & Newsletter Platform</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="reporter@tuganire.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
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
                          {isPendingApproval ? "Account Pending Approval" : "Login Failed"}
                        </p>
                        <p className={`text-sm mt-1 ${isPendingApproval ? "text-amber-700" : "text-red-600"}`}>
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href={`/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
