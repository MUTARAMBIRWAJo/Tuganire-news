import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/guards"

export default async function AdvertiserDashboardPage() {
  const user = await requireRole(["advertiser", "admin", "superadmin"])

  return (
    <DashboardShell
      title="Advertiser Dashboard"
      description="Create campaigns, upload banners, view analytics, and manage sponsored story requests."
      userName={user.display_name || "Advertiser"}
      role={user.role}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card id="campaigns" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Campaign creation, budget allocation, and approval status will be displayed here.</p>
            </CardContent>
          </Card>

          <Card id="analytics" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Impressions, clicks, CTR, and conversion trends will appear here with chart support.</p>
            </CardContent>
          </Card>

          <Card id="sponsored" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Sponsored Article Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Track moderation and approval status for branded content requests.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="billing" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Invoice history and payment methods will be connected to Stripe.</p>
            </CardContent>
          </Card>

          <Card id="audience" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Audience Targeting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Demographic, geography, and interest-based targeting settings belong here.</p>
            </CardContent>
          </Card>

          <Card id="uploads" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Safe File Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Banner uploads should be validated for type, size, and image dimensions before approval.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
