-- 033_security_rls.sql
-- RLS policies for security tables.

begin;

alter table if exists user_security enable row level security;
alter table if exists two_factor_auth enable row level security;
alter table if exists recovery_codes enable row level security;
alter table if exists user_sessions enable row level security;
alter table if exists login_activity enable row level security;
alter table if exists security_notifications enable row level security;

drop policy if exists user_security_owner_or_admin on user_security;
create policy user_security_owner_or_admin on user_security
  for all using (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  ) with check (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  );

drop policy if exists two_factor_auth_owner_or_admin on two_factor_auth;
create policy two_factor_auth_owner_or_admin on two_factor_auth
  for all using (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  ) with check (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  );

drop policy if exists recovery_codes_owner_or_admin on recovery_codes;
create policy recovery_codes_owner_or_admin on recovery_codes
  for all using (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  ) with check (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  );

drop policy if exists user_sessions_owner_or_admin on user_sessions;
create policy user_sessions_owner_or_admin on user_sessions
  for all using (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  ) with check (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  );

drop policy if exists login_activity_owner_or_admin on login_activity;
create policy login_activity_owner_or_admin on login_activity
  for select using (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  );

drop policy if exists security_notifications_owner_or_admin on security_notifications;
create policy security_notifications_owner_or_admin on security_notifications
  for all using (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  ) with check (
    user_id = auth.uid()
    or exists (select 1 from app_users au where au.id = auth.uid() and au.role in ('admin', 'superadmin'))
  );

commit;
