import { beforeEach, describe, expect, it, vi } from "vitest"
import { getCurrentUser } from "../auth"
import { requireApiRoles } from "./api-guard"

vi.mock("../auth", () => ({
  getCurrentUser: vi.fn(),
}))

const mockGetCurrentUser = vi.mocked(getCurrentUser)

describe("requireApiRoles", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("returns 401 when no authenticated user exists", async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    const result = await requireApiRoles(["admin", "superadmin"])

    expect(result.authorized).toBe(false)
    if (!result.authorized) {
      expect(result.response.status).toBe(401)
      expect(result.response.headers.get("Cache-Control")).toBe("private, no-store")
    }
  })

  it("rejects a non-admin regardless of any client-provided role value", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "reporter-id",
      role: "reporter",
      is_approved: true,
      display_name: "Reporter",
      avatar_url: null,
      created_at: "",
    })

    const result = await requireApiRoles(["admin", "superadmin"])

    expect(result.authorized).toBe(false)
    if (!result.authorized) expect(result.response.status).toBe(403)
  })

  it("authorizes only an authenticated user with an allowed role", async () => {
    const admin = {
      id: "admin-id",
      role: "admin",
      is_approved: true,
      display_name: "Admin",
      avatar_url: null,
      created_at: "",
    } as const
    mockGetCurrentUser.mockResolvedValue(admin)

    const result = await requireApiRoles(["admin", "superadmin"])

    expect(result).toEqual({ authorized: true, user: admin })
  })
})
