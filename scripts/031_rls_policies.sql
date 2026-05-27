-- 031_rls_policies.sql
-- Example RLS policies for saved_articles, reading_history, likes, and subscriptions

begin;

-- Enable RLS
alter table if exists saved_articles enable row level security;
alter table if exists reading_history enable row level security;
alter table if exists likes enable row level security;
alter table if exists subscriptions enable row level security;

drop policy if exists "saved_articles_only_owner" on saved_articles;
create policy "saved_articles_only_owner" on saved_articles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "reading_history_only_owner" on reading_history;
create policy "reading_history_only_owner" on reading_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "likes_only_owner" on likes;
create policy "likes_only_owner" on likes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "subscriptions_owner_or_admin" on subscriptions;
create policy "subscriptions_owner_or_admin" on subscriptions
  for select using (user_id = auth.uid() OR exists (select 1 from app_users where id = auth.uid() and role in ('admin','superadmin')));

commit;
