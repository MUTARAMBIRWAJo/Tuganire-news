-- 021_rls_policies.sql
-- Example Row Level Security (RLS) policies for Supabase
-- Review and adapt these policies to your project before applying.

BEGIN;

-- Enable RLS where appropriate
ALTER TABLE IF EXISTS app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriber_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ad_campaigns ENABLE ROW LEVEL SECURITY;

-- app_users: allow users to select/update their own record; allow admins to select/update any
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'app_users_select_self_or_admin'
  ) THEN
    CREATE POLICY app_users_select_self_or_admin ON app_users
      FOR SELECT USING (
        auth.uid() = id OR EXISTS (SELECT 1 FROM app_users au WHERE au.id = auth.uid() AND au.role IN ('admin', 'superadmin'))
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'app_users_update_self_or_admin'
  ) THEN
    CREATE POLICY app_users_update_self_or_admin ON app_users
      FOR UPDATE USING (
        auth.uid() = id OR EXISTS (SELECT 1 FROM app_users au WHERE au.id = auth.uid() AND au.role IN ('admin', 'superadmin'))
      );
  END IF;
END$$;

-- subscriber_metadata: owners or admins can manage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'subscriber_metadata_owner_or_admin') THEN
    CREATE POLICY subscriber_metadata_owner_or_admin ON subscriber_metadata
      FOR ALL USING (
        auth.uid() = user_id OR EXISTS (SELECT 1 FROM app_users au WHERE au.id = auth.uid() AND au.role IN ('admin', 'superadmin'))
      );
  END IF;
END$$;

-- advertisers: advertiser owners or admins
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'advertisers_owner_or_admin') THEN
    CREATE POLICY advertisers_owner_or_admin ON advertisers
      FOR ALL USING (
        auth.uid() = user_id OR EXISTS (SELECT 1 FROM app_users au WHERE au.id = auth.uid() AND au.role IN ('admin', 'superadmin'))
      );
  END IF;
END$$;

-- ad_campaigns: allow advertiser owner (via advertisers table) or admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ad_campaigns_advertiser_or_admin') THEN
    CREATE POLICY ad_campaigns_advertiser_or_admin ON ad_campaigns
      FOR ALL USING (
        EXISTS (SELECT 1 FROM advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM app_users au WHERE au.id = auth.uid() AND au.role IN ('admin', 'superadmin'))
      );
  END IF;
END$$;

COMMIT;

-- IMPORTANT:
-- 1) Test these policies in a staging environment first.
-- 2) The `EXISTS (SELECT 1 FROM app_users au WHERE au.id = auth.uid() AND au.role IN (...))` pattern assumes
--    that you create and maintain the `role` field on `app_users` for every user.
-- 3) Adjust policy granularity (INSERT/UPDATE/DELETE) as needed for stricter controls.
