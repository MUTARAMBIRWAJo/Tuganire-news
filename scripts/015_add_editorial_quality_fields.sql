-- Additive-only editorial quality support tables.
-- This migration does NOT alter existing tables.

-- Stores point-in-time AI/editorial analysis results for an article.
create table if not exists public.article_quality_reports (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  seo_score integer,
  content_score integer,
  readability_score integer,
  originality_score integer,
  keyword_density_score integer,
  adsense_ready boolean default false,
  publish_ready boolean default false,
  warnings jsonb default '[]'::jsonb,
  suggestions jsonb default '[]'::jsonb,
  report jsonb default '{}'::jsonb,
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_article_quality_reports_article_id
  on public.article_quality_reports(article_id, created_at desc);

create index if not exists idx_article_quality_reports_publish_ready
  on public.article_quality_reports(publish_ready, created_at desc);

-- Stores share events so trending can incorporate social activity without
-- modifying the existing articles table.
create table if not exists public.article_share_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  visitor_id uuid references public.visitors(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  platform text,
  path text,
  referrer text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_article_share_events_article_id
  on public.article_share_events(article_id, created_at desc);

create index if not exists idx_article_share_events_platform
  on public.article_share_events(platform, created_at desc);

-- Stores reading completion analytics separately from the existing detailed
-- view table to avoid touching current tracking structures.
create table if not exists public.article_reading_completion (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  visitor_id uuid references public.visitors(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  completion_percent numeric(5,2),
  completed boolean default false,
  time_spent_seconds integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_article_reading_completion_article_id
  on public.article_reading_completion(article_id, created_at desc);

create index if not exists idx_article_reading_completion_completed
  on public.article_reading_completion(completed, created_at desc);

-- Optional cache table for internal-link recommendations generated during
-- editorial review. Safe to ignore if the app only uses live recommendations.
create table if not exists public.article_internal_link_recommendations (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  recommended_article_id uuid not null references public.articles(id) on delete cascade,
  relevance_score numeric(6,2),
  source text default 'keyword-match',
  created_at timestamptz not null default now(),
  unique(article_id, recommended_article_id)
);

create index if not exists idx_article_internal_link_recommendations_article_id
  on public.article_internal_link_recommendations(article_id, relevance_score desc);
