import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function SubscriberPremiumPage() {
  const user = await requireRole(["subscriber", "admin", "superadmin"])

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
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">View and manage your subscription, downloads, and premium features.</p>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
