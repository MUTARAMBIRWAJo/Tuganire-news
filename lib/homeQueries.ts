import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

let sb: any = null
let analyticsSb: any = null
if (supabaseUrl && anonKey) {
  sb = createClient(supabaseUrl, anonKey)
  if (serviceKey) {
    analyticsSb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  }
} else {
  console.warn('Supabase not configured — homeQueries returning safe fallbacks')
}

export async function getBreaking(limit = 10, language: string = 'en') {
  if (!sb) return []

  let { data, error } = await sb
    .from('articles')
    .select(`id, slug, story_group_id, title, excerpt, featured_image, published_at,
      category:category_id ( name, slug )`)
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .eq('is_breaking', true)
    .neq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getBreaking query error', error)
    data = null
  }

  // Attach approved comments_count per item
  const withCounts = await Promise.all(
    (data || []).map(async (a: any) => {
      if (!a?.slug) return { ...a, comments_count: 0 };
      try {
        const { count } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved');
        return { ...a, comments_count: count ?? 0 };
      } catch {
        return { ...a, comments_count: 0 };
      }
    })
  );

  return withCounts ?? [];
}

export async function getFeaturedHero(language: string = 'en') {
  if (!sb) return null

  const { data: initialArticles, error } = await sb
    .from('articles')
    .select('id, slug, story_group_id, title, excerpt, featured_image, published_at, is_featured, is_editor_pick, author_id, category_id')
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .neq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .or('is_editor_pick.eq.true,is_featured.eq.true')
    .order('published_at', { ascending: false })
    .limit(1)
  if (error) {
    console.error('getFeaturedHero query error', error)
    return null
  }
  let article = initialArticles?.[0] as any || null
  if (!article) {
    const { data: fallback } = await sb
      .from('articles')
      .select('id, slug, story_group_id, title, excerpt, featured_image, published_at, author_id, category_id')
      .eq('language', language === 'rw' ? 'rw' : 'en')
      .eq('status', 'published')
      .neq('article_type', 'video')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!fallback) return null
    article = fallback
  }

  const [{ data: author }, { data: category }] = await Promise.all([
    article.author_id ? sb.from('app_users').select('display_name, avatar_url').eq('id', article.author_id).maybeSingle() : Promise.resolve({ data: null } as any),
    article.category_id ? sb.from('categories').select('name, slug').eq('id', article.category_id).maybeSingle() : Promise.resolve({ data: null } as any),
  ])
  let comments_count = 0
  if (article.slug) {
    const { count } = await sb.from('comments').select('id', { count: 'exact', head: true }).eq('article_slug', article.slug).eq('status', 'approved')
    comments_count = count ?? 0
  }
  return { ...article, categories: category, authors: author, comments_count }
}

export async function getTrending(limit = 10, language: string = 'en') {
  if (!sb) return []
  const { data, error } = await sb
    .from('articles')
    .select('id, slug, story_group_id, title, excerpt, featured_image, published_at, views_count, category:category_id ( name, slug )')
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .neq('article_type', 'video')
    .order('views_count', { ascending: false, nullsFirst: false })
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('getTrending error', error)
    return []
  }
  return data ?? []
}

export async function getLatestByCategoryRows(language: string = 'en') {
  if (!sb) return []

  // Get all categories
  const { data: categories, error: catError } = await sb
    .from('categories')
    .select('id, name, slug')
    .limit(100)
    .order('name', { ascending: true });
  
  if (catError) {
    console.warn('getLatestByCategoryRows categories unavailable', {
      message: catError.message,
      code: catError.code,
      details: catError.details,
    })
    return []
  }
  
  // For each category, fetch latest 5 text articles (exclude videos)
  const categoryRows = await Promise.all(
    (categories || []).map(async (category: any) => {
      const { data: articles, error: artError } = await sb
        .from('articles')
        .select('id, slug, story_group_id, title, excerpt, featured_image, published_at, views_count, article_type')
        .eq('language', language === 'rw' ? 'rw' : 'en')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .eq('category_id', category.id)
        .neq('article_type', 'video')
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (artError) {
        console.warn('getLatestByCategoryRows articles unavailable for', category.slug, {
          message: artError.message,
          code: artError.code,
          details: artError.details,
        })
        return { 
          category_name: category.name, 
          category_slug: category.slug, 
          articles: [] 
        };
      }
      
      // Attach comment counts
      const articlesWithCounts = await Promise.all(
        (articles || []).map(async (a: any) => {
          try {
            const { count } = await sb
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('article_slug', a.slug)
              .eq('status', 'approved');
            return { ...a, comments_count: count ?? 0 };
          } catch {
            return { ...a, comments_count: 0 };
          }
        })
      );
      
      return {
        category_name: category.name,
        category_slug: category.slug,
        articles: articlesWithCounts
      };
    })
  );
  
  return categoryRows ?? [];
}

