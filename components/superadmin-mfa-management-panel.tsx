"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ManagedUser {
  id: string
  displayName: string | null
  email: string | undefined
  role: string | null
  isApproved: boolean | null
  mfaRequired: boolean
  verifiedFactorCount: number
  pendingFactorCount: number
}

export function SuperadminMfaManagementPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    const response = await fetch("/api/admin/security/mfa", { cache: "no-store" })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.error || "Unable to load account MFA status.")
      setIsLoading(false)
      return
    }
    setUsers(payload.users ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const updateMfaRequirement = async (user: ManagedUser) => {
    const action = user.mfaRequired ? "disable" : "require"
    const actionLabel = user.mfaRequired ? "disable MFA" : "require MFA setup"
    if (!window.confirm(`Are you sure you want to ${actionLabel} for ${user.email || user.displayName || "this user"}?`)) return

    setBusyUserId(user.id)
    setError(null)
    setSuccess(null)
    const response = await fetch("/api/admin/security/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId: user.id }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.error || "Unable to update MFA settings.")
      setBusyUserId(null)
      return
    }

    setSuccess(user.mfaRequired ? "MFA was disabled for the selected account." : "MFA setup is now required for the selected account.")
    setBusyUserId(null)
    await loadUsers()
  }

  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Loading user MFA controls…</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm md:col-span-2">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-700">Superadmin controls</p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">Manage MFA requirements for other accounts</h2>
          <p className="mt-2 text-sm text-slate-600">Requiring MFA sends the user to their own 2FA Setup page to scan and verify a QR code. Their secret is never exposed to administrators.</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">MFA status</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium text-slate-900">{user.displayName || "Unnamed account"}</p>
                  <p className="break-all text-xs text-slate-500">{user.email || "No email"}</p>
                </td>
                <td className="px-3 py-3 capitalize text-slate-600">{user.role || "public"}</td>
                <td className="px-3 py-3 text-slate-600">
                  {user.verifiedFactorCount > 0 ? "Enabled" : user.mfaRequired ? "Setup required" : "Not enabled"}
                  {user.pendingFactorCount > 0 && <span className="ml-2 text-xs text-amber-700">Pending setup</span>}
                </td>
                <td className="px-3 py-3 text-right">
                  <Button type="button" size="sm" variant={user.mfaRequired ? "outline" : "secondary"} disabled={busyUserId === user.id} onClick={() => updateMfaRequirement(user)}>
                    {busyUserId === user.id ? "Updating…" : user.mfaRequired ? "Disable MFA" : "Require MFA setup"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
