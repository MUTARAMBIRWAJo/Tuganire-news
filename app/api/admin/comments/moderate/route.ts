import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient as createServiceClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser()
    if (!me || (me.role !== "admin" && me.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = req.headers.get("content-type") || ""
    let id = ""
    let action = ""
    if (contentType.includes("application/json")) {
      const body = await req.json()
      id = body?.id || ""
      action = body?.action || ""
    } else {
      const form = await req.formData()
      id = String(form.get("id") || "")
      action = String(form.get("action") || "")
    }

    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const sb = createServiceClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const status = action === "approve" ? "approved" : "rejected"

    const { error } = await sb
      .from("comments")
      .update({ status })
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id, status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
