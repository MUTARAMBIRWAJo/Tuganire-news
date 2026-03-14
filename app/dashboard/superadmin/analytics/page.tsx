import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import ViewsMiniChart from "@/components/views-mini-chart"

export default async function SuperAdminAnalyticsPage() {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalArticles },
    { count: published },
    { count: drafts },
    { count: submitted },
    { count: reporters },
    { count: comments },
    { count: last7 },
    { data: allCategories },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "reporter"),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("categories").select("id, name"),
  ])

  // Simple top categories: make small per-category counts and pick top 5
  let topCategories: { name: string; count: number }[] = []
  if (allCategories && allCategories.length > 0) {
    const results = await Promise.all(
      allCategories.slice(0, 20).map(async (c: any) => {
        const { count } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("category_id", c.id)
          .eq("status", "published")
        return { name: c.name, count: count || 0 }
      })
    )
    topCategories = results.sort((a, b) => b.count - a.count).slice(0, 5)
  }

  // ── Editorial analytics (new tables – graceful fallback when not yet migrated) ──
  type ShareRow  = { platform: string | null }
  type CompRow   = { completion_percent: number | null; completed: boolean | null }
  type QualRow   = { seo_score: number | null; publish_ready: boolean | null; article_id: string }
  type ArticleRow = { id: string; title: string }

  const [
    { data: shareRows },
    { data: compRows },
    { data: qualRows },
  ] = await Promise.all([
    supabase
      .from("article_share_events")
      .select("platform")
      .gte("created_at", thirtyDaysAgo)
      .returns<ShareRow[]>(),
    supabase
      .from("article_reading_completion")
      .select("completion_percent, completed")
      .gte("created_at", thirtyDaysAgo)
      .returns<CompRow[]>(),
    supabase
      .from("article_quality_reports")
      .select("seo_score, publish_ready, article_id")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<QualRow[]>(),
  ]).catch(() => [{ data: null }, { data: null }, { data: null }]) as [
    { data: ShareRow[] | null },
    { data: CompRow[] | null },
    { data: QualRow[] | null },
  ]

  // Share breakdown by platform
  const platformMap: Record<string, number> = {}
  for (const row of shareRows ?? []) {
    const p = row.platform ?? "unknown"
    platformMap[p] = (platformMap[p] ?? 0) + 1
  }
  const sharesByPlatform = Object.entries(platformMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const totalShares = (shareRows ?? []).length

  // Reading completion stats
  const compList = compRows ?? []
  const avgCompletion = compList.length
    ? Math.round(compList.reduce((s, r) => s + (r.completion_percent ?? 0), 0) / compList.length)
    : 0
  const completedCount = compList.filter((r) => r.completed).length

  // Quality score stats – deduplicate by keeping the latest report per article
  const latestByArticle: Record<string, QualRow> = {}
  for (const row of qualRows ?? []) {
    if (!latestByArticle[row.article_id]) latestByArticle[row.article_id] = row
  }
  const uniqueQual = Object.values(latestByArticle)
  const avgSeo = uniqueQual.length
    ? Math.round(uniqueQual.reduce((s, r) => s + (r.seo_score ?? 0), 0) / uniqueQual.length)
    : 0
  const publishReadyCount = uniqueQual.filter((r) => r.publish_ready).length
  const needsWorkCount = uniqueQual.filter((r) => !r.publish_ready).length

  // Top 5 article IDs by seo_score
  const top5Qual = [...uniqueQual]
    .sort((a, b) => (b.seo_score ?? 0) - (a.seo_score ?? 0))
    .slice(0, 5)
  let topQualTitles: { title: string; score: number }[] = []
  if (top5Qual.length > 0) {
    const ids = top5Qual.map((r) => r.article_id)
    const { data: artRows } = await supabase
      .from("articles")
      .select("id, title")
      .in("id", ids)
      .returns<ArticleRow[]>()
    const titleMap: Record<string, string> = {}
    for (const a of artRows ?? []) titleMap[a.id] = a.title
    topQualTitles = top5Qual.map((r) => ({
      title: titleMap[r.article_id] ?? "Untitled",
      score: r.seo_score ?? 0,
    }))
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">System Analytics</h1>
          <p className="text-slate-600 mt-2">Key metrics and breakdowns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalArticles || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{published || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{submitted || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{drafts || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reporters || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{comments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>New Articles (7d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{last7 || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {topCategories.length > 0 ? (
                <ul className="text-sm text-slate-700 space-y-1">
                  {topCategories.map((c) => (
                    <li key={c.name} className="flex items-center justify-between">
                      <span>{c.name}</span>
                      <span className="font-semibold">{c.count}</span>
                    </li>) )}
                </ul>
              ) : (
                <p className="text-slate-600">No category data.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Views (last 30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ViewsMiniChart defaultRange="30d" />
            </CardContent>
          </Card>
        </div>

        {/* ── Social Share Analytics (last 30 days) ── */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Social Shares (last 30 days)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Shares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalShares}</div>
                <p className="text-sm text-slate-500 mt-1">across all platforms</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Shares by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                {sharesByPlatform.length > 0 ? (
                  <ul className="space-y-2">
                    {sharesByPlatform.map(([platform, count]) => {
                      const pct = totalShares > 0 ? Math.round((count / totalShares) * 100) : 0
                      return (
                        <li key={platform} className="flex items-center gap-3">
                          <span className="w-24 text-sm capitalize text-slate-700 shrink-0">{platform}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 w-12 text-right">{count}</span>
                          <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">No share events recorded yet. Run the SQL migration and share events will appear here.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Reading Completion Analytics (last 30 days) ── */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Reading Completion (last 30 days)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Avg Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgCompletion}%</div>
                <p className="text-sm text-slate-500 mt-1">average scroll depth</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Full Reads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedCount}</div>
                <p className="text-sm text-slate-500 mt-1">readers reached 85%+</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tracked Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{compList.length}</div>
                <p className="text-sm text-slate-500 mt-1">reading sessions logged</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Editorial Quality Analytics (last 30 days) ── */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Editorial Quality (last 30 days)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Articles Reviewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueQual.length}</div>
                <p className="text-sm text-slate-500 mt-1">unique articles scored</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${avgSeo >= 70 ? "text-green-600" : avgSeo >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {avgSeo}/100
                </div>
                <p className="text-sm text-slate-500 mt-1">gate: 70 to publish</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Publish-Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{publishReadyCount}</div>
                <p className="text-sm text-slate-500 mt-1">articles passed all checks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Needs Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{needsWorkCount}</div>
                <p className="text-sm text-slate-500 mt-1">articles below threshold</p>
              </CardContent>
            </Card>
          </div>

          {topQualTitles.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Articles by SEO Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topQualTitles.map((item, i) => (
                      <li key={i} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-700 truncate flex-1">{item.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${item.score >= 70 ? "bg-green-500" : item.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 w-12 text-right">{item.score}/100</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
