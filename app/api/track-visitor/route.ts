import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createRlsClient } from "@/lib/supabase/server";

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
      browser,
      os,
      deviceType,
      referrer,
      sessionToken,
    }: {
      visitorId?: string;
      browser?: string;
      os?: string;
      deviceType?: "desktop" | "tablet" | "mobile" | "other";
      referrer?: string;
      sessionToken?: string;
    } = body || {};

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent");

    // Get authenticated user email from RLS client (if logged in)
    let email: string | null = null;
    try {
      const rlsClient = await createRlsClient();
      const {
        data: { user },
      } = await rlsClient.auth.getUser();
      email = user?.email ?? null;
    } catch {
      // ignore auth errors; email stays null
    }

    let finalVisitorId = visitorId || null;
    let sessionId: string | null = null;

    // 1) Update existing visitor if provided
    if (finalVisitorId) {
      const { data, error } = await sb
        .from("visitors")
        .update({
          last_seen_at: new Date().toISOString(),
          last_ip: ip,
          last_user_agent: userAgent,
          last_referrer: referrer ?? null,
          last_device_type: deviceType ?? null,
          last_browser: browser ?? null,
          last_os: os ?? null,
          email: email ?? undefined,
        })
        .eq("id", finalVisitorId)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        finalVisitorId = null;
      }
    }

    // 2) Create new visitor if needed
    if (!finalVisitorId) {
      const { data, error } = await sb
        .from("visitors")
        .insert({
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          first_ip: ip,
          last_ip: ip,
          first_user_agent: userAgent,
          last_user_agent: userAgent,
          first_referrer: referrer ?? null,
          last_referrer: referrer ?? null,
          first_device_type: deviceType ?? null,
          last_device_type: deviceType ?? null,
          first_browser: browser ?? null,
          last_browser: browser ?? null,
          first_os: os ?? null,
          last_os: os ?? null,
          email: email ?? null,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("Failed to create visitor", error);
        return NextResponse.json(
          { error: "Failed to create visitor" },
          { status: 500 }
        );
      }

      finalVisitorId = data.id;
    }

    // 3) Upsert session by sessionToken
    const effectiveSessionToken = sessionToken || crypto.randomUUID();

    const { data: sessionData, error: sessionError } = await sb
      .from("sessions")
      .upsert(
        {
          visitor_id: finalVisitorId,
          session_token: effectiveSessionToken,
          ip,
          user_agent: userAgent,
          device_type: deviceType ?? null,
          browser: browser ?? null,
          os: os ?? null,
          referrer: referrer ?? null,
          landing_path: null,
        },
        { onConflict: "session_token" }
      )
      .select("id")
      .single();

    if (sessionError || !sessionData) {
      console.error("Failed to upsert session", sessionError);
      // Do not fail; just return visitor id
    } else {
      sessionId = sessionData.id;
    }

    return NextResponse.json({ visitorId: finalVisitorId, sessionId });
  } catch (error) {
    console.error("/api/track-visitor error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
