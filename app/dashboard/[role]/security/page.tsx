import { redirect, notFound } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { SecurityCenter } from "@/components/security-center"
import { getCurrentUser } from "@/lib/auth"
import { getSecurityOverview, ensureTwoFactorSetup, hashCode } from "@/lib/security"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/auth/roles"

const OWN_ROLE_MAP: Record<string, UserRole> = {
  subscriber: "subscriber",
  advertiser: "advertiser",
  supporter: "supporter",
  sponsor: "supporter",
  reporter: "reporter",
  admin: "admin",
  superadmin: "superadmin",
}

export default async function RoleSecurityPage({ params, searchParams }: { params: { role: string }; searchParams?: { security?: string } }) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const roleKey = params.role.toLowerCase()
  if (!(roleKey in OWN_ROLE_MAP)) notFound()

  const allowedRole = OWN_ROLE_MAP[roleKey]
  const actualRole = String(user.role || "public").toLowerCase() as UserRole
  const canAccess = actualRole === allowedRole || actualRole === "admin" || actualRole === "superadmin"
  if (!canAccess) {
    const target = actualRole === "public" ? "/dashboard/public/security" : `/dashboard/${actualRole}/security`
    redirect(target)
  }

  const supabase = await createClient()
  const { data: session } = await supabase.auth.getSession()
  const overview = await getSecurityOverview(user.id)
  const setup = overview.twoFactor?.enabled ? null : await ensureTwoFactorSetup(user.id, user.email || null)
  const currentSessionToken = hashCode(session.session?.access_token || "")

  return (
    <DashboardShell
      title="Account Security"
      description="Manage passwords, 2FA, sessions, login history, and notification preferences."
      userName={user.display_name || "User"}
      role={user.role}
    >
      <SecurityCenter
        userName={user.display_name || "User"}
        role={user.role}
        securityPath={`/dashboard/${actualRole}/security`}
        overview={overview}
        twoFactorSetup={setup ? { qrCodeDataUrl: setup.qrCodeDataUrl, backupCodes: setup.isFreshSetup ? setup.backupCodes : [], enabled: setup.enabled } : null}
        flash={searchParams?.security || null}
        currentSessionToken={currentSessionToken}
      />
    </DashboardShell>
  )
}
