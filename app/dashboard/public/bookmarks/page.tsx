import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])

  return (
    <DashboardShell title="Bookmarks" description="Your bookmarked articles" userName={user.display_name || "User"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">No bookmarks yet.</p>
      </div>
    </DashboardShell>
  )
}

