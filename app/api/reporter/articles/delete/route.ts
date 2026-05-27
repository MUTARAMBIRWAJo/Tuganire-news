import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/guards"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    const me = await requireRole(["reporter", "admin", "superadmin"])

    const supabase = await createClient()
    const { error } = await supabase.from("articles").delete().eq("id", id).eq("author_id", me.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}
