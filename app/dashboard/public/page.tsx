import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PublicDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  // Only allow public, subscriber, advertiser, supporter, admin, superadmin to view
  const allowed = ["public", "subscriber", "advertiser", "supporter", "admin", "superadmin"]
  if (!user.role || !allowed.includes(user.role)) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Public Dashboard</h1>
          <p className="text-muted-foreground mt-2">A personal newsroom for public users — saved stories, reading history, and settings.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Saved Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">You haven't saved any articles yet.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reading History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recently viewed stories.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
