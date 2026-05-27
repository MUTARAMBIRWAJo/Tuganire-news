import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function PublicNewsletterPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const supabase = await createClient()
  const [{ data: preferences }, { data: subscriptions }] = await Promise.all([
    supabase.from("user_security").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("email", user.email || "").order("created_at", { ascending: false }).limit(10),
  ])

  return (
    <DashboardShell
      title="Newsletter Subscriptions"
      description="Manage the newsletters you're subscribed to and the alert frequency for your newsroom account."
      userName={user.display_name || "User"}
      role={user.role}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 xl:col-span-2">
          <CardHeader>
            <CardTitle>Newsletter preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Newsletter alerts: {preferences?.newsletter_alerts === false ? "Off" : "On"}</p>
            <p>Email language: {preferences?.language_preference || "en"}</p>
            <p>Theme preference: {preferences?.theme_preference || "system"}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {(subscriptions || []).length === 0 ? (
              <p>You are not subscribed to any newsletters yet.</p>
            ) : (
              (subscriptions || []).map((item: any) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-white">{item.email}</div>
                  <div className="text-xs text-slate-500">Confirmed: {item.confirmed ? "Yes" : "No"}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
