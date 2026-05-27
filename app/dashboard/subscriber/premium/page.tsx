import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"
import { getSubscriberMetadata } from "@/lib/billing/guards"
import Link from "next/link"

export default async function SubscriberPremiumPage() {
  const user = await requireRole(["subscriber", "admin", "superadmin"])
  const subscriberMetadata = await getSubscriberMetadata(user.id)

  return (
    <DashboardShell
      title="Premium Access"
      description="Manage your premium subscription and benefits."
      userName={user.display_name || "Subscriber"}
      role={user.role}
    >
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Premium Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>View and manage your subscription, downloads, and premium features.</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={subscriberMetadata?.stripe_subscription_id ? "default" : "secondary"} className="capitalize">
              {subscriberMetadata?.current_tier || "No active subscription"}
            </Badge>
            {subscriberMetadata?.stripe_customer_id ? <Badge variant="outline">Billing customer linked</Badge> : <Badge variant="outline">Billing customer missing</Badge>}
          </div>
          <div className="flex flex-wrap gap-3">
            <form action="/api/stripe/subscription/checkout" method="post">
              <Button type="submit">Upgrade or renew</Button>
            </form>
            {subscriberMetadata?.stripe_customer_id ? (
              <form action="/api/stripe/subscription/portal" method="post">
                <Button type="submit" variant="outline">
                  Open Stripe billing portal
                </Button>
              </form>
            ) : null}
            <Button variant="ghost" asChild>
              <Link href="/dashboard/subscriber">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
