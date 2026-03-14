import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { FileText, Eye, Edit, Trash2, Search } from "lucide-react"
import { ArticleStatusSelect } from "@/components/article-status-select"

export default async function SuperAdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>
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
  const status = (sp?.status || "").trim()
  const category = (sp?.category || "").trim()
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1)
  const PAGE_SIZE = 20
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Build query with joins
  let query = supabase
    .from("articles")
    .select(
      `id, slug, title, excerpt, status, article_type, featured_image, views_count, is_featured, created_at, updated_at, published_at,
      author:app_users(id, display_name, avatar_url),
      category:categories(id, name, slug)`,
      { count: "exact" }
    )

  if (q) query = query.ilike("title", `%${q}%`)
  if (status) query = query.eq("status", status)
  if (category) query = query.eq("category_id", Number(category)).not("category_id", "is", null)

  const { data: articles, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")
    .limit(100)

  async function deleteArticle(formData: FormData) {
    "use server"
    const id = String(formData.get("id"))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    await supa.from("articles").delete().eq("id", id)
    revalidatePath("/dashboard/superadmin/articles")
  }

  async function updateStatus(formData: FormData) {
    "use server"
    const id = String(formData.get("id"))
    const newStatus = String(formData.get("status"))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    
    // Get current article to check published_at
    const { data: currentArticle } = await supa
      .from("articles")
      .select("published_at")
      .eq("id", id)
      .single()
    
    const updateData: { status: string; published_at?: string | null } = { status: newStatus }
    
    if (newStatus === "published") {
      // Set published_at if not already set
      if (!currentArticle?.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    } else if (newStatus === "draft" || newStatus === "submitted") {
      // Clear published_at for non-published statuses
      updateData.published_at = null
    }
    
    const { error } = await supa.from("articles").update(updateData).eq("id", id)
    
    if (error) {
      console.error("Failed to update article status:", error)
      throw new Error(error.message || "Failed to update article status")
    }
    
    revalidatePath("/dashboard/superadmin/articles")
  }

  async function publishArticle(formData: FormData) {
    "use server"
    const id = String(formData.get("id"))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()
    
    const { error } = await supa
      .from("articles")
      .update({ 
        status: "published", 
        published_at: new Date().toISOString() 
      })
      .eq("id", id)
    
    if (error) {
      console.error("Failed to publish article:", error)
      throw new Error(error.message || "Failed to publish article")
    }
    
    revalidatePath("/dashboard/superadmin/articles")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Manage Articles</h1>
          <p className="text-slate-600 mt-2">View and manage all articles in the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <form className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3" action="/dashboard/superadmin/articles" method="get">
              <div>
                <Label htmlFor="q">Search</Label>
                <Input id="q" name="q" placeholder="Title..." defaultValue={q} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Input id="status" name="status" placeholder="draft | published | submitted" defaultValue={status} />
              </div>
              <div>
                <Label htmlFor="category">Category ID</Label>
                <Input id="category" name="category" placeholder="Category ID..." defaultValue={category} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </form>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                Error loading articles: {error.message}
              </div>
            )}

            <div className="space-y-4">
              {(articles || []).map((article) => {
                // Handle relation types - Supabase can return arrays or objects
                const author = Array.isArray(article.author) ? article.author[0] : article.author
                const category = Array.isArray(article.category) ? article.category[0] : article.category
                const authorName = (author as any)?.display_name || "Unknown"
                const categoryName = (category as any)?.name || "Uncategorized"
                const articleType = String((article as any).article_type || "text").toLowerCase() === "video" ? "video" : "text"
                
                return (
                <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">{article.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            articleType === "video"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {articleType === "video" ? "Video" : "Text"}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          article.status === "published" ? "bg-green-100 text-green-700" :
                          article.status === "submitted" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {article.status}
                        </span>
                        {article.is_featured && (
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      {article.excerpt && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{article.excerpt}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Author: {authorName}</span>
                        {category && <span>Category: {categoryName}</span>}
                        <span>Views: {article.views_count || 0}</span>
                        <span>Created: {new Date(article.created_at).toLocaleDateString()}</span>
                        {article.published_at && (
                          <span>Published: {new Date(article.published_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <ArticleStatusSelect
                        articleId={article.id}
                        currentStatus={article.status}
                        updateStatus={updateStatus}
                      />
                      
                      {article.status !== "published" && (
                        <form action={publishArticle}>
                          <input type="hidden" name="id" value={article.id} />
                          <Button size="sm" variant="default" type="submit" className="bg-green-600 hover:bg-green-700">
                            Publish
                          </Button>
                        </form>
                      )}
                      
                      <Link href={`/articles/${article.slug}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Link href={`/dashboard/articles/${article.id}/edit`}>
                        <Button size="sm" variant="outline" title="Edit Article">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <form action={deleteArticle}>
                        <input type="hidden" name="id" value={article.id} />
                        <Button size="sm" variant="destructive" type="submit">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
                )
              })}
              
              {(!articles || articles.length === 0) && (
                <div className="text-center py-8 text-slate-600">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                  <p>No articles found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {count && count > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">
                  Showing {from + 1}-{Math.min(to + 1, count)} of {count}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={{
                      pathname: "/dashboard/superadmin/articles",
                      query: { q, status, category, page: String(Math.max(1, page - 1)) },
                    }}
                    className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Prev
                  </Link>
                  <Link
                    href={{
                      pathname: "/dashboard/superadmin/articles",
                      query: { q, status, category, page: String(page + 1) },
                    }}
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

