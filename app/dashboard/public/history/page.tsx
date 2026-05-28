import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])

  return (
    <DashboardShell title="History" description="Your reading history" userName={user.display_name || "User"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">No history yet.</p>
      </div>
    </DashboardShell>
  )
}

