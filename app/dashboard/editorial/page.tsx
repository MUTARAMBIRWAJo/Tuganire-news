import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { listEditorialContent } from "@/lib/editorial"

export default async function EditorialDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const editorial = await listEditorialContent()

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Editorial</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Editorial CMS</h1>
          </div>
          <Link href="/dashboard/editorial/create" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white">New editorial item</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Magazine", "magazine"],
            ["Research", "research"],
            ["Stories", "story"],
            ["History", "history"],
          ].map(([label, type]) => (
            <Link key={type} href={`/dashboard/editorial/${type}/new`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-200">
              <p className="text-sm font-medium text-slate-600">Create</p>
              <p className="mt-2 text-xl font-bold text-slate-950">{label}</p>
            </Link>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {editorial.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 capitalize">{item.content_type}</td>
                  <td className="px-4 py-3 uppercase">{item.language}</td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="px-4 py-3">{item.published_at ? new Date(item.published_at).toLocaleDateString() : "Draft"}</td>
                </tr>
              ))}
              {editorial.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No editorial items yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
