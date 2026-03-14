import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key";

const sb = createServiceClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xrip = req.headers.get("x-real-ip");
  if (xrip) return xrip;
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      visitorId,
      sessionId,
      articleId,
      browser,
      os,
      deviceType,
      referrer,
      path,
    }: {
      visitorId?: string;
      sessionId?: string;
      articleId?: string;
      browser?: string;
      os?: string;
      deviceType?: "desktop" | "tablet" | "mobile" | "other";
      referrer?: string;
      path?: string;
    } = body || {};

    if (!visitorId || !articleId) {
      return NextResponse.json(
        { error: "visitorId and articleId are required" },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);

    const { data, error } = await sb
      .from("article_views_detailed")
      .insert({
        visitor_id: visitorId,
        session_id: sessionId || null,
        article_id: articleId,
        started_at: new Date().toISOString(),
        device_type: deviceType ?? null,
        browser: browser ?? null,
        os: os ?? null,
        ip,
        referrer: referrer ?? null,
        path: path ?? null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to insert article view", error);
      return NextResponse.json(
        { error: "Failed to insert article view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ articleViewId: data.id });
  } catch (error) {
    console.error("/api/track-article-view error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
