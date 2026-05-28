import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

interface Props {
  params: { role: string }
}

export default async function RoleSecurityPage({ params }: Props) {
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])

  return (
    <DashboardShell title="Account Security" description="Manage passwords, sessions, and two-factor authentication." userName={user.display_name || "User"} role={user.role}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">Security settings for <strong>{params.role}</strong> accounts. This is a generic fallback — create a role-specific security page at <code>app/dashboard/{`[role]`}/security/page.tsx</code> to customize.</p>
      </div>
    </DashboardShell>
  )
}
