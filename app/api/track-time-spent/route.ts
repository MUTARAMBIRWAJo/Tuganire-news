import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key";

const sb = createServiceClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      articleViewId,
      visitorId,
      articleId,
      timeSpentSeconds,
    }: {
      articleViewId?: string;
      visitorId?: string;
      articleId?: string;
      timeSpentSeconds?: number;
    } = body || {};

    if (!timeSpentSeconds || timeSpentSeconds <= 0) {
      return NextResponse.json(
        { error: "timeSpentSeconds must be positive" },
        { status: 400 }
      );
    }

    if (articleViewId) {
      // Fetch existing row
      const { data: row, error: fetchError } = await sb
        .from("article_views_detailed")
        .select("id, time_spent_seconds")
        .eq("id", articleViewId)
        .maybeSingle();

      if (fetchError || !row) {
        return NextResponse.json(
          { error: "Article view not found" },
          { status: 404 }
        );
      }

      const newTime = (row.time_spent_seconds || 0) + timeSpentSeconds;

      const { data, error } = await sb
        .from("article_views_detailed")
        .update({
          time_spent_seconds: newTime,
          ended_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .select("id")
        .single();

      if (error || !data) {
        console.error("Failed to update time spent", error);
        return NextResponse.json(
          { error: "Failed to update time spent" },
          { status: 500 }
        );
      }
    } else if (visitorId && articleId) {
      const { data: rows, error: fetchError } = await sb
        .from("article_views_detailed")
        .select("id, time_spent_seconds")
        .eq("visitor_id", visitorId)
        .eq("article_id", articleId)
        .order("started_at", { ascending: false })
        .limit(1);

      if (fetchError || !rows || !rows.length) {
        return NextResponse.json(
          { error: "Article view not found" },
          { status: 404 }
        );
      }

      const current = rows[0];
      const newTime = (current.time_spent_seconds || 0) + timeSpentSeconds;

      const { data, error } = await sb
        .from("article_views_detailed")
        .update({
          time_spent_seconds: newTime,
          ended_at: new Date().toISOString(),
        })
        .eq("id", current.id)
        .select("id")
        .single();
    } else {
      return NextResponse.json(
        { error: "Provide articleViewId OR (visitorId and articleId)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/track-time-spent error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
