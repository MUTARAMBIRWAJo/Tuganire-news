import { describe, expect, it, vi } from "vitest"

const createClientMock = vi.fn()
const getSubscriberMetadataMock = vi.fn()
const createSubscriptionCheckoutSessionMock = vi.fn()
const getSubscriptionPriceIdMock = vi.fn()
const createBillingPortalSessionMock = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}))

vi.mock("@/lib/billing/guards", () => ({
  getSubscriberMetadata: getSubscriberMetadataMock,
}))

vi.mock("@/lib/stripe-server", () => ({
  createSubscriptionCheckoutSession: createSubscriptionCheckoutSessionMock,
  getSubscriptionPriceId: getSubscriptionPriceIdMock,
  createBillingPortalSession: createBillingPortalSessionMock,
}))

describe("subscription stripe routes", () => {
  it("redirects checkout requests to Stripe checkout", async () => {
    getSubscriptionPriceIdMock.mockReturnValue("price_123")
    getSubscriberMetadataMock.mockResolvedValue({ stripe_customer_id: "cus_123" })
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "reader@example.com" } } }),
      },
      rpc: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { display_name: "Reader" } }) }),
    })
    createSubscriptionCheckoutSessionMock.mockResolvedValue({ url: "https://checkout.stripe.test/session_123" })

    const { POST } = await import("@/app/api/stripe/subscription/checkout/route")
    const response = await POST(new Request("http://localhost/api/stripe/subscription/checkout", { method: "POST" }))

    expect(response.status).toBe(303)
    expect(response.headers.get("location")).toBe("https://checkout.stripe.test/session_123")
    expect(createSubscriptionCheckoutSessionMock).toHaveBeenCalledTimes(1)
  })

  it("redirects billing portal requests when a customer exists", async () => {
    getSubscriberMetadataMock.mockResolvedValue({ stripe_customer_id: "cus_123" })
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      rpc: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { display_name: "Reader" } }) }),
    })
    createBillingPortalSessionMock.mockResolvedValue({ url: "https://billing.stripe.test/portal_123" })

    const { POST } = await import("@/app/api/stripe/subscription/portal/route")
    const response = await POST()

    expect(response.status).toBe(303)
    expect(response.headers.get("location")).toBe("https://billing.stripe.test/portal_123")
    expect(createBillingPortalSessionMock).toHaveBeenCalledWith("cus_123", "/dashboard/subscriber")
  })
})
