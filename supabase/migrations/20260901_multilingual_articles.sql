ALTER TABLE IF EXISTS public.articles
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

ALTER TABLE IF EXISTS public.articles
  ADD COLUMN IF NOT EXISTS story_group_id uuid;

UPDATE public.articles
SET language = 'en'
WHERE language IS NULL OR language = '';

ALTER TABLE IF EXISTS public.articles
  ALTER COLUMN language SET DEFAULT 'en';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'articles'
      AND c.conname = 'articles_language_check'
  ) THEN
    ALTER TABLE public.articles
      ADD CONSTRAINT articles_language_check
      CHECK (language IN ('en', 'rw'))
      NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_articles_language
  ON public.articles (language);

CREATE INDEX IF NOT EXISTS idx_articles_story_group_id
  ON public.articles (story_group_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_story_group_language_unique
  ON public.articles (story_group_id, language)
  WHERE story_group_id IS NOT NULL AND language IS NOT NULL;

COMMENT ON COLUMN public.articles.language IS 'Language version of the story: en = English, rw = Kinyarwanda';
COMMENT ON COLUMN public.articles.story_group_id IS 'Groups language versions of the same logical story';
