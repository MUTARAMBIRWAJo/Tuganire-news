import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SuperAdminRolesPage() {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Roles & Permissions</h1>
          <p className="text-slate-600 mt-2">Manage system roles and access policies</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Role Management Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">This module is prepared for role and permission management with server actions and policy controls.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
