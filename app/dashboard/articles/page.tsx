import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye } from "lucide-react"

export default async function ArticlesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Fetch articles based on user role
  let query = supabase
    .from("articles")
    .select(`
      *,
      author:app_users(full_name:display_name, email),
      category:categories(name)
    `)
    .order("created_at", { ascending: false })

  // Reporters can only see their own articles
  if (user.role === "reporter") {
    query = query.eq("author_id", user.id)
  }

  const { data: articles } = await query

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Articles</h1>
          </div>
          <Button asChild>
            <Link href="/dashboard/articles/new">
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/promote">Boost Article</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 bg-slate-50 p-6">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>All Articles</CardTitle>
            </CardHeader>
            <CardContent>
              {articles && articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{article.title}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              article.status === "Published"
                                ? "bg-green-100 text-green-700"
                                : article.status === "InReview"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : article.status === "Draft"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {article.status}
                          </span>
                          {article.is_featured && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {article.excerpt || "No excerpt available"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{article.author?.full_name || article.author?.email}</span>
                          <span>•</span>
                          <span>{article.category?.name || "Uncategorized"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views_count} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/articles/${article.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No articles found. Create your first article to get started!
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/articles/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Article
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
