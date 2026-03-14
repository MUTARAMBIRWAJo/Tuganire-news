import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const page = Math.max(0, Number.isFinite(Number(searchParams.get('page'))) ? parseInt(searchParams.get('page') as string, 10) : 0)
  const pageSizeRaw = Number.isFinite(Number(searchParams.get('pageSize'))) ? parseInt(searchParams.get('pageSize') as string, 10) : 12
  const pageSize = Math.min(Math.max(1, pageSizeRaw), 50)

  if (!q) {
    return NextResponse.json({ items: [], total: 0 }, { status: 200 })
  }

  let query = sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `, { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .not('published_at', 'is', null)

  const term = q.replace(/%/g, '')
  query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`)

  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query.order('published_at', { ascending: false }).range(from, to)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseItems = (data || []).map((a: any) => ({
    ...a,
    author: Array.isArray(a.author) ? a.author[0] : a.author,
    category: Array.isArray(a.category) ? a.category[0] : a.category,
  }))

  const items = await Promise.all(
    baseItems.map(async (a: any) => {
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
    })
  )

  return NextResponse.json({ items, total: count ?? 0 }, { status: 200 })
}
