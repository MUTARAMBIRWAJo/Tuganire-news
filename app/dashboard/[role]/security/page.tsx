import { DashboardShell } from "@/components/dashboard-shell"
import { SecurityMfaPanel } from "@/components/security-mfa-panel"
import { SecurityPasswordPanel } from "@/components/security-password-panel"
import { SecuritySessionPanel } from "@/components/security-session-panel"
import { SuperadminMfaManagementPanel } from "@/components/superadmin-mfa-management-panel"
import { requireRole } from "@/lib/auth/guards"

interface Props {
  params: Promise<{ role: string }>
}

export default async function RoleSecurityPage({ params }: Props) {
  const { role } = await params
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])

  return (
    <DashboardShell title="Account Security" description="Manage passwords, sessions, and two-factor authentication." userName={user.display_name || "User"} role={user.role}>
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Security overview</h2>
          <p className="mt-2 text-sm text-slate-600">
            Security settings for <strong>{role}</strong> accounts are enforced server-side. The browser UI is not trusted for authorization.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SecurityPasswordPanel />
          <SecurityMfaPanel />
          <SecuritySessionPanel />

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Service protection</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Server-side authorization required</p>
            <p className="mt-2 text-sm text-slate-600">Role and ownership checks must be enforced in the server/client boundary and by Supabase RLS, never only in the UI.</p>
          </div>
        </div>
        {user.role === "superadmin" && <SuperadminMfaManagementPanel />}
      </div>
    </DashboardShell>
  )
}
