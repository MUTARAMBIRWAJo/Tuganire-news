import { beforeEach, describe, expect, it, vi } from "vitest"
import { supabase } from "@/lib/supabaseClient"
import { signOutCurrentSession } from "./browser-session"

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

const mockSignOut = vi.mocked(supabase.auth.signOut)

describe("signOutCurrentSession", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("uses local scope so other devices remain signed in", async () => {
    mockSignOut.mockResolvedValue({ error: null })

    await signOutCurrentSession()

    expect(mockSignOut).toHaveBeenCalledWith({ scope: "local" })
  })
})