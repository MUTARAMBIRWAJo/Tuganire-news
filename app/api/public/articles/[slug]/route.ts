import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

function normalizeArticle(a: any) {
  if (!a) return null
  const author = (Array.isArray(a.author) ? a.author[0] : a.author) || null
  const category = (Array.isArray(a.category) ? a.category[0] : a.category) || null
  return {
    id: a.id,
    slug: a.slug,
    title: a.title || '',
    excerpt: a.excerpt || '',
    content: a.content || '',
    featured_image: a.featured_image || a.image_url || null,
    published_at: a.published_at || a.created_at || null,
    updated_at: a.updated_at || a.published_at || a.created_at || null,
    views_count: a.views_count || 0,
    likes_count: a.likes_count || 0,
    comments_count: a.comments_count ?? 0,
    content_label: a.content_label || null,
    promotion_type: a.promotion_type || null,
    is_sponsored: a.is_sponsored === true,
    is_partner_content: a.is_partner_content === true,
    is_promoted_story: a.is_promoted_story === true,
    fact_check_status: a.fact_check_status || a.factcheck_status || null,
    is_fact_checked: a.is_fact_checked === true || a.fact_checked === true || false,
    author: author && (author.display_name || author.full_name || author.name) ? author : null,
    category: category && (category.name || category.slug) ? category : (a.category ? { name: String(a.category), slug: String(a.category).toLowerCase().replace(/\s+/g, '-') } : null),
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Priority 1: published relational
  const { data: primary } = await sb
    .from('articles')
    .select(`*, likes_count, author:app_users(id, display_name, avatar_url), category:categories(name, slug)`).eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  let article = normalizeArticle(primary)

  // Fallback: any status, simple columns
  if (!article) {
    const { data: basic } = await sb
      .from('articles')
      .select('id, slug, title, excerpt, content, image_url, category, author_name, created_at, featured_image, published_at, views_count, likes_count')
      .eq('slug', slug)
      .maybeSingle()
    if (basic) {
      article = normalizeArticle({
        ...basic,
        author: basic.author_name ? { display_name: basic.author_name, avatar_url: null } : null,
        category: basic.category ? { name: basic.category, slug: String(basic.category).toLowerCase().replace(/\s+/g, '-') } : null,
      })
    }
  }

  if (!article) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  let authorProfile = article.author
  const authorId = (article.author as any)?.id || (primary as any)?.author_id || null
  if (authorId) {
    try {
      const { data: user } = await sb.from('app_users').select('*').eq('id', authorId).maybeSingle()
      if (user) {
        let articleCount = 0
        try {
          const { count } = await sb
            .from('articles')
            .select('id', { count: 'exact', head: true })
            .eq('author_id', authorId)
            .eq('status', 'published')
          articleCount = count ?? 0
        } catch {
          articleCount = 0
        }

        authorProfile = {
          id: user.id,
          display_name: user.display_name || user.full_name || user.name || article.author?.display_name || 'Newsroom Reporter',
          avatar_url: user.avatar_url || article.author?.avatar_url || null,
          bio: user.bio || user.short_bio || null,
          role: user.role || null,
          title: user.title || user.job_title || null,
          twitter_url: user.twitter_url || user.x_url || null,
          linkedin_url: user.linkedin_url || null,
          instagram_url: user.instagram_url || null,
          website_url: user.website_url || user.website || null,
          article_count: articleCount,
        }
      }
    } catch {
      // keep fallback author object if profile query fails
    }
  }

  article = { ...article, author: authorProfile }

  // Media
  const { data: media } = await sb
    .from('media')
    .select('id, media_type, url, caption')
    .eq('article_id', article.id)
    .order('created_at', { ascending: false })
    .limit(12)

  // Related: same category top 3 published (exclude current)
  let related: any[] = []
  if (article.category?.slug) {
    const { data: catRow } = await sb.from('categories').select('id').eq('slug', article.category.slug).maybeSingle()
    if (catRow?.id) {
      const { data: rel } = await sb
        .from('articles')
        .select('id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, author:app_users(display_name, avatar_url), category:categories(name, slug)')
        .eq('category_id', catRow.id)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .neq('slug', article.slug)
        .order('published_at', { ascending: false })
        .limit(6)
      related = (rel || []).map(normalizeArticle)
    }
  }

  if (!related.length) {
    const { data: recent } = await sb
      .from('articles')
      .select('id, slug, title, excerpt, featured_image, published_at, views_count, likes_count, author:app_users(display_name, avatar_url), category:categories(name, slug)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .neq('slug', article.slug)
      .order('published_at', { ascending: false })
      .limit(6)
    related = (recent || []).map(normalizeArticle)
  }

  // Attach comments_count to main article
  try {
    const { count: articleCommentsCount } = await sb
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('article_slug', article.slug)
      .eq('status', 'approved')
    article = { ...article, comments_count: articleCommentsCount ?? 0 }
  } catch {
    article = { ...article, comments_count: 0 }
  }

  // Attach comments_count to related articles
  const relatedWithCounts = await Promise.all(
    related.map(async (r: any) => {
      if (!r?.slug) return { ...r, comments_count: 0 }
      try {
        const { count } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', r.slug)
          .eq('status', 'approved')
        return { ...r, comments_count: count ?? 0 }
      } catch {
        return { ...r, comments_count: 0 }
      }
    })
  )

  return NextResponse.json({ article, media: media || [], related: relatedWithCounts }, { status: 200 })
}
