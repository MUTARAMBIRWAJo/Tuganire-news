"use client"

import { FormEvent, useState } from "react"
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"

export function SecurityPasswordPanel() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.")
      return
    }

    if (currentPassword === newPassword) {
      setError("Your new password must be different from your current password.")
      return
    }

    setIsBusy(true)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    } as Parameters<typeof supabase.auth.updateUser>[0])

    if (updateError) {
      setError(updateError.message || "Unable to change your password. Please try again.")
      setIsBusy(false)
      return
    }

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSuccess("Your password was changed successfully.")
    setIsBusy(false)
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <KeyRound className="mt-0.5 h-5 w-5 text-brand-600" />
        <div>
          <p className="text-sm font-medium text-slate-500">Password</p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">Change your password</h2>
          <p className="mt-2 text-sm text-slate-600">Confirm your current password before setting a new one.</p>
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

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="current-password" className="text-sm font-medium text-slate-700">Current password</label>
          <Input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium text-slate-700">New password</label>
          <Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">Confirm new password</label>
          <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        </div>
        <Button type="submit" disabled={isBusy}>{isBusy ? "Updating…" : "Update password"}</Button>
      </form>
    </section>
  )
}
