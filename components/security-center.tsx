import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type SecurityOverview = {
  userSecurity: any | null
  twoFactor: any | null
  sessions: any[]
  activity: any[]
  notifications: any[]
}

interface SecurityCenterProps {
  userName: string
  role: string
  securityPath: string
  overview: SecurityOverview
  twoFactorSetup?: {
    qrCodeDataUrl?: string
    backupCodes?: string[]
    enabled?: boolean
  } | null
  flash?: string | null
  currentSessionToken?: string | null
}

function flashMessage(value?: string | null) {
  if (!value) return null
  const tone = value.includes("failed") || value.includes("invalid") || value.includes("error") ? "destructive" : "default"
  const messageMap: Record<string, string> = {
    "password-updated": "Password updated successfully.",
    "password-change-error": "Password update failed.",
    "password-too-weak": "Password must be at least 12 characters.",
    "password-mismatch": "New password confirmation does not match.",
    "current-password-invalid": "Current password is incorrect.",
    "2fa-enabled": "Two-factor authentication is enabled.",
    "2fa-disabled": "Two-factor authentication is disabled.",
    "2fa-invalid": "The verification code or recovery code is invalid.",
    "prefs-updated": "Notification preferences updated.",
    "sessions-others-logged-out": "Other sessions were logged out.",
    "session-logged-out": "Session revoked.",
  }

  return { tone, message: messageMap[value] || value }
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString()
}

