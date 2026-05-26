import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Eye } from "lucide-react"
import Image from "next/image"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const currentUser = user!

  const role = user.role?.toLowerCase()

  if (role === "superadmin") {
    redirect("/dashboard/superadmin")
  } else if (role === "admin") {
    redirect("/dashboard/admin")
  } else if (role === "reporter") {
    redirect("/dashboard/reporter")
  }

  // Additional role mappings
  else if (role === "subscriber") {
    redirect("/dashboard/subscriber")
  } else if (role === "advertiser") {
    redirect("/dashboard/advertiser")
  } else if (role === "supporter") {
    redirect("/dashboard/supporter")
  }

  // Default fallback for regular/public users
  redirect("/dashboard/public")

  const supabase = await createClient()

  // Fetch dashboard statistics
  const [articlesCount, usersCount, totalViews] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("app_users").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("views_count"),
  ])

  const stats = {
    articles: articlesCount.count || 0,
    users: usersCount.count || 0,
    views: totalViews.data?.reduce((sum, article) => sum + article.views_count, 0) || 0,
  }

  // Fetch recent articles
  const { data: recentArticlesData } = await supabase
    .from("articles")
    .select(`
      *,
      author:app_users(full_name:display_name),
      category:categories(name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  const recentArticles = recentArticlesData ?? []

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder-logo.png"
              alt="Tuganire News logo"
              width={40}
              height={40}
              className="h-8 w-8"
              priority
            />
            <h1 className="text-2xl font-bold">Tuganire TNT Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{currentUser.display_name || "User"}</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary uppercase">
              {currentUser.role}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-slate-50 p-6">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Welcome back, {currentUser.display_name || "User"}!</h2>
            <p className="text-muted-foreground mt-2">
              Here&apos;s what&apos;s happening with your news platform today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.articles}</div>
                <p className="text-xs text-muted-foreground mt-1">Published and drafts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.views.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">All time article views</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
            </CardHeader>
            <CardContent>
              {recentArticles && recentArticles.length > 0 ? (
                <div className="space-y-4">
                  {recentArticles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex-1">
                        <h3 className="font-medium">{article.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{article.author?.full_name || "Anonymous"}</span>
                          <span>•</span>
                          <span>{article.category?.name || "Uncategorized"}</span>
                          <span>•</span>
                          <span className="capitalize">{article.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{article.views_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No articles yet. Create your first article to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
