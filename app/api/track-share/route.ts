import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

const sb = createServiceClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { articleId, visitorId, sessionId, platform, path, referrer, metadata } = body || {}

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 })
    }

    const { error } = await sb.from("article_share_events").insert({
      article_id: articleId,
      visitor_id: visitorId || null,
      session_id: sessionId || null,
      platform: platform || null,
      path: path || null,
      referrer: referrer || null,
      metadata: metadata || {},
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}