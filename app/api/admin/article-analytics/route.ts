import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { client: null as ReturnType<typeof createServiceClient> | null, error: "Supabase environment variables are not configured" };
  }

  return {
    client: createServiceClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    }),
    error: null as string | null,
  };
}

export async function GET(req: Request) {
  try {
    const { client: sb, error: envError } = getServiceClient();
    if (envError || !sb) {
      return NextResponse.json({ error: envError || "Service unavailable" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const fromIso = from ? new Date(from).toISOString() : null;
    const toIso = to ? new Date(to + "T23:59:59.999Z").toISOString() : null;

    // Top articles by detailed views (aggregate in JS)
    let topQuery = sb
      .from("article_views_detailed")
      .select("article_id");

    if (fromIso) topQuery = topQuery.gte("started_at", fromIso);
    if (toIso) topQuery = topQuery.lte("started_at", toIso);

    const { data: topRows, error: topErr } = await topQuery;

    if (topErr) throw topErr;

    const topMap = new Map<string, number>();
    for (const row of topRows || []) {
      const id = row.article_id as string;
      topMap.set(id, (topMap.get(id) || 0) + 1);
    }
    const topEntries = Array.from(topMap.entries())
      .map(([article_id, view_count]) => ({ article_id, view_count }))
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 20);

    // Unique visitors per day
    let uniqueQuery = sb
      .from("article_views_detailed")
      .select("visitor_id, started_at")
      .order("started_at", { ascending: true });

    if (fromIso) uniqueQuery = uniqueQuery.gte("started_at", fromIso);
    if (toIso) uniqueQuery = uniqueQuery.lte("started_at", toIso);

    const { data: uniquePerDay, error: uniqueErr } = await uniqueQuery;

    if (uniqueErr) throw uniqueErr;

    const visitorsByDayMap = new Map<string, Set<string>>();
    for (const row of uniquePerDay || []) {
      const day = new Date(row.started_at).toISOString().slice(0, 10);
      if (!visitorsByDayMap.has(day)) visitorsByDayMap.set(day, new Set());
      visitorsByDayMap.get(day)!.add(row.visitor_id);
    }
    const uniqueVisitorsPerDay = Array.from(visitorsByDayMap.entries()).map(
      ([day, set]) => ({ day, unique_visitors: set.size })
    );

    // Average read time per article
    let avgQuery = sb
      .from("article_views_detailed")
      .select("article_id, time_spent_seconds")
      .not("time_spent_seconds", "is", null);

    if (fromIso) avgQuery = avgQuery.gte("started_at", fromIso);
    if (toIso) avgQuery = avgQuery.lte("started_at", toIso);

    const { data: avgReadTime, error: avgErr } = await avgQuery;

    if (avgErr) throw avgErr;

    const readTimeMap = new Map<
      string,
      { total: number; count: number }
    >();
    for (const row of avgReadTime || []) {
      const id = row.article_id as string;
      const t = row.time_spent_seconds as number;
      if (!readTimeMap.has(id)) readTimeMap.set(id, { total: 0, count: 0 });
      const cur = readTimeMap.get(id)!;
      cur.total += t;
      cur.count += 1;
    }
    const avgEntries = Array.from(readTimeMap.entries()).map(
      ([article_id, { total, count }]) => ({
        article_id,
        avg_read_time_seconds: total / count,
        view_count: count,
      })
    );

    // Load article metadata (title, slug) for all involved article_ids
    const allArticleIds = Array.from(
      new Set([
        ...topEntries.map((t) => t.article_id),
        ...avgEntries.map((a) => a.article_id),
      ])
    );

    let articlesById = new Map<string, { title: string | null; slug: string | null }>();
    if (allArticleIds.length > 0) {
      const { data: articleRows, error: articleErr } = await sb
        .from("articles")
        .select("id, title, slug")
        .in("id", allArticleIds);

      if (articleErr) throw articleErr;

      for (const row of articleRows || []) {
        articlesById.set(row.id as string, {
          title: (row.title as string) ?? null,
          slug: (row.slug as string) ?? null,
        });
      }
    }

    const topArticles = topEntries.map((t) => {
      const meta = articlesById.get(t.article_id) || { title: null, slug: null };
      return { ...t, title: meta.title, slug: meta.slug };
    });

    const avgReadTimePerArticle = avgEntries.map((a) => {
      const meta = articlesById.get(a.article_id) || { title: null, slug: null };
      return { ...a, title: meta.title, slug: meta.slug };
    });

    // Browser stats
    let browserQuery = sb
      .from("article_views_detailed")
      .select("browser, started_at");

    if (fromIso) browserQuery = browserQuery.gte("started_at", fromIso);
    if (toIso) browserQuery = browserQuery.lte("started_at", toIso);

    const { data: browserRows, error: browserErr } = await browserQuery;

    if (browserErr) throw browserErr;

    const browserMap = new Map<string, number>();
    for (const row of browserRows || []) {
      const key = (row.browser as string) || "Unknown";
      browserMap.set(key, (browserMap.get(key) || 0) + 1);
    }
    const browsers = Array.from(browserMap.entries())
      .map(([browser, views]) => ({ browser, views }))
      .sort((a, b) => b.views - a.views);

    // Device stats
    let deviceQuery = sb
      .from("article_views_detailed")
      .select("device_type, started_at");

    if (fromIso) deviceQuery = deviceQuery.gte("started_at", fromIso);
    if (toIso) deviceQuery = deviceQuery.lte("started_at", toIso);

    const { data: deviceRows, error: deviceErr } = await deviceQuery;

    if (deviceErr) throw deviceErr;

    const deviceMap = new Map<string, number>();
    for (const row of deviceRows || []) {
      const key = (row.device_type as string) || "unknown";
      deviceMap.set(key, (deviceMap.get(key) || 0) + 1);
    }
    const devices = Array.from(deviceMap.entries()).map(([device_type, views]) => ({
      device_type,
      views,
    }));

    // Traffic by hour of day
    let hourQuery = sb
      .from("article_views_detailed")
      .select("started_at");

    if (fromIso) hourQuery = hourQuery.gte("started_at", fromIso);
    if (toIso) hourQuery = hourQuery.lte("started_at", toIso);

    const { data: hourRows, error: hourErr } = await hourQuery;

    if (hourErr) throw hourErr;

    const hourMap = new Map<number, number>();
    for (const row of hourRows || []) {
      const d = new Date(row.started_at as string);
      const h = d.getUTCHours();
      hourMap.set(h, (hourMap.get(h) || 0) + 1);
    }
    const trafficByHour = Array.from(hourMap.entries())
      .map(([hour, views]) => ({ hour, views }))
      .sort((a, b) => a.hour - b.hour);

    return NextResponse.json({
      topArticles,
      uniqueVisitorsPerDay,
      avgReadTimePerArticle,
      browsers,
      devices,
      trafficByHour,
    });
  } catch (e) {
    console.error("/api/admin/article-analytics error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
