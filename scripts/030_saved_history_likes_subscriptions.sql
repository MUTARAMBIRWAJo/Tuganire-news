-- 030_saved_history_likes_subscriptions.sql
-- Create tables for saved articles, reading history, likes, and subscriptions

begin;

-- saved_articles
create table if not exists saved_articles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  created_at timestamptz default now()
);

-- reading_history
create table if not exists reading_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  visited_at timestamptz default now()
);

-- likes
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  created_at timestamptz default now()
);

-- subscriptions (simple subscriptions table; ties user -> plan)
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  stripe_subscription_id text,
  plan_id text,
  status text,
  started_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now()
);

commit;
