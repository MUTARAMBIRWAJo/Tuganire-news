import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/guards"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key"

export const runtime = "nodejs"

function toCsv(rows: any[], headers: string[]) {
  const esc = (v: any) => {
    const s = v == null ? "" : String(v)
    if (s.includes(",") || s.includes("\n") || s.includes("\"")) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n")
}

export async function GET(req: Request) {
  try {
    await requireRole(["admin", "superadmin"]) // will redirect/throw if not allowed

    const url = new URL(req.url)
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")

    const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const { data: reporters } = await sb
      .from("app_users")
      .select("id, display_name, email, created_at, role")
      .eq("role", "reporter")
      .order("created_at", { ascending: false })

    const ids = (reporters || []).map((r) => r.id)
    let art = [] as any[]
    if (ids.length > 0) {
      let q = sb.from("articles").select("author_id, status")
      if (from) q = q.gte("created_at", from)
      if (to) q = q.lte("created_at", to)
      const { data } = await q.in("author_id", ids)
      art = data || []
    }

    const agg = new Map<string, { total: number; published: number; pending: number }>()
    for (const a of art) {
      const k = (a as any).author_id
      const cur = agg.get(k) || { total: 0, published: 0, pending: 0 }
      cur.total++
      if ((a as any).status === "published") cur.published++
      if ((a as any).status === "submitted") cur.pending++
      agg.set(k, cur)
    }

    const rows = (reporters || []).map((r) => ({
      id: r.id,
      display_name: r.display_name,
      email: r.email,
      created_at: r.created_at,
      total_articles: agg.get(r.id)?.total || 0,
      published: agg.get(r.id)?.published || 0,
      pending: agg.get(r.id)?.pending || 0,
    }))

    const csv = toCsv(rows, [
      "id",
      "display_name",
      "email",
      "created_at",
      "total_articles",
      "published",
      "pending",
    ])

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=reporters_${Date.now()}.csv`,
        "Cache-Control": "no-store",
      },
    })
  } catch (e: any) {
    return new NextResponse("Failed to export", { status: 500 })
  }
}
