import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

function isAdmin(role?: string | null) {
  const r = (role || "").toLowerCase()
  return r === "superadmin" || r === "admin"
}

export async function GET(request: Request) {
  const me = await getCurrentUser()
  if (!me || !isAdmin(me.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1)
  const pageSizeRaw = parseInt(url.searchParams.get("pageSize") || "20", 10)
  const pageSize = Math.min(Math.max(1, pageSizeRaw), 100)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const status = url.searchParams.get("status") || "pending"
  const q = (url.searchParams.get("q") || "").trim()

  const supabase = await createClient()
  let query = supabase
    .from("comments")
    .select("id, article_slug, name, email, content, status, created_at", { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: true })

  if (q) query = query.or(`name.ilike.%${q}%,content.ilike.%${q}%`)

  const { data, count, error } = await query.range(from, to)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ items: data || [], total: count ?? 0, page, pageSize })
}

export async function POST(request: Request) {
  const me = await getCurrentUser()
  if (!me || !isAdmin(me.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  const { id, action } = body as { id?: string; action?: "approve" | "reject" | "delete" }
  if (!id || !action) return NextResponse.json({ error: "Missing id/action" }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supa = url && serviceKey
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()

  if (action === "delete") {
    const { error } = await supa.from("comments").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  const newStatus = action === "approve" ? "approved" : "rejected"
  const { error } = await supa.from("comments").update({ status: newStatus }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, status: newStatus })
}
