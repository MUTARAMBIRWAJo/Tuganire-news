import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/guards"
import { getPaymentHistory } from "@/lib/payment-history"
import { getSubscriberMetadata } from "@/lib/billing/guards"
import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable"
import Link from "next/link"

export default async function SubscriberDashboardPage() {
  const user = await requireRole(["subscriber", "admin", "superadmin"])
  const [subscriberMetadata, paymentHistory] = await Promise.all([getSubscriberMetadata(user.id), getPaymentHistory(10)])
  const hasSubscription = Boolean(subscriberMetadata?.stripe_subscription_id)

  return (
    <DashboardShell
      title="Subscriber Dashboard"
      description="Manage your subscription, invoices, premium articles, and newsletter preferences."
      userName={user.display_name || "Subscriber"}
      role={user.role}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card id="premium" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Premium Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>Your premium stories, deep-dive investigations, and subscriber-only content will appear here.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={hasSubscription ? "default" : "secondary"} className="capitalize">
                    {hasSubscription ? subscriberMetadata?.current_tier || "Active subscription" : "No active subscription"}
                  </Badge>
                  {subscriberMetadata?.stripe_customer_id ? <Badge variant="outline">Customer linked</Badge> : <Badge variant="outline">Customer not linked</Badge>}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <form action="/api/stripe/subscription/checkout" method="post">
                    <Button type="submit">Start or renew subscription</Button>
                  </form>
                  {subscriberMetadata?.stripe_customer_id ? (
                    <form action="/api/stripe/subscription/portal" method="post">
                      <Button type="submit" variant="outline">
                        Manage billing in Stripe
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="billing" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Stripe billing status, renewal reminders, and plan upgrades/cancellations are managed here.</p>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer ID</dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">{subscriberMetadata?.stripe_customer_id || "Not linked yet"}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Subscription ID</dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">{subscriberMetadata?.stripe_subscription_id || "No subscription"}</dd>
                </div>
              </dl>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Webhook-backed records update automatically after Stripe checkout or subscription changes.
              </p>
            </CardContent>
          </Card>

          <Card id="history" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Reading Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">See what you read most, how often you return, and which topics you follow.</p>
              <Button asChild variant="ghost" className="mt-3 px-0 text-brand-600 hover:text-brand-700">
                <Link href="/dashboard/public/history">Open reading history</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="invoices" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentHistoryTable rows={paymentHistory.rows} enabled={paymentHistory.enabled} />
            </CardContent>
          </Card>

          <Card id="newsletter" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Newsletter Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Control topic subscriptions and premium email alerts.</p>
            </CardContent>
          </Card>

          <Card id="upgrade" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Plan Upgrades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Upgrade or cancel your subscription safely through Stripe.</p>
              <div className="flex flex-wrap gap-3">
                <form action="/api/stripe/subscription/checkout" method="post">
                  <Button type="submit">Checkout</Button>
                </form>
                {subscriberMetadata?.stripe_customer_id ? (
                  <form action="/api/stripe/subscription/portal" method="post">
                    <Button type="submit" variant="outline">
                      Open billing portal
                    </Button>
                  </form>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