export function SecurityCenter({ userName, role, securityPath, overview, twoFactorSetup, flash, currentSessionToken }: SecurityCenterProps) {
  const flashEntry = flashMessage(flash)
  const preferences = overview.userSecurity || {}
  const twoFactorEnabled = Boolean(overview.twoFactor?.enabled)
  const backupCodes = Array.isArray(twoFactorSetup?.backupCodes) ? twoFactorSetup.backupCodes : []

  return (
    <div className="space-y-6">
      {flashEntry ? (
        <Card className={flashEntry.tone === "destructive" ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30" : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"}>
          <CardContent className="py-4 text-sm font-medium text-slate-900 dark:text-white">{flashEntry.message}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardDescription>Security role</CardDescription>
            <CardTitle className="text-2xl capitalize">{role}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardDescription>2FA status</CardDescription>
            <CardTitle className="text-2xl">{twoFactorEnabled ? "Enabled" : "Disabled"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardDescription>Active sessions</CardDescription>
            <CardTitle className="text-2xl">{overview.sessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardDescription>Recent logins</CardDescription>
            <CardTitle className="text-2xl">{overview.activity.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Password Management</CardTitle>
              <CardDescription>Change your password with current-password verification and audit logging.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/api/security/password/change" method="post" className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 md:col-span-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Current password</span>
                  <input name="current_password" type="password" autoComplete="current-password" required className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none ring-0 transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" />
                </label>
                <label className="grid gap-2 md:col-span-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">New password</span>
                  <input name="new_password" type="password" autoComplete="new-password" minLength={12} required className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none ring-0 transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" />
                </label>
                <label className="grid gap-2 md:col-span-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirm new password</span>
                  <input name="confirm_password" type="password" autoComplete="new-password" minLength={12} required className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none ring-0 transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" />
                </label>
                <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Password must be at least 12 characters and is verified against your current session.</p>
                  <Button type="submit">Update password</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Google Authenticator 2FA</CardTitle>
              <CardDescription>Scan the QR code with Google Authenticator, then verify the TOTP code to enable 2FA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={twoFactorEnabled ? "default" : "secondary"}>{twoFactorEnabled ? "Protected" : "Not enabled"}</Badge>
                {overview.twoFactor?.created_at ? <Badge variant="outline">Setup created {formatDate(overview.twoFactor.created_at)}</Badge> : null}
              </div>

              {twoFactorSetup?.qrCodeDataUrl && !twoFactorEnabled ? (
                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <img src={twoFactorSetup.qrCodeDataUrl} alt="2FA setup QR code" className="h-auto w-full rounded-xl bg-white p-2" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Open Google Authenticator and scan this QR code. Then enter a one-time code to enable the account.</p>
                    <form action="/api/security/2fa/verify" method="post" className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Authenticator code</span>
                          <input name="otp" inputMode="numeric" placeholder="123456" className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Recovery code</span>
                          <input name="recovery_code" placeholder="Optional recovery code" className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950" />
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button type="submit">Verify and enable 2FA</Button>
                      </div>
                    </form>
                    {twoFactorEnabled ? (
                      <form action="/api/security/2fa/disable" method="post" className="pt-2">
                        <Button type="submit" variant="outline">Disable 2FA</Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {backupCodes.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
                  <p className="font-medium">Recovery codes. Save these now. They are only shown once.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {backupCodes.map((code) => (
                      <code key={code} className="rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white">{code}</code>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Review active devices and revoke sessions that you do not recognize.</CardDescription>
            </CardHeader>
            <CardContent>
              {overview.sessions.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">No active sessions are recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  <form action="/api/security/sessions" method="post" className="flex justify-end">
                    <input type="hidden" name="session_token" value="others" />
                    <Button type="submit" variant="outline">Log out other devices</Button>
                  </form>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Last active</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900 dark:text-white">{session.device || "Unknown device"}</span>
                              {currentSessionToken && session.session_token === currentSessionToken ? <Badge variant="secondary" className="mt-1 w-fit">Current session</Badge> : null}
                            </div>
                          </TableCell>
                          <TableCell>{String(session.ip_address || "-")}</TableCell>
                          <TableCell>{formatDate(session.last_active_at)}</TableCell>
                          <TableCell className="text-right">
                            <form action="/api/security/sessions" method="post">
                              <input type="hidden" name="session_token" value={session.session_token} />
                              <Button type="submit" variant="ghost" size="sm">Revoke</Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Security Notifications</CardTitle>
              <CardDescription>Email and account alert preferences for password and 2FA events.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/api/security/notifications" method="post" className="space-y-4">
                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <span className="text-sm">Email alerts</span>
                  <input name="email_alerts" type="checkbox" defaultChecked={preferences.email_alerts ?? true} />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <span className="text-sm">Password change alerts</span>
                  <input name="password_change_alerts" type="checkbox" defaultChecked={preferences.password_change_alerts ?? true} />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <span className="text-sm">2FA alerts</span>
                  <input name="two_factor_alerts" type="checkbox" defaultChecked={preferences.two_factor_alerts ?? true} />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <span className="text-sm">Suspicious login alerts</span>
                  <input name="suspicious_login_alerts" type="checkbox" defaultChecked={preferences.suspicious_login_alerts ?? true} />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <span className="text-sm">Newsletter alerts</span>
                  <input name="newsletter_alerts" type="checkbox" defaultChecked={preferences.newsletter_alerts ?? true} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Theme</span>
                    <select name="theme_preference" defaultValue={preferences.theme_preference || "system"} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Language</span>
                    <select name="language_preference" defaultValue={preferences.language_preference || "en"} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="rw">Kinyarwanda</option>
                    </select>
                  </label>
                </div>
                <Button type="submit" className="w-full">Save preferences</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Recent Login Activity</CardTitle>
              <CardDescription>Browser, device, and country fingerprints are recorded when sessions are created.</CardDescription>
            </CardHeader>
            <CardContent>
              {overview.activity.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">No login activity recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {overview.activity.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900 dark:text-white">{item.browser || "Unknown browser"}</p>
                        <span className="text-xs text-slate-500">{formatDate(item.login_at)}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.device || "Unknown device"} · {String(item.ip_address || "-")} · {String(item.country || "unknown")}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Recent password and 2FA changes are surfaced here.</CardDescription>
            </CardHeader>
            <CardContent>
              {overview.notifications.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">No security notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {overview.notifications.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                        <span className="text-xs text-slate-500">{formatDate(item.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={securityPath}>Open my security dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/auth/login">Return to login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />
      <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as {userName}. Security events are stored server-side with role and ownership checks.</p>
    </div>
  )
}
