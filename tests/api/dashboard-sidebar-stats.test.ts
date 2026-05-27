import { describe, expect, it, vi } from "vitest"

const createClientMock = vi.fn()
const createSupabaseClientMock = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}))

vi.mock("@supabase/supabase-js", () => ({
  createClient: createSupabaseClientMock,
}))

function makeQueryBuilder(count: number) {
  const builder: any = {
    select() {
      return builder
    },
    eq() {
      return builder
    },
    in() {
      return builder
    },
    then(resolve: (value: { count: number; error: null }) => void) {
      resolve({ count, error: null })
    },
  }

  return builder
}

describe("sidebar stats route", () => {
  it("returns role-specific counts for an admin user", async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      rpc: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { role: "admin" } }) }),
      from: vi.fn((table: string) => {
        if (table === "app_users") return makeQueryBuilder(3)
        if (table === "articles") return makeQueryBuilder(7)
        if (table === "advertiser_campaigns") return makeQueryBuilder(2)
        if (table === "payment_transactions") return makeQueryBuilder(5)
        return makeQueryBuilder(0)
      }),
    })

    const { GET } = await import("@/app/api/dashboard/sidebar-stats/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ pendingApprovals: 3, pendingTasks: 7, activeCampaigns: 2, openPayments: 5 })
  })
})
