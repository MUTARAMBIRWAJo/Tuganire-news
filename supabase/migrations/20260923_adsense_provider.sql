-- Provider configuration for Google AdSense manual units.
CREATE TABLE IF NOT EXISTS public.advertising_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL CHECK (provider IN ('GOOGLE_ADSENSE')),
  mode text NOT NULL DEFAULT 'MANUAL_UNITS' CHECK (mode IN ('AUTO_ADS', 'MANUAL_UNITS')),
  publisher_id text,
  enabled boolean NOT NULL DEFAULT false,
  site_status text NOT NULL DEFAULT 'UNKNOWN' CHECK (site_status IN ('UNKNOWN', 'NOT_VERIFIED', 'UNDER_REVIEW', 'READY')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_advertising_providers_provider
  ON public.advertising_providers(provider);

CREATE TABLE IF NOT EXISTS public.adsense_ad_units (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES public.advertising_providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  ad_slot text NOT NULL,
  ad_format text NOT NULL DEFAULT 'auto' CHECK (ad_format IN ('auto', 'fluid', 'rectangle', 'vertical', 'horizontal')),
  placement text NOT NULL,
  locale text NOT NULL DEFAULT 'all' CHECK (locale IN ('all', 'en', 'rw')),
  status text NOT NULL DEFAULT 'PAUSED' CHECK (status IN ('ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED')),
  responsive boolean NOT NULL DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  priority integer NOT NULL DEFAULT 0 CHECK (priority >= 0),
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_adsense_units_eligibility
  ON public.adsense_ad_units(placement, locale, status, priority DESC, start_date, end_date);

ALTER TABLE public.advertising_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adsense_ad_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage advertising providers" ON public.advertising_providers;
CREATE POLICY "Admins manage advertising providers" ON public.advertising_providers
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')))
WITH CHECK (EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "Admins manage adsense units" ON public.adsense_ad_units;
CREATE POLICY "Admins manage adsense units" ON public.adsense_ad_units
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')))
WITH CHECK (EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "Public read eligible adsense units" ON public.adsense_ad_units;
CREATE POLICY "Public read eligible adsense units" ON public.adsense_ad_units
FOR SELECT TO anon, authenticated
USING (
  status = 'ACTIVE'
  AND (start_date IS NULL OR start_date <= now())
  AND (end_date IS NULL OR end_date >= now())
  AND EXISTS (SELECT 1 FROM public.advertising_providers WHERE id = provider_id AND provider = 'GOOGLE_ADSENSE' AND enabled = true AND mode = 'MANUAL_UNITS' AND publisher_id IS NOT NULL)
);

GRANT SELECT ON public.adsense_ad_units TO anon, authenticated;
