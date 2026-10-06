DO $$
DECLARE
  target_table record;
  sensitive_table text;
  sensitive_tables text[] := ARRAY[
    'visitors',
    'sessions',
    'article_views_detailed',
    'tracking_events',
    'article_quality_reports',
    'article_share_events',
    'article_reading_completion',
    'article_internal_link_recommendations'
  ];
  policy_name text := 'require_aal2_for_verified_mfa';
  aal_policy_expression text := $policy$
    array[coalesce((select auth.jwt() ->> 'aal'), 'aal1')] <@ (
      select case
        when exists (
          select 1
          from auth.mfa_factors
          where user_id = (select auth.uid())
            and status = 'verified'
        ) then array['aal2']
        else array['aal1', 'aal2']
      end
    )
  $policy$;
BEGIN
  FOREACH sensitive_table IN ARRAY sensitive_tables
  LOOP
    IF to_regclass(format('public.%I', sensitive_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', sensitive_table);

      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = sensitive_table
          AND policyname = 'deny_direct_sensitive_analytics_access'
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
          'deny_direct_sensitive_analytics_access',
          sensitive_table
        );
      END IF;
    END IF;
  END LOOP;

  FOR target_table IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = target_table.schemaname
        AND tablename = target_table.tablename
        AND policyname = policy_name
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I.%I AS RESTRICTIVE FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
        policy_name,
        target_table.schemaname,
        target_table.tablename,
        aal_policy_expression,
        aal_policy_expression
      );
    END IF;
  END LOOP;
END;
$$;