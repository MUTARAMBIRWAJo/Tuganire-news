import { beforeEach, describe, expect, it, vi } from "vitest"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "./auth"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

const mockCreateClient = vi.mocked(createClient)

function createMockClient({
  user = { id: "user-1" },
  assurance = { currentLevel: "aal1", nextLevel: "aal1" },
  assuranceError = null,
  profile = { id: "user-1", role: "public", is_approved: true },
}: {
  user?: { id: string } | null
  assurance?: { currentLevel: string; nextLevel: string }
  assuranceError?: Error | null
  profile?: { id: string; role: string; is_approved: boolean } | null
} = {}) {
  const single = vi.fn().mockResolvedValue({ data: profile, error: null })
  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
          data: assurance,
          error: assuranceError,
        }),
      },
    },
    rpc: vi.fn(() => ({ single })),
  }

  return { client, single }
}

describe("getCurrentUser MFA assurance", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("does not fetch a profile for an AAL1 session that requires AAL2", async () => {
    const { client, single } = createMockClient({
      assurance: { currentLevel: "aal1", nextLevel: "aal2" },
    })
    mockCreateClient.mockResolvedValue(client as unknown as Awaited<ReturnType<typeof createClient>>)

    await expect(getCurrentUser()).resolves.toBeNull()
    expect(client.rpc).not.toHaveBeenCalled()
    expect(single).not.toHaveBeenCalled()
  })

  it("fails closed when the assurance level cannot be determined", async () => {
    const { client, single } = createMockClient({
      assuranceError: new Error("assurance lookup failed"),
    })
    mockCreateClient.mockResolvedValue(client as unknown as Awaited<ReturnType<typeof createClient>>)

    await expect(getCurrentUser()).resolves.toBeNull()
    expect(client.rpc).not.toHaveBeenCalled()
    expect(single).not.toHaveBeenCalled()
  })

  it("continues to profile authorization after AAL2 verification", async () => {
    const { client } = createMockClient({
      assurance: { currentLevel: "aal2", nextLevel: "aal2" },
    })
    mockCreateClient.mockResolvedValue(client as unknown as Awaited<ReturnType<typeof createClient>>)

    await expect(getCurrentUser()).resolves.toMatchObject({ role: "public", is_approved: true })
    expect(client.rpc).toHaveBeenCalledWith("get_my_app_user")
  })
})