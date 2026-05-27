import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/lib/auth/guards"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function PublicHistoryPage() {
  const user = await requireRole(["public", "subscriber", "advertiser", "supporter", "reporter", "admin", "superadmin"])
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from("reading_history")
    .select("id, visited_at, article:articles(id, title, slug, excerpt, status, published_at)")
    .eq("user_id", user.id)
    .order("visited_at", { ascending: false })
    .limit(50)

  const items = Array.isArray(rows) ? rows : []

  return (
    <DashboardShell
      title="Reading History"
      description="Your recently viewed stories."
      userName={user.display_name || "User"}
      role={user.role}
    >
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Reading History</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">No recently viewed stories yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((row: any) => (
                <li key={row.id} className="border-b last:border-b-0 py-3">
                  {row.article ? (
                    <Link href={`/articles/${row.article.slug}`} className="block">
                      <div className="font-medium text-slate-900 dark:text-white">{row.article.title}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{row.article.excerpt}</div>
                    </Link>
                  ) : (
                    <div className="text-sm text-slate-600 dark:text-slate-300">Viewed item</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
