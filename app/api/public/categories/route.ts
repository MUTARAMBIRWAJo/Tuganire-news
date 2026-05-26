import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

export const revalidate = 60

function extractYouTubeThumbnail(youtubeUrl: string): string {
  if (!youtubeUrl) return ""
  try {
    // Handle youtu.be short links
    const short = youtubeUrl.match(/^https?:\/\/youtu\.be\/(([\w-]{6,}))/i)
    if (short) return `https://img.youtube.com/vi/${short[2]}/maxresdefault.jpg`
    // Handle standard watch URLs
    const u = new URL(youtubeUrl)
    const v = u.searchParams.get("v")
    if (v) return `https://img.youtube.com/vi/${v}/maxresdefault.jpg`
  } catch {}
  return ""
}

function normalizeArticle(a: any) {
  if (!a) return null
  const author = (Array.isArray(a.author) ? a.author[0] : a.author) || null
  const category = (Array.isArray(a.category) ? a.category[0] : a.category) || null
  return {
    id: a.id,
    slug: a.slug,
    title: a.title || '',
    excerpt: a.excerpt || '',
    featured_image: a.featured_image || a.image_url || null,
    published_at: a.published_at || a.created_at || null,
    views_count: a.views_count || 0,
    author: author && (author.display_name || author.full_name || author.name) ? author : null,
    category: category && (category.name || category.slug) ? category : (a.category ? { name: String(a.category), slug: String(a.category).toLowerCase().replace(/\s+/g, '-') } : null),
  }
}

export async function GET() {
  try {
    // get all categories
    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('invalid.supabase')) {
      return NextResponse.json({ categories: [] }, { status: 200 })
    }
    const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data: categories, error } = await sb.from('categories').select('id, name, slug').order('name', { ascending: true })
    if (error) return NextResponse.json({ categories: [], note: error.message }, { status: 200 })

  // for each category, fetch up to 4 latest published text articles (exclude videos)
  const results = [] as any[]
  for (const c of categories || []) {
    const { data: arts } = await sb
      .from('articles')
      .select('id, slug, title, excerpt, featured_image, published_at, views_count, article_type, author:app_users(display_name, avatar_url), category:categories(name, slug)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .eq('category_id', c.id)
      .in('article_type', ['text', null])
      .order('published_at', { ascending: false })
      .limit(4)

    const base = (arts || []).map(normalizeArticle)
    const withCounts = await Promise.all((base || []).map(async (a: any) => {
      if (!a?.slug) return a
      try {
        const { count: cCount } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved')
        return { ...a, comments_count: cCount ?? 0 }
      } catch {
        return { ...a, comments_count: 0 }
      }
    }))

    results.push({
      id: c.id,
      name: c.name,
      slug: c.slug,
      articles: withCounts,
    })
  }

    return NextResponse.json({ categories: results }, { status: 200 })
  } catch (err: any) {
    console.error('public/categories route error', err)
    return NextResponse.json({ categories: [] }, { status: 200 })
  }
}
