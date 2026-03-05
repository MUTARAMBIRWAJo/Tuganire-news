import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sb = createClient(supabaseUrl, anonKey);

export async function getBreaking(limit = 10) {
  let { data, error } = await sb
    .from('v_breaking')
    .select('*')
    .limit(limit);
  if (error) throw error;

  if (!data || data.length === 0) {
    const { data: latest } = await sb
      .from('articles')
      .select(`id, slug, title, excerpt, featured_image, published_at,
        category:category_id ( name, slug )`)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    data = (latest || []).map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      featured_image: a.featured_image,
      published_at: a.published_at,
      category_name: Array.isArray(a.category) ? a.category[0]?.name : a.category?.name,
      category_slug: Array.isArray(a.category) ? a.category[0]?.slug : a.category?.slug,
    }));
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

export async function getFeaturedHero() {
  const { data: initialArticle, error } = await sb
    .from('articles')
    .select('id, slug, title, excerpt, featured_image, published_at, is_featured, is_editor_pick, author_id, category_id')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .or('is_editor_pick.eq.true,is_featured.eq.true')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  let article = initialArticle as any | null;
  if (!article) {
    // fallback to most recent published
    const { data: fallback } = await sb
      .from('articles')
      .select('id, slug, title, excerpt, featured_image, published_at, author_id, category_id')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!fallback) return null;
    article = fallback as any;
  }

  if (!article) return null;

  const [{ data: author }, { data: category }] = await Promise.all([
    article.author_id
      ? sb.from('app_users').select('display_name, avatar_url').eq('id', article.author_id).maybeSingle()
      : Promise.resolve({ data: null } as any),
    article.category_id
      ? sb.from('categories').select('name, slug').eq('id', article.category_id).maybeSingle()
      : Promise.resolve({ data: null } as any)
  ]);

  // Attach comments_count
  let comments_count = 0;
  if (article.slug) {
    try {
      const { count } = await sb
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('article_slug', article.slug)
        .eq('status', 'approved');
      comments_count = count ?? 0;
    } catch {
      comments_count = 0;
    }
  }

  return {
    ...article,
    categories: category,
    authors: author,
    comments_count
  } as any;
}

export async function getTrending(limit = 10) {
  let { data, error } = await sb
    .from('v_trending')
    .select('*')
    .limit(limit);
  if (error) throw error;
  if (!data || data.length === 0) {
    // fallback to latest published
    const { data: latest } = await sb
      .from('articles')
      .select(`id, slug, title, excerpt, featured_image, published_at,
        category:category_id ( name, slug )`)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);
    data = (latest || []).map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt ?? '',
      featured_image: a.featured_image ?? null,
      published_at: a.published_at ?? null,
      views_count: null as number | null,
      category_name: Array.isArray(a.category) ? a.category[0]?.name : a.category?.name,
      category_slug: Array.isArray(a.category) ? a.category[0]?.slug : a.category?.slug,
      author_display_name: null as string | null,
      author_avatar_url: null as string | null,
    }));
  } else {
    // normalize v_trending rows into unified shape expected by UI
    data = (data || []).map((t: any) => ({
      id: t.id ?? t.article_id ?? t.slug ?? Math.random().toString(36).slice(2),
      slug: t.slug ?? t.article_slug ?? t.slug_text ?? '',
      title: t.title ?? t.headline ?? '',
      excerpt: t.excerpt ?? t.summary ?? t.subtitle ?? '',
      featured_image: t.featured_image || t.image_url || t.cover_image || t.image || null,
      published_at: t.published_at ?? t.created_at ?? null,
      views_count: t.views_count ?? t.view_count ?? t.views ?? null,
      category_name: t.category_name ?? t.category?.name ?? null,
      category_slug: t.category_slug ?? t.category?.slug ?? null,
      author_display_name: t.author_display_name ?? t.author?.display_name ?? t.author_name ?? null,
      author_avatar_url: t.author_avatar_url ?? t.author?.avatar_url ?? null,
    }));
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

export async function getLatestByCategoryRows() {
  const { data, error } = await sb
    .from('v_latest4_by_category')
    .select('*');
  if (error) throw error;
  
  // Group by category to ensure proper structure
  const groupedByCategory = (data || []).reduce((acc: any, article: any) => {
    const categoryKey = article.category_slug || 'uncategorized';
    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        category_name: article.category_name || 'Uncategorized',
        category_slug: categoryKey,
        articles: []
      };
    }
    acc[categoryKey].articles.push(article);
    return acc;
  }, {});
  
  // Convert to array and sort by category name
  const categoryRows = Object.values(groupedByCategory).sort((a: any, b: any) => 
    a.category_name.localeCompare(b.category_name)
  );
  
  // Attach approved comments_count per item
  const withCounts = await Promise.all(
    categoryRows.map(async (categoryRow: any) => {
      const articlesWithCounts = await Promise.all(
        (categoryRow.articles || []).map(async (a: any) => {
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
      return {
        ...categoryRow,
        articles: articlesWithCounts
      };
    })
  );
  
  return withCounts ?? [];
}

export async function getPhotoGallery(limit = 8) {
  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, featured_image, published_at, views_count,
      category:category_id ( id, name, slug )
    `)
    .eq('status', 'published')
    .not('featured_image', 'is', null)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
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
  const { data, error } = await sb
    .from('categories')
    .select('id, name, slug')
    .order('name')
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getEditorsPicks(limit = 6) {
  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('status', 'published')
    .eq('is_editor_pick', true)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
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

export async function getMostPopular(limit = 6, days = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .gte('published_at', dateThreshold.toISOString())
    .order('views_count', { ascending: false, nullsFirst: false })
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
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

export async function getMostLiked(limit = 6) {
  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count, likes_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('likes_count', { ascending: false, nullsFirst: false })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error

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

export async function getMostCommented(limit = 6, days = 30) {
  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count, likes_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .gte('published_at', dateThreshold.toISOString())

  if (error) throw error

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

export async function getLatestVideos(limit = 6) {
  const { data, error } = await sb
    .from('articles')
    .select('id, slug, title, excerpt, featured_image, youtube_link, article_type, published_at')
    .eq('status', 'published')
    .eq('article_type', 'video')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function getLatestArticles(limit = 6) {
  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
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


export async function getLatestArticlesOffset(offset = 6, limit = 6) {
  const { data, error } = await sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  
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