export async function getPhotoGallery(limit = 8, language: string = 'en') {
  if (!sb) return []

  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, story_group_id, title, featured_image, published_at, views_count,
      category:category_id ( id, name, slug )
    `)
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .neq('article_type', 'video')
    .not('featured_image', 'is', null)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('getPhotoGallery error', error)
    return []
  }
  
  // Attach approved comments_count per item
  const withCounts = await Promise.all(
    (data || []).map(async (a: any) => {
      if (!a?.slug) return { ...a, comments_count: 0 };
      try {
        const { count } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved');
        return { 
          ...a, 
          comments_count: count ?? 0,
          category: Array.isArray(a.category) ? a.category[0] : a.category,
        };
      } catch {
        return { 
          ...a, 
          comments_count: 0,
          category: Array.isArray(a.category) ? a.category[0] : a.category,
        };
      }
    })
  );
  
  return withCounts ?? [];
}

export async function getHomepageCategories(limit = 8) {
  if (!sb) return []

  const { data, error } = await sb
    .from('categories')
    .select('id, name, slug')
    .order('name')
    .limit(limit);
  if (error) {
    console.error('getHomepageCategories error', error)
    return []
  }
  return data ?? [];
}

export async function getEditorsPicks(limit = 6, language: string = 'en') {
  if (!sb) return []

  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, story_group_id, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .neq('article_type', 'video')
    .eq('is_editor_pick', true)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('getEditorsPicks error', error)
    return []
  }
  
  // Attach approved comments_count per item
  const withCounts = await Promise.all(
    (data || []).map(async (a: any) => {
      if (!a?.slug) return { ...a, comments_count: 0 };
      try {
        const { count } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved');
        return { 
          ...a, 
          comments_count: count ?? 0,
          author: Array.isArray(a.author) ? a.author[0] : a.author,
          category: Array.isArray(a.category) ? a.category[0] : a.category,
        };
      } catch {
        return { 
          ...a, 
          comments_count: 0,
          author: Array.isArray(a.author) ? a.author[0] : a.author,
          category: Array.isArray(a.category) ? a.category[0] : a.category,
        };
      }
    })
  );
  
  return withCounts ?? [];
}

export async function getMostPopular(limit = 6, days = 7, language: string = 'en') {
  if (!sb) return []

  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)
  if (!analyticsSb) return []
  const { data: viewRows, error: viewError } = await analyticsSb
    .from('article_views_detailed')
    .select('article_id')
    .gte('started_at', dateThreshold.toISOString())
  if (viewError) {
    console.warn('getMostPopular view query unavailable', viewError.message)
    return []
  }

  const viewCounts = new Map<string, number>()
  for (const row of viewRows || []) viewCounts.set(row.article_id, (viewCounts.get(row.article_id) || 0) + 1)
  const articleIds = [...viewCounts.keys()]
  if (!articleIds.length) return []

  const { data, error } = await sb
    .from('articles')
    .select(`id, slug, story_group_id, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ), author:author_id ( id, display_name, avatar_url )`)
    .in('id', articleIds)
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .neq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
  if (error) {
    console.warn('getMostPopular article query unavailable', error.message)
    return []
  }

  const seenGroups = new Set<string>()
  const ranked = (data || [])
    .map((article: any) => ({
      ...article,
      views_count: viewCounts.get(article.id) || 0,
      author: Array.isArray(article.author) ? article.author[0] : article.author,
      category: Array.isArray(article.category) ? article.category[0] : article.category,
    }))
    .sort((a: any, b: any) => b.views_count - a.views_count || new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .filter((article: any) => {
      const groupKey = article.story_group_id || article.id
      if (seenGroups.has(groupKey)) return false
      seenGroups.add(groupKey)
      return true
    })
    .slice(0, limit)

  return Promise.all(ranked.map(async (article: any) => {
    const { count } = await sb.from('comments').select('id', { count: 'exact', head: true }).eq('article_slug', article.slug).eq('status', 'approved')
    return { ...article, comments_count: count ?? 0 }
  }))
}

export async function getMostLiked(limit = 6, language: string = 'en') {
  if (!sb) return []

  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count, likes_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .neq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('likes_count', { ascending: false, nullsFirst: false })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getMostLiked error', error)
    return []
  }

  const base = (data || []).map((a: any) => ({
    ...a,
    author: Array.isArray(a.author) ? a.author[0] : a.author,
    category: Array.isArray(a.category) ? a.category[0] : a.category,
  }))

  const withCounts = await Promise.all(
    (base || []).map(async (a: any) => {
      if (!a?.slug) return { ...a, comments_count: 0 }
      try {
        const { count } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved')
        return {
          ...a,
          comments_count: count ?? 0,
        }
      } catch {
        return {
          ...a,
          comments_count: 0,
        }
      }
    })
  )

  return withCounts ?? []
}

export async function getMostCommented(limit = 6, days = 30, language: string = 'en') {
  if (!sb) return []

  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count, likes_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .neq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .gte('published_at', dateThreshold.toISOString())

  if (error) {
    console.error('getMostCommented error', error)
    return []
  }

  const base = (data || []).map((a: any) => ({
    ...a,
    author: Array.isArray(a.author) ? a.author[0] : a.author,
    category: Array.isArray(a.category) ? a.category[0] : a.category,
  }))

  const withCounts = await Promise.all(
    (base || []).map(async (a: any) => {
      if (!a?.slug) return { ...a, comments_count: 0 }
      try {
        const { count } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved')
        return {
          ...a,
          comments_count: count ?? 0,
        }
      } catch {
        return {
          ...a,
          comments_count: 0,
        }
      }
    })
  )

  // Sort by comments_count desc, then views_count desc, then likes_count desc, then date
  const sorted = (withCounts || []).sort((a: any, b: any) => {
    const ca = Number(a.comments_count) || 0
    const cb = Number(b.comments_count) || 0
    if (cb !== ca) return cb - ca
    const va = Number(a.views_count) || 0
    const vb = Number(b.views_count) || 0
    if (vb !== va) return vb - va
    const la = Number(a.likes_count) || 0
    const lb = Number(b.likes_count) || 0
    if (lb !== la) return lb - la
    const da = a.published_at ? new Date(a.published_at).getTime() : 0
    const db = b.published_at ? new Date(b.published_at).getTime() : 0
    return db - da
  })

  return sorted.slice(0, limit)
}

export async function getLatestVideos(limit = 6, language: string = 'en') {
  if (!sb) return []

  const { data, error } = await sb
    .from('articles')
    .select('id, slug, title, excerpt, featured_image, youtube_link, article_type, published_at, language')
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .eq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getLatestVideos error', error)
    return []
  }
  return data ?? []
}

export async function getLatestArticles(limit = 6, language: string = 'en') {
  if (!sb) return []

  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .neq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('getLatestArticles error', error)
    return []
  }
  
  // Attach approved comments_count per item
  const withCounts = await Promise.all(
    (data || []).map(async (a: any) => {
      if (!a?.slug) return { ...a, comments_count: 0 };
      try {
        const { count } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved');
        return { 
          ...a, 
          comments_count: count ?? 0,
          author: Array.isArray(a.author) ? a.author[0] : a.author,
          category: Array.isArray(a.category) ? a.category[0] : a.category,
        };
      } catch {
        return { 
          ...a, 
          comments_count: 0,
          author: Array.isArray(a.author) ? a.author[0] : a.author,
          category: Array.isArray(a.category) ? a.category[0] : a.category,
        };
      }
    })
  );
  
  return withCounts ?? [];
}


export async function getLatestArticlesOffset(offset = 6, limit = 6, language: string = 'en') {
  if (!sb) return []

  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('language', language === 'rw' ? 'rw' : 'en')
    .eq('status', 'published')
    .neq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('getLatestArticlesOffset error', error)
    return []
  }
  
  // Attach approved comments_count per item
  const withCounts = await Promise.all(
    (data || []).map(async (a: any) => {
      if (!a?.slug) return { ...a, comments_count: 0 };
      try {
        const { count } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved');
        return { 
          ...a, 
          comments_count: count ?? 0,
          author: Array.isArray(a.author) ? a.author[0] : a.author,
          category: Array.isArray(a.category) ? a.category[0] : a.category,
        };
      } catch {
        return { 
          ...a, 
          comments_count: 0,
          author: Array.isArray(a.author) ? a.author[0] : a.author,
          category: Array.isArray(a.category) ? a.category[0] : a.category,
        };
      }
    })
  );
  
  return withCounts ?? [];
}
