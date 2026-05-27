import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function PublicNotificationsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const supabase = await createClient()
  const [{ data: prefs }, { data: notifications }, { data: activity }] = await Promise.all([
    supabase.from("user_security").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("security_notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("login_activity").select("*").eq("user_id", user.id).order("login_at", { ascending: false }).limit(5),
  ])

  return (
    <DashboardShell
      title="Notification Preferences"
      description="Choose which account, breaking-news, and security alerts you want to receive."
      userName={user.display_name || "User"}
      role={user.role}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 xl:col-span-2">
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Email alerts: {prefs?.email_alerts === false ? "Off" : "On"}</p>
            <p>Password change alerts: {prefs?.password_change_alerts === false ? "Off" : "On"}</p>
            <p>2FA alerts: {prefs?.two_factor_alerts === false ? "Off" : "On"}</p>
            <p>Suspicious login alerts: {prefs?.suspicious_login_alerts === false ? "Off" : "On"}</p>
            <p>Newsletter alerts: {prefs?.newsletter_alerts === false ? "Off" : "On"}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader>
            <CardTitle>Recent login activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {(activity || []).length === 0 ? (
              <p>No recent logins yet.</p>
            ) : (
              (activity || []).map((item: any) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-white">{item.browser || "Browser"}</div>
                  <div className="text-xs text-slate-500">{item.country || "unknown"} · {item.ip_address || "-"}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 xl:col-span-3">
          <CardHeader>
            <CardTitle>Notification log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {(notifications || []).length === 0 ? (
              <p>No security notifications yet.</p>
            ) : (
              (notifications || []).map((item: any) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-white">{item.title}</div>
                  <div>{item.message}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
