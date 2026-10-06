export const revalidate = 60;

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/auth/guards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export default async function SuperAdminApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>
}) {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()
  const sp = await searchParams
  const q = (sp?.q || "").trim()
  const role = (sp?.role || "").trim()
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1)
  const PAGE_SIZE = 10
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("app_users")
    .select("id, display_name, role, is_approved", { count: "exact" })
    .eq("is_approved", false)

  if (q) query = query.ilike("display_name", `%${q}%`)
  if (role) query = query.eq("role", role)

  const { data: pendingUsers, count } = await query.order("role").range(from, to)

  async function approveUser(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").update({ is_approved: true }).eq("id", id)
    revalidatePath("/dashboard/superadmin/approvals")
  }
  async function rejectUser(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").update({ is_approved: false }).eq("id", id)
    revalidatePath("/dashboard/superadmin/approvals")
  }

  async function setRole(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const role = String(formData.get("role") || "").trim()
    if (!role) return
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").update({ role }).eq("id", id)
    revalidatePath("/dashboard/superadmin/approvals")
  }

  async function updateName(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const display_name = String(formData.get("display_name") || "").trim()
    if (!display_name) return
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").update({ display_name }).eq("id", id)
    revalidatePath("/dashboard/superadmin/approvals")
  }

  async function deleteUser(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").delete().eq("id", id)
    revalidatePath("/dashboard/superadmin/approvals")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Pending Approvals</h1>
          <p className="text-slate-600 mt-2">Approve or reject new accounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <form className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3" action="/dashboard/superadmin/approvals" method="get">
              <div>
                <Label htmlFor="q">Search</Label>
                <Input id="q" name="q" placeholder="Name..." defaultValue={q} />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" placeholder="reporter | admin | superadmin" defaultValue={role} />
              </div>
              <div className="flex items-end">
                <Button type="submit">Filter</Button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600 border-b">
                    <th className="py-2 pr-4">Display Name</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(pendingUsers || []).map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <form action={updateName} className="flex gap-2 items-center">
                          <input type="hidden" name="id" value={u.id} />
                          <Input name="display_name" defaultValue={u.display_name || ""} className="h-8 w-56" />
                          <Button size="sm" variant="secondary">Save</Button>
                        </form>
                      </td>
                      <td className="py-2 pr-4">
                        <form action={setRole} className="flex gap-2 items-center">
                          <input type="hidden" name="id" value={u.id} />
                          <Input name="role" defaultValue={u.role} className="h-8 w-36" />
                          <Button size="sm" variant="secondary">Save</Button>
                        </form>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <form action={approveUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <Button size="sm">Approve</Button>
                          </form>
                          <form action={rejectUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <Button size="sm" variant="outline">Reject</Button>
                          </form>
                          <form action={deleteUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <Button size="sm" variant="outline">Delete</Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!pendingUsers || pendingUsers.length === 0) && (
                    <tr>
                      <td className="py-3 text-slate-600" colSpan={4}>No pending approvals found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {count && count > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">Showing {from + 1}-{Math.min(to + 1, count)} of {count}</div>
                <div className="flex gap-2">
                  <Link
                    href={{ pathname: "/dashboard/superadmin/approvals", query: { q, role, page: String(Math.max(1, page - 1)) } }}
                    className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Previous
                  </Link>
                  <Link
                    href={{ pathname: "/dashboard/superadmin/approvals", query: { q, role, page: String(page + 1) } }}
                    className={`px-3 py-1 rounded border ${to + 1 >= (count || 0) ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Next
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
