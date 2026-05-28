import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])

  return (
    <DashboardShell title="Saved items" description="Your saved articles and content" userName={user.display_name || "User"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">You have no saved items yet — they'll appear here.</p>
      </div>
    </DashboardShell>
  )
}

