import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SubscriberDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const allowed = ["subscriber", "public", "admin", "superadmin"]
  if (!user.role || !allowed.includes(user.role)) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Subscriber Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your subscription, invoices, and premium access.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">You have no active subscription.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No invoices available.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
