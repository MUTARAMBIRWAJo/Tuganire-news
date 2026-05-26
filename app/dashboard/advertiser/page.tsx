import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdvertiserDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const allowed = ["advertiser", "admin", "superadmin"]
  if (!user.role || !allowed.includes(user.role)) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Advertiser Dashboard</h1>
          <p className="text-muted-foreground mt-2">Create campaigns, upload banners and review analytics.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No active campaigns yet.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No billing records.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
