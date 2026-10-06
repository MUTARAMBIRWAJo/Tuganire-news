import { describe, expect, it } from "vitest"
import {
  INACTIVITY_TIMEOUT_MS,
  SESSION_WARNING_TIMEOUT_MS,
  canActivityExtendSession,
  formatCountdown,
  getSessionTimeoutState,
  isFreshAuthenticatedSession,
  resolveSessionTimeoutConfig,
  shouldRecordActivity,
} from "./session-timeout"

describe("session inactivity timeout", () => {
  it("keeps active users out of the warning before five minutes", () => {
    const state = getSessionTimeoutState(1_000, 1_000 + INACTIVITY_TIMEOUT_MS - 1)

    expect(state.phase).toBe("active")
  })

  it("starts the warning after five minutes and counts down from its deadline", () => {
    const warningStartedAt = 1_000 + INACTIVITY_TIMEOUT_MS
    const state = getSessionTimeoutState(1_000, warningStartedAt)

    expect(state).toMatchObject({ phase: "warning", remainingSeconds: 300 })
    expect(canActivityExtendSession(1_000, warningStartedAt)).toBe(false)
  })

  it("uses elapsed timestamps rather than timer tick counts after suspension", () => {
    const lastActivityAt = 1_000
    const resumedAt = lastActivityAt + INACTIVITY_TIMEOUT_MS + 45_250

    expect(getSessionTimeoutState(lastActivityAt, resumedAt)).toMatchObject({
      phase: "warning",
      remainingSeconds: 255,
    })
  })

  it("expires after the second five-minute period", () => {
    const deadline = 1_000 + INACTIVITY_TIMEOUT_MS + SESSION_WARNING_TIMEOUT_MS

    expect(getSessionTimeoutState(1_000, deadline)).toMatchObject({
      phase: "expired",
      remainingSeconds: 0,
    })
  })

  it("formats countdown values as MM:SS", () => {
    expect(formatCountdown(300)).toBe("05:00")
    expect(formatCountdown(59)).toBe("00:59")
    expect(formatCountdown(0)).toBe("00:00")
  })

  it("records genuine activity only when the tab is visible and outside the throttle window", () => {
    expect(shouldRecordActivity(1_000, 1_000 + 1_000, true, true)).toBe(true)
    expect(shouldRecordActivity(1_000, 1_000 + 100, true, true)).toBe(false)
    expect(shouldRecordActivity(1_000, 1_000 + 2_000, false, true)).toBe(false)
    expect(shouldRecordActivity(1_000, 1_000 + 2_000, true, false)).toBe(false)
  })

  it("does not let activity dismiss a warning or revive an expired session", () => {
    const warningStartedAt = 1_000 + INACTIVITY_TIMEOUT_MS

    expect(shouldRecordActivity(1_000, warningStartedAt, true, true)).toBe(false)
    expect(shouldRecordActivity(1_000, warningStartedAt + SESSION_WARNING_TIMEOUT_MS, true, true)).toBe(false)
  })

  it("resets to a fresh active period when the user explicitly continues", () => {
    const continuedAt = 1_000 + INACTIVITY_TIMEOUT_MS + 60_000

    expect(getSessionTimeoutState(continuedAt, continuedAt).phase).toBe("active")
  })

  it("resets the logout guard for a new login in the same mounted app", () => {
    expect(isFreshAuthenticatedSession(true, false)).toBe(true)
    expect(isFreshAuthenticatedSession(true, true)).toBe(false)
    expect(isFreshAuthenticatedSession(false, true)).toBe(false)
  })

  it("enables 30-second values only for an explicit development test-mode flag", () => {
    expect(resolveSessionTimeoutConfig({ nodeEnv: "development", testMode: "true" })).toEqual({
      isTestMode: true,
      inactivityTimeoutMs: 30_000,
      warningTimeoutMs: 30_000,
    })
  })

  it.each([
    { nodeEnv: "production", testMode: "true" },
    { nodeEnv: "development", testMode: "false" },
    { nodeEnv: "development", testMode: "" },
    { nodeEnv: "test", testMode: "true" },
  ])("keeps five-minute defaults outside explicit development test mode: %s", (environment) => {
    expect(resolveSessionTimeoutConfig(environment)).toEqual({
      isTestMode: false,
      inactivityTimeoutMs: 300_000,
      warningTimeoutMs: 300_000,
    })
  })
})