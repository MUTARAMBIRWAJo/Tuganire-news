"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, LogOut, MonitorSmartphone } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"

export function SecuritySessionPanel() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return
      if (sessionError || !data.session) {
        setError("Unable to load the current session.")
      } else {
        setEmail(data.session.user.email ?? null)
        setSessionStartedAt(data.session.user.last_sign_in_at ?? null)
      }
      setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const signOutOtherSessions = async () => {
    setIsBusy(true)
    setError(null)
    setSuccess(null)

    const { error: signOutError } = await supabase.auth.signOut({ scope: "others" })
    if (signOutError) {
      setError("Unable to sign out other sessions. Please try again.")
    } else {
      setSuccess("All other active sessions have been signed out.")
    }
    setIsBusy(false)
  }

  const signOutThisSession = async () => {
    setIsBusy(true)
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" })
    if (signOutError) {
      setError("Unable to sign out this session. Please try again.")
      setIsBusy(false)
      return
    }
    router.replace("/auth/login")
  }

  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Loading session details…</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <MonitorSmartphone className="mt-0.5 h-5 w-5 text-brand-600" />
        <div>
          <p className="text-sm font-medium text-slate-500">Sessions</p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">Manage signed-in devices</h2>
          <p className="mt-2 text-sm text-slate-600">Review the current browser session and end access on other devices.</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-medium">Current browser session</p>
        {email && <p className="mt-1 break-all">{email}</p>}
        {sessionStartedAt && <p className="mt-1 text-xs text-slate-500">Last sign-in: {new Date(sessionStartedAt).toLocaleString()}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled={isBusy} onClick={signOutOtherSessions}>
          <LogOut className="h-4 w-4" />
          {isBusy ? "Working…" : "Sign out other devices"}
        </Button>
        <Button type="button" variant="destructive" disabled={isBusy} onClick={signOutThisSession}>
          <LogOut className="h-4 w-4" />
          Sign out this device
        </Button>
      </div>
    </section>
  )
}
