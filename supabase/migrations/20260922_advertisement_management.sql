-- Extend the existing advertisements table into a localized, placement-aware campaign model.
ALTER TABLE public.advertisements
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS advertiser_name text,
  ADD COLUMN IF NOT EXISTS advertiser_email text,
  ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT 'HOME_BELOW_BREAKING_NEWS',
  ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS mobile_media_url text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS cta_text_en text,
  ADD COLUMN IF NOT EXISTS title_rw text,
  ADD COLUMN IF NOT EXISTS description_rw text,
  ADD COLUMN IF NOT EXISTS cta_text_rw text;

UPDATE public.advertisements
SET
  slug = COALESCE(slug, regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')),
  title_en = COALESCE(title_en, title),
  description_en = COALESCE(description_en, description),
  status = CASE WHEN is_active THEN 'ACTIVE' ELSE 'PAUSED' END
WHERE slug IS NULL OR title_en IS NULL OR description_en IS NULL OR status IS NULL OR status = 'ACTIVE';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.advertisements'::regclass
      AND conname = 'advertisements_status_check'
  ) THEN
    ALTER TABLE public.advertisements
      ADD CONSTRAINT advertisements_status_check
      CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.advertisements'::regclass
      AND conname = 'advertisements_priority_check'
  ) THEN
    ALTER TABLE public.advertisements
      ADD CONSTRAINT advertisements_priority_check
      CHECK (priority >= 0);
  END IF;
END $$;

-- Slugs are metadata only and legacy titles are not guaranteed to be unique.
CREATE INDEX IF NOT EXISTS idx_advertisements_slug
  ON public.advertisements(slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_advertisements_slot_eligibility
  ON public.advertisements(placement, status, is_active, priority DESC, start_date, end_date);

COMMENT ON COLUMN public.advertisements.placement IS 'Stable placement code from the application advertisement placement registry.';
COMMENT ON COLUMN public.advertisements.status IS 'Workflow status; ACTIVE is eligible when is_active and schedule also allow it.';
COMMENT ON COLUMN public.advertisements.poster_url IS 'Optional poster image for video advertisements.';

CREATE OR REPLACE FUNCTION public.sync_advertisement_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_active = NEW.status = 'ACTIVE';
  IF NEW.end_date IS NOT NULL AND NEW.end_date < now() AND NEW.status = 'ACTIVE' THEN
    NEW.status = 'EXPIRED';
    NEW.is_active = false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_advertisement_status_trigger ON public.advertisements;
CREATE TRIGGER sync_advertisement_status_trigger
  BEFORE INSERT OR UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_advertisement_status();

DROP POLICY IF EXISTS "Public can read active advertisements" ON public.advertisements;
CREATE POLICY "Public can read active advertisements"
ON public.advertisements
FOR SELECT
TO public, anon, authenticated
USING (
  status = 'ACTIVE'
  AND is_active = true
  AND (start_date IS NULL OR start_date <= now())
  AND (end_date IS NULL OR end_date >= now())
);

DROP POLICY IF EXISTS "Authenticated users can read all advertisements" ON public.advertisements;
CREATE POLICY "Authenticated users can read all advertisements"
ON public.advertisements
FOR SELECT
TO authenticated
USING (true);

GRANT SELECT ON public.advertisements TO anon, authenticated, public;
