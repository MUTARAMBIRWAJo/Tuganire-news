import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "node:crypto"

export const runtime = "nodejs"

function hashToken(value: string) {
  return crypto.createHash("sha256").update(value.trim().toUpperCase()).digest("hex")
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase.from("user_sessions").select("*").eq("user_id", user.id).order("last_active_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ sessions: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load sessions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const sessionToken = String(formData.get("session_token") || "").trim()
    const currentToken = hashToken((await supabase.auth.getSession()).data.session?.access_token || "")

    if (sessionToken === "others") {
      const { error } = await supabase.from("user_sessions").delete().eq("user_id", user.id).neq("session_token", currentToken)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.redirect(new URL("/dashboard/public/security?security=sessions-others-logged-out", request.url), { status: 303 })
    }

    if (!sessionToken) return NextResponse.json({ error: "session_token required" }, { status: 400 })

    const { error } = await supabase.from("user_sessions").delete().eq("user_id", user.id).eq("session_token", sessionToken)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.redirect(new URL("/dashboard/public/security?security=session-logged-out", request.url), { status: 303 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update sessions" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  return POST(request)
}
