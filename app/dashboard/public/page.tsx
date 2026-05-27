import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"

export default async function PublicDashboardPage() {
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])

  return (
    <DashboardShell
      title="Public Dashboard"
      description="A personal newsroom for saved stories, bookmarks, likes, reading history, and account settings."
      userName={user.display_name || "User"}
      role={user.role}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card id="saved" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Saved Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">You have not saved any articles yet. Tap the bookmark icon on any story to add it here.</p>
            </CardContent>
          </Card>

          <Card id="history" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Reading History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">No recently viewed stories yet.</p>
            </CardContent>
          </Card>

          <Card id="bookmarks" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Liked Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Your liked stories will appear here for quick access.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="settings" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Manage display name, email visibility, and notification preferences.</p>
            </CardContent>
          </Card>

          <Card id="newsletter" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Newsletter Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Track your newsletter subscriptions and topic preferences here.</p>
            </CardContent>
          </Card>

          <Card id="security" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Change your password, review active sessions, and secure your account.</p>
            </CardContent>
          </Card>

          <Card id="notifications" className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">Choose which breaking news and newsletter alerts you want to receive.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
