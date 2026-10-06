const DEFAULT_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_SESSION_WARNING_TIMEOUT_MS = 5 * 60 * 1000
const DEVELOPMENT_TEST_TIMEOUT_MS = 30 * 1000

export function resolveSessionTimeoutConfig(environment: {
  nodeEnv?: string
  testMode?: string
}) {
  const testModeEnabled = environment.nodeEnv === "development" && environment.testMode === "true"

  return {
    isTestMode: testModeEnabled,
    inactivityTimeoutMs: testModeEnabled ? DEVELOPMENT_TEST_TIMEOUT_MS : DEFAULT_INACTIVITY_TIMEOUT_MS,
    warningTimeoutMs: testModeEnabled ? DEVELOPMENT_TEST_TIMEOUT_MS : DEFAULT_SESSION_WARNING_TIMEOUT_MS,
  }
}

const sessionTimeoutConfig = resolveSessionTimeoutConfig({
  nodeEnv: process.env.NODE_ENV,
  testMode: process.env.NEXT_PUBLIC_SESSION_TIMEOUT_TEST_MODE,
})

export const SESSION_TIMEOUT_TEST_MODE = sessionTimeoutConfig.isTestMode
export const INACTIVITY_TIMEOUT_MS = sessionTimeoutConfig.inactivityTimeoutMs
export const SESSION_WARNING_TIMEOUT_MS = sessionTimeoutConfig.warningTimeoutMs
export const SESSION_ACTIVITY_STORAGE_KEY = "tuganire-session-timeout:last-activity"
export const SESSION_ACTIVITY_THROTTLE_MS = 1000

export type SessionTimeoutState =
  | { phase: "active"; warningEndsAt: number }
  | { phase: "warning"; warningEndsAt: number; remainingSeconds: number }
  | { phase: "expired"; warningEndsAt: number; remainingSeconds: 0 }

export function getSessionTimeoutState(lastActivityAt: number, now: number): SessionTimeoutState {
  const warningStartsAt = lastActivityAt + INACTIVITY_TIMEOUT_MS
  const warningEndsAt = warningStartsAt + SESSION_WARNING_TIMEOUT_MS

  if (now < warningStartsAt) {
    return { phase: "active", warningEndsAt }
  }

  const remainingMs = warningEndsAt - now
  if (remainingMs <= 0) {
    return { phase: "expired", warningEndsAt, remainingSeconds: 0 }
  }

  return {
    phase: "warning",
    warningEndsAt,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  }
}

export function canActivityExtendSession(lastActivityAt: number, now: number): boolean {
  return getSessionTimeoutState(lastActivityAt, now).phase === "active"
}

export function shouldRecordActivity(
  lastActivityAt: number | null,
  now: number,
  isTrusted: boolean,
  isVisible: boolean,
): boolean {
  if (!isTrusted || !isVisible) return false
  if (lastActivityAt === null) return true
  if (!canActivityExtendSession(lastActivityAt, now)) return false
  return now - lastActivityAt >= SESSION_ACTIVITY_THROTTLE_MS
}

export function isFreshAuthenticatedSession(isNowAuthenticated: boolean, wasAuthenticated: boolean): boolean {
  return isNowAuthenticated && !wasAuthenticated
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}