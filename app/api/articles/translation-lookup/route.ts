import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

/**
 * GET /api/articles/translation-lookup
 * Query params:
 * - story_group: UUID of the story group
 * - lang: target language ('en' or 'rw')
 * 
 * Returns the translated article in the target language for the given story group
 * Used by the language switcher to find translated versions of articles
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const storyGroup = searchParams.get('story_group')
  const targetLang = (searchParams.get('lang') || 'en').toLowerCase() === 'rw' ? 'rw' : 'en'

  if (!storyGroup) {
    return NextResponse.json({ error: 'story_group parameter required' }, { status: 400 })
  }

  try {
    const { data, error } = await sb
      .from('articles')
      .select('id, slug, title, language, status, published_at')
      .eq('story_group_id', storyGroup)
      .eq('language', targetLang)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ article: null }, { status: 200 })
    }

    return NextResponse.json({ article: data }, { status: 200 })
  } catch (err: any) {
    console.error('translation lookup error', err)
    return NextResponse.json({ error: 'Translation lookup failed' }, { status: 500 })
  }
}
