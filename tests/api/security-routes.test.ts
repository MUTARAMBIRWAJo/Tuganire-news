import { describe, expect, it, vi } from "vitest"

const createClientMock = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}))

describe("security api routes", () => {
  it("updates notification preferences and redirects back", async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: vi.fn(() => ({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      })),
    })

    const { POST } = await import("@/app/api/security/notifications/route")
    const formData = new FormData()
    formData.set("email_alerts", "on")
    formData.set("password_change_alerts", "on")
    formData.set("two_factor_alerts", "on")
    formData.set("suspicious_login_alerts", "on")
    formData.set("newsletter_alerts", "on")
    const response = await POST(new Request("http://localhost/dashboard/public/security", { method: "POST", body: formData }))

    expect(response.status).toBe(303)
    expect(response.headers.get("location")).toContain("security=prefs-updated")
  })

  it("logs out other sessions through the sessions route", async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: "token-123" } } }),
      },
      from: vi.fn(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })

    const { POST } = await import("@/app/api/security/sessions/route")
    const formData = new FormData()
    formData.set("session_token", "others")
    const response = await POST(new Request("http://localhost/dashboard/public/security", { method: "POST", body: formData }))

    expect(response.status).toBe(303)
    expect(response.headers.get("location")).toContain("security=sessions-others-logged-out")
  })
})
