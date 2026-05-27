import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function AdvertiserCampaignsPage() {
  const user = await requireRole(["advertiser", "admin", "superadmin"])

  return (
    <DashboardShell
      title="Campaigns"
      description="Create, edit, and monitor advertising campaigns."
      userName={user.display_name || "Advertiser"}
      role={user.role}
    >
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">No campaigns yet — create your first campaign to start reaching readers.</p>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
