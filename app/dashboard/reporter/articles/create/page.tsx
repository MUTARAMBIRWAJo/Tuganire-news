import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["reporter"]) 

  return (
    <DashboardShell title="New Article" description="Create a new article" userName={user.display_name || "Reporter"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">Article composer is not yet implemented in this scaffold.</p>
      </div>
    </DashboardShell>
  )
}
