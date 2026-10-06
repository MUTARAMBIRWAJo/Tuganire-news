import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/auth/guards"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SuperAdminCategoriesPage({
  searchParams,
}: { searchParams: { q?: string; page?: string } }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()
  const q = (searchParams?.q || "").trim()
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1)
  const PAGE_SIZE = 12
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let list = supabase.from("categories").select("id, name, slug", { count: "exact" })
  if (q) list = list.ilike("name", `%${q}%`)
  const { data: categories, count } = await list.order("name").range(from, to)

  async function createCategory(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const name = String(formData.get("name") || "").trim()
    if (!name) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    await supa.from("categories").insert({ name, slug })
    revalidatePath("/dashboard/superadmin/categories")
  }

  async function renameCategory(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = Number(formData.get("id"))
    const name = String(formData.get("name") || "").trim()
    if (!id || !name) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    await supa.from("categories").update({ name, slug }).eq("id", id)
    revalidatePath("/dashboard/superadmin/categories")
  }

  async function deleteCategory(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = Number(formData.get("id"))
    if (!id) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("categories").delete().eq("id", id)
    revalidatePath("/dashboard/superadmin/categories")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Categories</h1>
          <p className="text-slate-600 mt-2">Define and organize content categories</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Create */}
            <form action={createCategory} className="flex gap-2 mb-4">
              <div className="flex-1">
                <Label htmlFor="name">New Category</Label>
                <Input id="name" name="name" placeholder="Category name" />
              </div>
              <div className="flex items-end"><Button type="submit">Add</Button></div>
            </form>

            {/* Filters */}
            <form className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3" action="/dashboard/superadmin/categories" method="get">
              <div>
                <Label htmlFor="q">Search</Label>
                <Input id="q" name="q" placeholder="Name..." defaultValue={q} />
              </div>
              <div className="flex items-end">
                <Button type="submit">Filter</Button>
              </div>
            </form>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(categories || []).map((c) => (
                <div key={c.id} className="rounded-lg border p-4 bg-white">
                  <div className="font-semibold text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-500">/{c.slug}</div>
                  <div className="flex gap-2 mt-3">
                    <form action={renameCategory} className="flex gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <Input name="name" defaultValue={c.name} className="h-8" />
                      <Button size="sm" variant="secondary">Rename</Button>
                    </form>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button size="sm" variant="outline">Delete</Button>
                    </form>
                  </div>
                </div>
              ))}
              {(!categories || categories.length === 0) && <p className="text-slate-600">No categories.</p>}
            </div>

            {/* Pagination */}
            {count && count > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">Showing {from + 1}-{Math.min(to + 1, count)} of {count}</div>
                <div className="flex gap-2">
                  <Link href={{ pathname: "/dashboard/superadmin/categories", query: { q, page: String(Math.max(1, page - 1)) } }} className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}>Prev</Link>
                  <Link href={{ pathname: "/dashboard/superadmin/categories", query: { q, page: String(page + 1) } }} className={`px-3 py-1 rounded border ${to + 1 >= (count || 0) ? "pointer-events-none opacity-50" : ""}`}>Next</Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
