import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function SupporterImpactPage() {
  const user = await requireRole(["supporter", "admin", "superadmin"])

  return (
    <DashboardShell
      title="Impact"
      description="See the impact of your support on journalism projects."
      userName={user.display_name || "Supporter"}
      role={user.role}
    >
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">Impact metrics will appear here as you contribute.</p>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
