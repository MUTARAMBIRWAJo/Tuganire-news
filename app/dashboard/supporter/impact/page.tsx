import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["supporter"]) 

  return (
    <DashboardShell title="Impact" description="How your support helps" userName={user.display_name || "Supporter"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">Impact metrics will appear here.</p>
      </div>
    </DashboardShell>
  )
}

