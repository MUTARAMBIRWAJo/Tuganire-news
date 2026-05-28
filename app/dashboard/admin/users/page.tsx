import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["admin", "superadmin"]) 

  return (
    <DashboardShell title="Users" description="Manage users and roles" userName={user.display_name || "Admin"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">User management UI scaffold.</p>
      </div>
    </DashboardShell>
  )
}
