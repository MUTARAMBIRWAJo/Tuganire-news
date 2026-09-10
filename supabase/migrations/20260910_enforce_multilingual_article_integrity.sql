-- Finalize the verified multilingual article schema without deleting data.

UPDATE public.articles
SET language = 'en'
WHERE language IS NULL OR btrim(language) = '';

UPDATE public.articles
SET story_group_id = gen_random_uuid()
WHERE story_group_id IS NULL;

ALTER TABLE public.articles
  ALTER COLUMN language SET DEFAULT 'en',
  ALTER COLUMN language SET NOT NULL,
  ALTER COLUMN story_group_id SET NOT NULL;

ALTER TABLE public.articles
  VALIDATE CONSTRAINT articles_language_check;

DROP INDEX IF EXISTS public.idx_articles_story_group_language_unique;

CREATE UNIQUE INDEX idx_articles_story_group_language_unique
  ON public.articles (story_group_id, language);

CREATE INDEX IF NOT EXISTS idx_articles_language_status
  ON public.articles (language, status);

CREATE INDEX IF NOT EXISTS idx_articles_story_group_language_status
  ON public.articles (story_group_id, language, status);

COMMENT ON COLUMN public.articles.language IS 'Language version: en=English, rw=Kinyarwanda. NOT NULL.';
COMMENT ON COLUMN public.articles.story_group_id IS 'Groups language versions of the same logical story. NOT NULL for all articles.';
