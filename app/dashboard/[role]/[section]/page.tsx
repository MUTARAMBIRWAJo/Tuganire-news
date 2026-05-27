import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

interface Props {
  params: { role: string; section: string }
}

export default async function DynamicDashboardSection({ params }: Props) {
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])

  const title = `${params.role} — ${params.section}`

  return (
    <DashboardShell title={title} description={`Section ${params.section} for ${params.role}`} userName={user.display_name || "User"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">This is a generic handler for dynamic dashboard sections. If you expect a dedicated page, create <code>app/dashboard/{`[role]`}/{`[section]`}/page.tsx</code>.</p>
      </div>
    </DashboardShell>
  )
}
