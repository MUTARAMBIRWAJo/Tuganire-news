import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["admin", "superadmin"]) 

  return (
    <DashboardShell title="Audit Logs" description="System audit logs" userName={user.display_name || "Admin"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">Audit logs will appear here.</p>
      </div>
    </DashboardShell>
  )
}
