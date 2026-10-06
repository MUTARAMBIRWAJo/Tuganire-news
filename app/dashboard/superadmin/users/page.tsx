import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/auth/guards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export default async function SuperAdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; approved?: string; page?: string }>
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
  const approvedParam = (sp?.approved || "").trim()
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1)
  const PAGE_SIZE = 12
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Fetch users with auth.users data (email, created_at, etc.)
  // Use RPC or direct query to join auth.users with app_users
  let query = supabase
    .from("app_users")
    .select("id, display_name, role, is_approved, created_at, avatar_url", { count: "exact" })

  if (q) query = query.ilike("display_name", `%${q}%`)
  if (role) query = query.eq("role", role)
  if (approvedParam === "true" || approvedParam === "false")
    query = query.eq("is_approved", approvedParam === "true")

  const { data: users, count } = await query.order("created_at", { ascending: false }).range(from, to)

  // Fetch auth.users data for email addresses (requires service role key)
  let usersWithAuth: Array<{
    id: string
    display_name: string | null
    role: string | null
    is_approved: boolean | null
    created_at: string | null
    avatar_url: string | null
    email: string | null
    last_sign_in_at: string | null
  }> = []

  if (users && users.length > 0 && serviceKey) {
    // Use service role to access auth.users via admin API
    const authMap: Record<string, { email: string | null, last_sign_in_at: string | null }> = {}
    for (const user of users) {
      try {
        const { data: authUser, error } = await supabase.auth.admin.getUserById(user.id)
        if (authUser?.user && !error) {
          authMap[user.id] = {
            email: authUser.user.email || null,
            last_sign_in_at: authUser.user.last_sign_in_at || null,
          }
        }
      } catch (e) {
        // Ignore errors for individual users
        console.warn(`Failed to fetch auth data for user ${user.id}:`, e)
      }
    }
    usersWithAuth = users.map(u => ({
      ...u,
      email: authMap[u.id]?.email || null,
      last_sign_in_at: authMap[u.id]?.last_sign_in_at || null,
    }))
  } else {
    usersWithAuth = users?.map(u => ({
      ...u,
      email: null,
      last_sign_in_at: null,
    })) || []
  }

  async function setApproval(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const approved = String(formData.get("approved")) === "true"
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").update({ is_approved: approved }).eq("id", id)
    revalidatePath("/dashboard/superadmin/users")
  }

  async function setRole(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const newRole = String(formData.get("role"))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").update({ role: newRole }).eq("id", id)
    revalidatePath("/dashboard/superadmin/users")
  }

  async function updateName(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const display_name = String(formData.get("display_name") || "").trim()
    if (!display_name) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").update({ display_name }).eq("id", id)
    revalidatePath("/dashboard/superadmin/users")
  }

  async function createUser(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const display_name = String(formData.get("display_name") || "").trim()
    const role = String(formData.get("role") || "reporter").trim()
    const is_approved = String(formData.get("is_approved") || "false") === "true"
    if (!display_name) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").insert({ display_name, role, is_approved })
    revalidatePath("/dashboard/superadmin/users")
  }

  async function deleteUser(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("app_users").delete().eq("id", id)
    revalidatePath("/dashboard/superadmin/users")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-600 mt-2">View roles and approval status</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Create */}
            <form action={createUser} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input id="display_name" name="display_name" placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" placeholder="reporter | admin | superadmin" defaultValue="reporter" />
              </div>
              <div>
                <Label htmlFor="is_approved">Approved</Label>
                <Input id="is_approved" name="is_approved" placeholder="true | false" defaultValue="false" />
              </div>
              <div className="flex items-end"><Button type="submit">Create</Button></div>
            </form>

            {/* Filters */}
            <form className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3" action="/dashboard/superadmin/users" method="get">
              <div>
                <Label htmlFor="q">Search</Label>
                <Input id="q" name="q" placeholder="Name..." defaultValue={q} />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" placeholder="reporter | admin | superadmin" defaultValue={role} />
              </div>
              <div>
                <Label htmlFor="approved">Approved</Label>
                <Input id="approved" name="approved" placeholder="true | false" defaultValue={approvedParam} />
              </div>
              <div className="flex items-end"><Button type="submit">Filter</Button></div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600 border-b">
                    <th className="py-2 pr-4">Display Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Approved</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithAuth.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <form action={updateName} className="flex gap-2 items-center">
                          <input type="hidden" name="id" value={u.id} />
                          <Input name="display_name" defaultValue={u.display_name || ""} className="h-8 w-56" />
                          <Button size="sm" variant="secondary">Save</Button>
                        </form>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="text-slate-700">{u.email || "N/A"}</span>
                        {u.last_sign_in_at && (
                          <div className="text-xs text-slate-500">
                            Last sign in: {new Date(u.last_sign_in_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <form action={setRole} className="flex gap-2 items-center">
                          <input type="hidden" name="id" value={u.id} />
                          <Input name="role" defaultValue={u.role || ""} className="h-8 w-36" />
                          <Button size="sm" variant="secondary">Save</Button>
                        </form>
                      </td>
                      <td className="py-2 pr-4">
                        <form action={setApproval}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="approved" value={u.is_approved ? "false" : "true"} />
                          <Button variant={u.is_approved ? "outline" : "default"} size="sm">
                            {u.is_approved ? "Approved (Set Pending)" : "Approve"}
                          </Button>
                        </form>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="text-xs text-slate-600">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 flex gap-2">
                        <Link href={`/dashboard/superadmin/users/${u.id}`} className="px-3 py-1 rounded border">Manage</Link>
                        <form action={deleteUser}>
                          <input type="hidden" name="id" value={u.id} />
                          <Button size="sm" variant="outline">Delete</Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {(!usersWithAuth || usersWithAuth.length === 0) && (
                    <tr>
                      <td className="py-3 text-slate-600" colSpan={6}>No users found.</td>
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
                    href={{ pathname: "/dashboard/superadmin/users", query: { q, role, approved: approvedParam, page: String(Math.max(1, page - 1)) } }}
                    className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Prev
                  </Link>
                  <Link
                    href={{ pathname: "/dashboard/superadmin/users", query: { q, role, approved: approvedParam, page: String(page + 1) } }}
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
