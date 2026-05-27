import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function PublicNotificationsPage() {
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])

  return (
    <DashboardShell
      title="Notification Preferences"
      description="Choose which alerts you want to receive."
      userName={user.display_name || "User"}
      role={user.role}
    >
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">Manage push and email breaking news alerts.</p>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
