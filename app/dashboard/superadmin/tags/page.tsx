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

export default async function SuperAdminTagsPage({
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

  let list = supabase.from("tags").select("id, name", { count: "exact" })
  if (q) list = list.ilike("name", `%${q}%`)
  const { data: tags, count } = await list.order("name").range(from, to)

  async function createTag(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const name = String(formData.get("name") || "").trim()
    if (!name) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("tags").insert({ name })
    revalidatePath("/dashboard/superadmin/tags")
  }

  async function renameTag(formData: FormData) {
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
    await supa.from("tags").update({ name }).eq("id", id)
    revalidatePath("/dashboard/superadmin/tags")
  }

  async function deleteTag(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = Number(formData.get("id"))
    if (!id) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("tags").delete().eq("id", id)
    revalidatePath("/dashboard/superadmin/tags")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Tags</h1>
          <p className="text-slate-600 mt-2">Manage tags for content discoverability</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Manage Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Create */}
            <form action={createTag} className="flex gap-2 mb-4">
              <div className="flex-1">
                <Label htmlFor="name">New Tag</Label>
                <Input id="name" name="name" placeholder="Tag name" />
              </div>
              <div className="flex items-end"><Button type="submit">Add</Button></div>
            </form>

            {/* Filters */}
            <form className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3" action="/dashboard/superadmin/tags" method="get">
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
              {(tags || []).map((t) => (
                <div key={t.id} className="rounded-lg border p-4 bg-white">
                  <div className="font-semibold text-slate-800">{t.name}</div>
                  <div className="flex gap-2 mt-3">
                    <form action={renameTag} className="flex gap-2">
                      <input type="hidden" name="id" value={t.id} />
                      <Input name="name" defaultValue={t.name} className="h-8" />
                      <Button size="sm" variant="secondary">Rename</Button>
                    </form>
                    <form action={deleteTag}>
                      <input type="hidden" name="id" value={t.id} />
                      <Button size="sm" variant="outline">Delete</Button>
                    </form>
                  </div>
                </div>
              ))}
              {(!tags || tags.length === 0) && <p className="text-slate-600">No tags.</p>}
            </div>

            {/* Pagination */}
            {count && count > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">Showing {from + 1}-{Math.min(to + 1, count)} of {count}</div>
                <div className="flex gap-2">
                  <Link href={{ pathname: "/dashboard/superadmin/tags", query: { q, page: String(Math.max(1, page - 1)) } }} className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}>Prev</Link>
                  <Link href={{ pathname: "/dashboard/superadmin/tags", query: { q, page: String(page + 1) } }} className={`px-3 py-1 rounded border ${to + 1 >= (count || 0) ? "pointer-events-none opacity-50" : ""}`}>Next</Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
