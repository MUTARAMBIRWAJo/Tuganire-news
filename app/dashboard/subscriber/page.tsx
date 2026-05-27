import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/guards"

export default async function SubscriberDashboardPage() {
  const user = await requireRole(["subscriber", "admin", "superadmin"])

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
              <p className="text-sm text-slate-600 dark:text-slate-300">Your premium stories, deep-dive investigations, and subscriber-only content will appear here.</p>
            </CardContent>
          </Card>

          <Card id="billing" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Stripe billing status, renewal reminders, and plan upgrades/cancellations will be managed here.</p>
            </CardContent>
          </Card>

          <Card id="history" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Reading Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">See what you read most, how often you return, and which topics you follow.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="invoices" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">No invoices available yet.</p>
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
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Upgrade or cancel your subscription safely through Stripe.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
