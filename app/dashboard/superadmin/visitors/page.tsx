import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SuperAdminVisitorsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "superadmin") {
    redirect("/auth/login")
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase =
    serviceKey && url
      ? createServiceClient(url, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : await createClient()

  const activeSince = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const [
    { data: visitors, count: visitorCount, error },
    { count: sessionCount, error: sessionError },
    { count: viewCount, error: viewError },
    { count: activeSessionCount, error: activeSessionError },
  ] = await Promise.all([
    supabase
      .from("visitors")
      .select(
      `
      id,
      first_seen_at,
      last_seen_at,
      first_ip,
      last_ip,
      first_device_type,
      last_device_type,
      first_browser,
      last_browser,
      first_os,
      last_os,
      first_referrer,
      last_referrer,
      email
    `,
        { count: "exact" },
      )
      .order("last_seen_at", { ascending: false })
      .limit(500),
    supabase.from("sessions").select("id", { count: "exact", head: true }),
    supabase.from("article_views_detailed").select("id", { count: "exact", head: true }),
    supabase.from("sessions").select("id", { count: "exact", head: true }).gte("updated_at", activeSince),
  ])

  if (error || sessionError || viewError || activeSessionError) {
    console.error("Failed to load visitors", error)
  }

  const loadError = error || sessionError || viewError || activeSessionError

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Visitors</h1>
          <p className="text-slate-600 mt-2">
            Recent website visitors tracked by the analytics system.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Unique visitors", value: visitorCount ?? 0 },
            { label: "Active sessions", value: activeSessionCount ?? 0 },
            { label: "Total sessions", value: sessionCount ?? 0 },
            { label: "Article views", value: viewCount ?? 0 },
          ].map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{metric.value.toLocaleString()}</p>
                {metric.label === "Active sessions" && <p className="mt-1 text-xs text-slate-500">Seen in the last 30 minutes</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {loadError && (
          <Card className="border-red-200">
            <CardContent className="p-5 text-sm text-red-700">
              Visitor analytics could not be loaded. Check the tracking tables and server Supabase configuration.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Latest visitor records ({visitorCount ?? visitors?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="px-3 py-2 text-left">Visitor ID</th>
                  <th className="px-3 py-2 text-left">First Seen</th>
                  <th className="px-3 py-2 text-left">Last Seen</th>
                  <th className="px-3 py-2 text-left">IP (First / Last)</th>
                  <th className="px-3 py-2 text-left">Device</th>
                  <th className="px-3 py-2 text-left">Browser</th>
                  <th className="px-3 py-2 text-left">OS</th>
                  <th className="px-3 py-2 text-left">Referrer</th>
                  <th className="px-3 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {(visitors || []).map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-xs max-w-[160px] truncate">
                      {v.id}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {v.first_seen_at ? new Date(v.first_seen_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {v.last_seen_at ? new Date(v.last_seen_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div>{v.first_ip || "-"}</div>
                      <div className="text-slate-400">{v.last_ip || "-"}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div>{v.first_device_type || "-"}</div>
                      <div className="text-slate-400">{v.last_device_type || "-"}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div>{v.first_browser || "-"}</div>
                      <div className="text-slate-400">{v.last_browser || "-"}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div>{v.first_os || "-"}</div>
                      <div className="text-slate-400">{v.last_os || "-"}</div>
                    </td>
                    <td className="px-3 py-2 text-xs max-w-[200px] truncate">
                      <div>{v.first_referrer || "-"}</div>
                      <div className="text-slate-400">{v.last_referrer || "-"}</div>
                    </td>
                    <td className="px-3 py-2 text-xs max-w-[160px] truncate">
                      {v.email || "-"}
                    </td>
                  </tr>
                ))}
                {(!visitors || visitors.length === 0) && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                      No visitors recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
