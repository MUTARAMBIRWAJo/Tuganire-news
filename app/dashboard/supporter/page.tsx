import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/guards"

export default async function SupporterDashboardPage() {
  const user = await requireRole(["supporter", "admin", "superadmin"])

  return (
    <DashboardShell
      title="Supporter Dashboard"
      description="Track your donations, recurring sponsorships, supporter tiers, and newsroom impact."
      userName={user.display_name || "Supporter"}
      role={user.role}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card id="contributions" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Your one-time and recurring contributions will appear here with Stripe donation management.</p>
            </CardContent>
          </Card>

          <Card id="impact" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Impact Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">See how your support contributes to sponsored journalism and newsroom growth.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="tiers" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Supporter Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Choose a tier to unlock supporter badges, recognition, and perks.</p>
            </CardContent>
          </Card>

          <Card id="recognition" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Public Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Control whether your support is shown publicly on the site.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
