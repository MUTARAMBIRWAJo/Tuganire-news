-- 031_rls_policies.sql
-- Example RLS policies for saved_articles, reading_history, likes, and subscriptions

begin;

-- Enable RLS
alter table if exists saved_articles enable row level security;
alter table if exists reading_history enable row level security;
alter table if exists likes enable row level security;
alter table if exists subscriptions enable row level security;

-- Policy: app users can select/insert/delete their own saved articles
create policy if not exists "saved_articles_only_owner" on saved_articles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Policy: reading history only owned by user
create policy if not exists "reading_history_only_owner" on reading_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Policy: likes only owned by user
create policy if not exists "likes_only_owner" on likes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Policy: subscriptions only visible to the user and admins
create policy if not exists "subscriptions_owner_or_admin" on subscriptions
  for select using (user_id = auth.uid() OR exists (select 1 from app_users where id = auth.uid() and role in ('admin','superadmin')));

commit;
