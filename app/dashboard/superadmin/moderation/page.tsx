import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { revalidatePath } from "next/cache"

export default async function SuperAdminModerationPage({
  searchParams,
}: { searchParams: { q?: string; category?: string; reporter?: string; page?: string } }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()
  const q = (searchParams?.q || "").trim()
  const category = (searchParams?.category || "").trim()
  const reporter = (searchParams?.reporter || "").trim()
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1)
  const PAGE_SIZE = 10
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("articles")
    .select(
      `id, title, created_at, status, language, author:app_users(id, display_name), category:categories(id, name)`,
      { count: "exact" }
    )
    .eq("status", "submitted")

  if (q) query = query.ilike("title", `%${q}%`)
  if (category) query = query.eq("category_id", Number(category)).not("category_id", "is", null)
  if (reporter) query = query.eq("author_id", reporter)

  const { data: queue, count } = await query.order("created_at", { ascending: false }).range(from, to)

  async function approveArticle(formData: FormData) {
    "use server"
    const id = String(formData.get("id"))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("articles").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id)
    revalidatePath("/dashboard/superadmin/moderation")
  }

  async function rejectArticle(formData: FormData) {
    "use server"
    const id = String(formData.get("id"))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("articles").update({ status: "draft" }).eq("id", id)
    revalidatePath("/dashboard/superadmin/moderation")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Moderation Queue</h1>
          <p className="text-slate-600 mt-2">Review submitted articles and moderate content</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Submitted Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <form className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3" action="/dashboard/superadmin/moderation" method="get">
              <div>
                <Label htmlFor="q">Search</Label>
                <Input id="q" name="q" placeholder="Title contains..." defaultValue={q} />
              </div>
              <div>
                <Label htmlFor="category">Category ID</Label>
                <Input id="category" name="category" placeholder="numeric id" defaultValue={category} />
              </div>
              <div>
                <Label htmlFor="reporter">Reporter ID</Label>
                <Input id="reporter" name="reporter" placeholder="uuid" defaultValue={reporter} />
              </div>
              <div className="flex items-end"><Button type="submit">Filter</Button></div>
            </form>

            <div className="space-y-3">
              {(queue || []).map((a) => {
                const author = Array.isArray(a.author) ? (a.author as any[])[0] : (a.author as any)
                const category = Array.isArray(a.category) ? (a.category as any[])[0] : (a.category as any)
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-4 bg-white">
                    <div>
                      <div className="font-semibold text-slate-800">{a.title}</div>
                      <div className="text-sm text-slate-600 flex gap-2">
                        <span>{author?.display_name || "Unknown"}</span>
                        <span>•</span>
                        <span>{category?.name || "Uncategorized"}</span>
                        <span>•</span>
                        <span>{new Date(a.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={approveArticle}>
                        <input type="hidden" name="id" value={a.id} />
                        <Button size="sm" variant="default">Approve</Button>
                      </form>
                      <form action={rejectArticle}>
                        <input type="hidden" name="id" value={a.id} />
                        <Button size="sm" variant="outline">Reject</Button>
                      </form>
                    </div>
                  </div>
                )
              })}
              {(!queue || queue.length === 0) && <p className="text-slate-600">No submitted articles.</p>}
            </div>

            {/* Pagination */}
            {count && count > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">Showing {from + 1}-{Math.min(to + 1, count)} of {count}</div>
                <div className="flex gap-2">
                  <Link href={{ pathname: "/dashboard/superadmin/moderation", query: { q, category, reporter, page: String(Math.max(1, page - 1)) } }} className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}>Prev</Link>
                  <Link href={{ pathname: "/dashboard/superadmin/moderation", query: { q, category, reporter, page: String(page + 1) } }} className={`px-3 py-1 rounded border ${to + 1 >= (count || 0) ? "pointer-events-none opacity-50" : ""}`}>Next</Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
