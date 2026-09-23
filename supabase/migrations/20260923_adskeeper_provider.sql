-- Dashboard-managed AdsKeeper site and widget configuration.
ALTER TABLE public.advertising_providers
  ADD COLUMN IF NOT EXISTS adskeeper_site_id text;

CREATE TABLE IF NOT EXISTS public.adskeeper_ad_units (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES public.advertising_providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  widget_id text NOT NULL,
  placement text NOT NULL,
  locale text NOT NULL DEFAULT 'all' CHECK (locale IN ('all', 'en', 'rw')),
  status text NOT NULL DEFAULT 'PAUSED' CHECK (status IN ('ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED')),
  start_date timestamptz,
  end_date timestamptz,
  priority integer NOT NULL DEFAULT 0 CHECK (priority >= 0),
  height_px integer NOT NULL DEFAULT 300 CHECK (height_px BETWEEN 0 AND 1200),
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_adskeeper_units_eligibility
  ON public.adskeeper_ad_units(placement, locale, status, priority DESC, start_date, end_date);

ALTER TABLE public.adskeeper_ad_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage adskeeper units" ON public.adskeeper_ad_units;
CREATE POLICY "Admins manage adskeeper units" ON public.adskeeper_ad_units
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')))
WITH CHECK (EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "Public read eligible adskeeper units" ON public.adskeeper_ad_units;
CREATE POLICY "Public read eligible adskeeper units" ON public.adskeeper_ad_units
FOR SELECT TO anon, authenticated
USING (
  status = 'ACTIVE'
  AND (start_date IS NULL OR start_date <= now())
  AND (end_date IS NULL OR end_date >= now())
  AND EXISTS (SELECT 1 FROM public.advertising_providers WHERE id = provider_id AND provider = 'ADSKEEPER' AND enabled = true AND adskeeper_site_id IS NOT NULL)
);

GRANT SELECT ON public.adskeeper_ad_units TO anon, authenticated;
