import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

const sb = createServiceClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await req.json().catch(() => ({} as any))
    const action: "like" | "unlike" | "toggle" = body?.action === "like" || body?.action === "unlike" ? body.action : "toggle"

    const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "")
      .split(",")[0]
      .trim() || null

    // Find article
    const { data: article, error: articleError } = await sb
      .from("articles")
      .select("id, likes_count")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()

    if (articleError || !article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    const articleId = article.id
    const currentLikes = Number(article.likes_count) || 0

    // Check existing like by IP
    const { data: existing, error: existingError } = await sb
      .from("article_likes")
      .select("id")
      .eq("article_id", articleId)
      .eq("ip", ip)
      .maybeSingle()

    if (existingError) {
      console.error("Failed to check existing like", existingError)
    }

    let liked = !!existing
    let newCount = currentLikes

    if (action === "unlike" || (action === "toggle" && liked)) {
      if (existing) {
        const { error: deleteError } = await sb
          .from("article_likes")
          .delete()
          .eq("id", existing.id)

        if (!deleteError) {
          newCount = Math.max(0, currentLikes - 1)
          await sb.from("articles").update({ likes_count: newCount }).eq("id", articleId)
          liked = false
        }
      }
    } else if (action === "like" || (action === "toggle" && !liked)) {
      if (!existing) {
        const { error: insertError } = await sb
          .from("article_likes")
          .insert({ article_id: articleId, ip })

        if (!insertError) {
          newCount = currentLikes + 1
          await sb.from("articles").update({ likes_count: newCount }).eq("id", articleId)
          liked = true
        }
      }
    }

    return NextResponse.json({ liked, likes_count: newCount }, { status: 200 })
  } catch (error) {
    console.error("Error in like endpoint", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "")
      .split(",")[0]
      .trim() || null

    const { data: article, error: articleError } = await sb
      .from("articles")
      .select("id, likes_count")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()

    if (articleError || !article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    let liked = false
    if (ip) {
      const { data: existing } = await sb
        .from("article_likes")
        .select("id")
        .eq("article_id", article.id)
        .eq("ip", ip)
        .maybeSingle()
      liked = !!existing
    }

    return NextResponse.json({ liked, likes_count: Number(article.likes_count) || 0 }, { status: 200 })
  } catch (error) {
    console.error("Error in like GET endpoint", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
