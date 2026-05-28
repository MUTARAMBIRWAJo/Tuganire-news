import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["subscriber"]) 

  return (
    <DashboardShell title="Billing" description="Subscription and billing details" userName={user.display_name || "Subscriber"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">No billing history available.</p>
      </div>
    </DashboardShell>
  )
}
