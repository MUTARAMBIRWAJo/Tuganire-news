import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard-shell"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function PublicSettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const supabase = await createClient()
  const { data: preferences } = await supabase.from("user_security").select("*").eq("user_id", user.id).maybeSingle()
  const { data: recentNotifications } = await supabase.from("security_notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3)

  return (
    <DashboardShell
      title="Profile Settings"
      description="Manage your profile, privacy, language, theme, and account preferences."
      userName={user.display_name || "User"}
      role={user.role}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 xl:col-span-2">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>Update your display name, email preferences, and account visibility.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Display name</div>
                <div className="mt-1 font-medium text-slate-900 dark:text-white">{user.display_name || "Not set"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Language</div>
                <div className="mt-1 font-medium text-slate-900 dark:text-white">{preferences?.language_preference || "en"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Theme</div>
                <div className="mt-1 font-medium text-slate-900 dark:text-white">{preferences?.theme_preference || "system"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Newsletter alerts</div>
                <div className="mt-1 font-medium text-slate-900 dark:text-white">{preferences?.newsletter_alerts === false ? "Off" : "On"}</div>
              </div>
            </div>
            <Button asChild>
              <Link href={`/dashboard/${user.role}/security`}>Open security center</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader>
            <CardTitle>Recent security events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {(recentNotifications || []).length === 0 ? (
              <p>No recent security events yet.</p>
            ) : (
              (recentNotifications || []).map((item: any) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-white">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.message}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
