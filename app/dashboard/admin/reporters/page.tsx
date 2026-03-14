import { redirect } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function AdminReportersPage() {
  const user = await getCurrentUser()
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  const { data: reporters } = await supabase
    .from("app_users")
    .select("id, display_name, email, avatar_url, role, created_at")
    .eq("role", "reporter")
    .order("created_at", { ascending: false })
    .limit(100)

  // Articles per reporter (counts)
  const { data: counts } = await supabase
    .from("articles")
    .select("author_id, status", { count: "exact" })
    .order("author_id")

  const byAuthor = new Map<string, { total: number; published: number; pending: number }>()
  for (const a of counts || []) {
    const k = (a as any).author_id as string
    if (!k) continue
    const cur = byAuthor.get(k) || { total: 0, published: 0, pending: 0 }
    cur.total += 1
    if ((a as any).status === "published") cur.published += 1
    if ((a as any).status === "submitted") cur.pending += 1
    byAuthor.set(k, cur)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Reporters</h1>
          <p className="text-slate-600 mt-2">Manage and track reporters activity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Reporters</CardTitle>
          </CardHeader>
          <CardContent>
            {reporters && reporters.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reporters.map((r) => {
                  const stats = byAuthor.get(r.id) || { total: 0, published: 0, pending: 0 }
                  return (
                    <div key={r.id} className="rounded-lg border bg-white p-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={r.avatar_url || "/placeholder.svg"}
                          alt={r.display_name || "Reporter"}
                          width={40}
                          height={40}
                          loading="lazy"
                          unoptimized
                          className="h-10 w-10 rounded-full object-cover bg-slate-200"
                        />
                        <div>
                          <div className="font-medium">{r.display_name || "Unnamed Reporter"}</div>
                          <div className="text-xs text-slate-500">{r.email}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="rounded bg-slate-50 py-2">
                          <div className="text-lg font-semibold">{stats.total}</div>
                          <div className="text-xs text-slate-500">Total</div>
                        </div>
                        <div className="rounded bg-green-50 py-2">
                          <div className="text-lg font-semibold text-green-700">{stats.published}</div>
                          <div className="text-xs text-green-700">Published</div>
                        </div>
                        <div className="rounded bg-orange-50 py-2">
                          <div className="text-lg font-semibold text-orange-700">{stats.pending}</div>
                          <div className="text-xs text-orange-700">Pending</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-slate-600 py-12">No reporters found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
