import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ReporterArticlesList } from "@/components/reporter-articles-list"

export default async function ReporterArticlesPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  const sp = await searchParams
  const q = (sp?.q || "").trim()
  const status = (sp?.status || "").trim()
  const category = (sp as any)?.category ? String((sp as any).category).trim() : ""
  const fromDate = (sp as any)?.from ? String((sp as any).from).trim() : ""
  const toDate = (sp as any)?.to ? String((sp as any).to).trim() : ""
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1)
  const PAGE_SIZE = 10
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Count-only query for pagination
  let countQuery = supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id)

  if (q) countQuery = countQuery.ilike("title", `%${q}%`)
  if (status) countQuery = countQuery.eq("status", status)
  if (category) countQuery = countQuery.eq("category_id", Number(category))
  if (fromDate) countQuery = countQuery.gte("created_at", new Date(fromDate).toISOString())
  if (toDate) countQuery = countQuery.lte("created_at", new Date(new Date(toDate).setHours(23,59,59,999)).toISOString())

  const { count } = await countQuery

  const { data: categories } = await supabase.from("categories").select("id, name").order("name")

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">My Articles</h1>
          <Button asChild>
            <Link href="/dashboard/reporter/articles/new">
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Link>
          </Button>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>All My Articles</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <form className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3" action="/dashboard/reporter/articles" method="get">
                <div>
                  <label htmlFor="q" className="text-sm text-slate-700">Search</label>
                  <input id="q" name="q" className="mt-1 w-full border rounded px-3 py-2" placeholder="Title..." defaultValue={q} />
                </div>
                <div>
                  <label htmlFor="status" className="text-sm text-slate-700">Status</label>
                  <input id="status" name="status" className="mt-1 w-full border rounded px-3 py-2" placeholder="draft | submitted | published" defaultValue={status} />
                </div>
                <div>
                  <label htmlFor="category" className="text-sm text-slate-700">Category</label>
                  <select id="category" name="category" className="mt-1 w-full border rounded px-3 py-2" defaultValue={category}>
                    <option value="">All</option>
                    {(categories || []).map((c:any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="from" className="text-sm text-slate-700">From</label>
                  <input id="from" name="from" type="date" className="mt-1 w-full border rounded px-3 py-2" defaultValue={fromDate} />
                </div>
                <div>
                  <label htmlFor="to" className="text-sm text-slate-700">To</label>
                  <input id="to" name="to" type="date" className="mt-1 w-full border rounded px-3 py-2" defaultValue={toDate} />
                </div>
                <div className="flex items-end">
                  <Button type="submit">Filter</Button>
                </div>
              </form>
              <ReporterArticlesList q={q} status={status} category={category} from={fromDate} to={toDate} page={page} pageSize={PAGE_SIZE} />

              {/* Pagination */}
              {count && count > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-600">Showing {from + 1}-{Math.min(to + 1, count)} of {count}</div>
                  <div className="flex gap-2">
                    <Link
                      href={{ pathname: "/dashboard/reporter/articles", query: { q, status, page: String(Math.max(1, page - 1)) } }}
                      className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                    >
                      Prev
                    </Link>
                    <Link
                      href={{ pathname: "/dashboard/reporter/articles", query: { q, status, page: String(page + 1) } }}
                      className={`px-3 py-1 rounded border ${to + 1 >= (count || 0) ? "pointer-events-none opacity-50" : ""}`}
                    >
                      Next
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

