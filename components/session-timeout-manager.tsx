"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AlertCircle, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { signOutCurrentSession } from "@/lib/auth/browser-session"
import {
  SESSION_ACTIVITY_STORAGE_KEY,
  INACTIVITY_TIMEOUT_MS,
  SESSION_TIMEOUT_TEST_MODE,
  SESSION_WARNING_TIMEOUT_MS,
  formatCountdown,
  getSessionTimeoutState,
  isFreshAuthenticatedSession,
  shouldRecordActivity,
} from "@/lib/session-timeout"
import { supabase } from "@/lib/supabaseClient"

function readActivityTimestamp(): number | null {
  try {
    const value = Number(window.localStorage.getItem(SESSION_ACTIVITY_STORAGE_KEY))
    if (!Number.isFinite(value) || value <= 0) return null
    return Math.min(value, Date.now())
  } catch {
    return null
  }
}

function writeActivityTimestamp(timestamp: number) {
  try {
    window.localStorage.setItem(SESSION_ACTIVITY_STORAGE_KEY, String(timestamp))
  } catch {
    // In-memory timeout tracking remains active when browser storage is unavailable.
  }
}

function clearActivityTimestamp() {
  try {
    window.localStorage.removeItem(SESSION_ACTIVITY_STORAGE_KEY)
  } catch {
    // Supabase sign-out remains authoritative when browser storage is unavailable.
  }
}

export function SessionTimeoutManager() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [lastActivityAt, setLastActivityAt] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const authenticatedRef = useRef(false)
  const lastActivityAtRef = useRef<number | null>(null)
  const logoutStartedRef = useRef(false)
  const previousPathnameRef = useRef(pathname)

  const applyActivityTimestamp = useCallback((timestamp: number) => {
    lastActivityAtRef.current = timestamp
    setLastActivityAt(timestamp)
    setNow(Date.now())
  }, [])

  const markActivity = useCallback((event?: Event) => {
    if (!authenticatedRef.current) return

    const currentTime = Date.now()
    const lastActivity = lastActivityAtRef.current
    if (!shouldRecordActivity(
      lastActivity,
      currentTime,
      event?.isTrusted ?? true,
      document.visibilityState === "visible",
    )) return

    applyActivityTimestamp(currentTime)
    writeActivityTimestamp(currentTime)
    setLogoutError(null)
  }, [applyActivityTimestamp])

  const logout = useCallback(async () => {
    if (logoutStartedRef.current) return

    logoutStartedRef.current = true
    setIsLoggingOut(true)
    setLogoutError(null)

    try {
      await signOutCurrentSession()
      clearActivityTimestamp()
      router.replace("/auth/login?reason=inactive")
    } catch {
      logoutStartedRef.current = false
      setLogoutError("We could not end your session. Select Logout to try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }, [applyActivityTimestamp, router])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const wasAuthenticated = authenticatedRef.current
      const isNowAuthenticated = Boolean(session)
      const isFreshSession = isFreshAuthenticatedSession(isNowAuthenticated, wasAuthenticated)
      authenticatedRef.current = isNowAuthenticated
      setIsAuthenticated(isNowAuthenticated)

      if (isNowAuthenticated) {
        const currentTime = Date.now()
        const storedActivity = lastActivityAtRef.current ?? readActivityTimestamp()
        if (isFreshSession) logoutStartedRef.current = false
        const isFreshSignIn = event === "SIGNED_IN" && isFreshSession
        const activityTimestamp = isFreshSignIn || storedActivity === null ? currentTime : storedActivity

        applyActivityTimestamp(activityTimestamp)
        writeActivityTimestamp(activityTimestamp)
        return
      }

      lastActivityAtRef.current = null
      setLastActivityAt(null)
      clearActivityTimestamp()

      if (wasAuthenticated) {
        router.replace("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) return

    const updateClock = () => setNow(Date.now())
    const handleVisibilityChange = () => updateClock()

    updateClock()
    const intervalId = window.setInterval(updateClock, 1000)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [applyActivityTimestamp, isAuthenticated, markActivity])

  useEffect(() => {
    if (!isAuthenticated) return

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "scroll",
      "touchstart",
    ]
    activityEvents.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }))

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_ACTIVITY_STORAGE_KEY || !event.newValue) return
      const timestamp = Number(event.newValue)
      const currentActivity = lastActivityAtRef.current
      if (!Number.isFinite(timestamp) || timestamp <= 0 || timestamp > Date.now() || timestamp <= (currentActivity ?? 0)) return
      applyActivityTimestamp(timestamp)
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, markActivity))
      window.removeEventListener("storage", handleStorage)
    }
  }, [applyActivityTimestamp, isAuthenticated, markActivity])

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return
    previousPathnameRef.current = pathname
    markActivity()
  }, [markActivity, pathname])

  const timeoutState = isAuthenticated && lastActivityAt !== null
    ? getSessionTimeoutState(lastActivityAt, now || Date.now())
    : null
  const isWarningOpen = timeoutState?.phase === "warning" || timeoutState?.phase === "expired"
  const testModeIndicator = SESSION_TIMEOUT_TEST_MODE && isAuthenticated ? (
    <div className="fixed bottom-3 left-3 z-[90] rounded-md border border-amber-500 bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-950 shadow" aria-label="Session timeout test mode">
      Session timeout test mode · Idle: {INACTIVITY_TIMEOUT_MS / 1000}s · Warning: {SESSION_WARNING_TIMEOUT_MS / 1000}s
    </div>
  ) : null

  useEffect(() => {
    if (timeoutState?.phase === "expired") void logout()
  }, [timeoutState?.phase, logout])

  const keepSession = () => {
    const currentTime = Date.now()
    const activityTimestamp = lastActivityAtRef.current
    if (activityTimestamp === null) return

    const currentState = getSessionTimeoutState(activityTimestamp, currentTime)
    if (currentState.phase === "expired") {
      void logout()
      return
    }

    applyActivityTimestamp(currentTime)
    writeActivityTimestamp(currentTime)
    setLogoutError(null)
  }

  if (!isWarningOpen || !timeoutState) return testModeIndicator

  const countdown = formatCountdown(timeoutState.phase === "warning" ? timeoutState.remainingSeconds : 0)
  const isExpired = timeoutState.phase === "expired"

  return (
    <>
      {testModeIndicator}
    <AlertDialog open onOpenChange={() => {}}>
      <AlertDialogContent
        className="z-[100] max-w-md border-slate-200 bg-white p-6 text-slate-950 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <AlertDialogHeader className="text-left">
          <div className="mb-1 grid size-11 place-items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-xl">Are you still there?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
            You have been inactive for 5 minutes. For your security, you will be logged out unless you continue your session.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Automatic logout in</p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums" role="timer" aria-label={`${countdown} until automatic logout`}>
            {countdown}
          </p>
        </div>

        {logoutError && (
          <p role="alert" className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {logoutError}
          </p>
        )}

        <AlertDialogFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="outline" onClick={() => void logout()} disabled={isLoggingOut}>
            {isExpired && isLoggingOut ? "Logging out…" : logoutError ? "Retry Logout" : "Logout"}
          </Button>
          <Button type="button" onClick={keepSession} disabled={isLoggingOut || isExpired} autoFocus>
            Keep Me Logged In
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
      </>
  )
}