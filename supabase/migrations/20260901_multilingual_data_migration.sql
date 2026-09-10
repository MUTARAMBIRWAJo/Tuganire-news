-- Data migration for multilingual articles
-- Safely populates story_group_id for existing articles

-- Step 1: Ensure language column is NOT NULL with default
ALTER TABLE public.articles
  ALTER COLUMN language SET NOT NULL,
  ALTER COLUMN language SET DEFAULT 'en';

-- Step 2: For existing articles without story_group_id, assign each a unique group
-- This ensures each article becomes the initial version of its own story group
UPDATE public.articles
SET story_group_id = gen_random_uuid()
WHERE story_group_id IS NULL;

-- Step 3: Ensure story_group_id is NOT NULL for consistency
ALTER TABLE public.articles
  ALTER COLUMN story_group_id SET NOT NULL;

-- Step 4: Create composite unique index on (story_group_id, language)
-- This enforces that same story group cannot have duplicate languages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'articles'
      AND indexname = 'idx_articles_story_group_language_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_articles_story_group_language_unique
      ON public.articles (story_group_id, language);
  END IF;
END $$;

-- Step 5: Validate the check constraint
ALTER TABLE public.articles
  VALIDATE CONSTRAINT articles_language_check;

-- Step 6: Add helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_language_status
  ON public.articles (language, status);

CREATE INDEX IF NOT EXISTS idx_articles_story_group_language_status
  ON public.articles (story_group_id, language, status);

-- Step 7: Update comments
COMMENT ON TABLE public.articles IS 'Multilingual articles with story grouping support';
COMMENT ON COLUMN public.articles.language IS 'Language version: en=English, rw=Kinyarwanda. NOT NULL.';
COMMENT ON COLUMN public.articles.story_group_id IS 'Groups language versions of the same logical story. NOT NULL for all articles.';
