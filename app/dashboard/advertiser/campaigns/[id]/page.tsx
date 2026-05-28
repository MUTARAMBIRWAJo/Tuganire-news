import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

interface Props { params: { id: string } }

export default async function Page({ params }: Props) {
  const user = await requireRole(["advertiser"]) 

  return (
    <DashboardShell title={`Campaign ${params.id}`} description={`Details for campaign ${params.id}`} userName={user.display_name || "Advertiser"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">Campaign details not available in this scaffold.</p>
      </div>
    </DashboardShell>
  )
}
