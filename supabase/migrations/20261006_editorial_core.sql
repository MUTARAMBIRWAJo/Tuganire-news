CREATE TABLE IF NOT EXISTS public.editorial_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('magazine', 'research', 'story', 'history')),
  title text NOT NULL,
  slug text NOT NULL,
  subtitle text,
  summary text,
  body text,
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'rw')),
  author_id uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  featured_image text,
  social_image text,
  seo_title text,
  seo_description text,
  canonical_url text,
  reading_time integer,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  content_priority integer NOT NULL DEFAULT 0,
  issue text,
  edition text,
  research_question text,
  methodology text,
  main_findings text,
  why_it_matters_today text,
  historical_date date,
  historical_month integer,
  historical_day integer,
  historical_year integer,
  historical_location text,
  historical_event text,
  historical_context text,
  what_happened text,
  location text,
  people_subjects text,
  story_context text,
  past_context text,
  what_changed text,
  related_story_ids uuid[] NOT NULL DEFAULT '{}',
  related_article_slugs text[] NOT NULL DEFAULT '{}',
  related_research_ids uuid[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS editorial_content_slug_unique
  ON public.editorial_content (slug);

CREATE INDEX IF NOT EXISTS idx_editorial_content_type
  ON public.editorial_content (content_type);

CREATE INDEX IF NOT EXISTS idx_editorial_content_language
  ON public.editorial_content (language);

CREATE INDEX IF NOT EXISTS idx_editorial_content_status
  ON public.editorial_content (status);

CREATE INDEX IF NOT EXISTS idx_editorial_content_published_at
  ON public.editorial_content (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_editorial_content_historical_date
  ON public.editorial_content (historical_month, historical_day);

CREATE TABLE IF NOT EXISTS public.editorial_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  editorial_content_id uuid NOT NULL REFERENCES public.editorial_content(id) ON DELETE CASCADE,
  source_name text,
  organization text,
  url text,
  publication_date date,
  source_type text NOT NULL DEFAULT 'Other',
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editorial_sources_content_id
  ON public.editorial_sources (editorial_content_id, sort_order);

CREATE TABLE IF NOT EXISTS public.editorial_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  editorial_content_id uuid NOT NULL REFERENCES public.editorial_content(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  storage_path text,
  url text,
  thumbnail_url text,
  caption text,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editorial_media_content_id
  ON public.editorial_media (editorial_content_id, sort_order);

CREATE OR REPLACE FUNCTION public.update_editorial_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS editorial_content_updated_at ON public.editorial_content;
CREATE TRIGGER editorial_content_updated_at
BEFORE UPDATE ON public.editorial_content
FOR EACH ROW
EXECUTE FUNCTION public.update_editorial_updated_at();

ALTER TABLE public.editorial_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Editorial content are readable by all" ON public.editorial_content
FOR SELECT USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Editorial sources are readable by all" ON public.editorial_sources
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Editorial media are readable by all" ON public.editorial_media
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Editors can manage editorial content" ON public.editorial_content
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.app_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('reporter', 'admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('reporter', 'admin', 'superadmin')
  )
);

CREATE POLICY IF NOT EXISTS "Editors can manage editorial sources" ON public.editorial_sources
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.app_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('reporter', 'admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('reporter', 'admin', 'superadmin')
  )
);

CREATE POLICY IF NOT EXISTS "Editors can manage editorial media" ON public.editorial_media
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.app_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('reporter', 'admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('reporter', 'admin', 'superadmin')
  )
);
