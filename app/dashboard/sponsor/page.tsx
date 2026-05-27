import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function SponsorPage() {
  const user = await requireRole(["advertiser", "supporter", "admin", "superadmin"])

  return (
    <DashboardShell
      title="Sponsor"
      description="Sponsorship and partner opportunities."
      userName={user.display_name || "Sponsor"}
      role={user.role}
    >
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Sponsorship</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">Partner and sponsorship information will appear here.</p>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
