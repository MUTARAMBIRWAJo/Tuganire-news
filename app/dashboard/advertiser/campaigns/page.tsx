import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function Page() {
  const user = await requireRole(["advertiser"]) 

  return (
    <DashboardShell title="Advertising Campaigns" description="Your active campaigns" userName={user.display_name || "Advertiser"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">No campaigns yet. Create your first campaign.</p>
        <div>
          <Link href={`/dashboard/advertiser/campaigns/new`} className="text-blue-600">Create campaign</Link>
        </div>
      </div>
    </DashboardShell>
  )
}

