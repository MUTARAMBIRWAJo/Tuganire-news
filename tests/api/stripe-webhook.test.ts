import { describe, expect, it, vi } from "vitest"

const persistStripePaymentRecordMock = vi.fn()
const persistStripeSubscriptionRecordMock = vi.fn()

vi.mock("@/lib/stripe-server", () => ({
  getStripeWebhookSecret: vi.fn(() => "whsec_test"),
  stripeServer: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
  persistStripePaymentRecord: persistStripePaymentRecordMock,
  persistStripeSubscriptionRecord: persistStripeSubscriptionRecordMock,
}))

describe("stripe webhook route", () => {
  it("persists subscription and payment records for subscription checkout completion", async () => {
    const stripeModule = await import("@/lib/stripe-server")
    ;(stripeModule.stripeServer.webhooks.constructEvent as any).mockReturnValue({
      id: "evt_123",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_123",
          mode: "subscription",
          payment_status: "paid",
          amount_total: 2500,
          currency: "usd",
          customer_details: { email: "reader@example.com", name: "Reader" },
          customer: "cus_123",
          subscription: "sub_123",
          metadata: { payment_kind: "subscription", user_id: "user-1", plan_id: "subscriber-monthly" },
        },
      },
    })
    ;(stripeModule.stripeServer.subscriptions.retrieve as any).mockResolvedValue({
      id: "sub_123",
      status: "active",
      metadata: { user_id: "user-1", plan_id: "subscriber-monthly" },
      start_date: 1710000000,
      canceled_at: null,
    })

    const { POST } = await import("@/app/api/stripe/webhook/route")
    const response = await POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": "sig" }, body: "{}" }))

    expect(response.status).toBe(200)
    expect(persistStripeSubscriptionRecordMock).toHaveBeenCalledTimes(1)
    expect(persistStripePaymentRecordMock).toHaveBeenCalledTimes(1)
  })
})
