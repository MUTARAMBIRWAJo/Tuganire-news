-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Updated to use simpler user_role enum and app_users table
create type user_role as enum ('public','subscriber','advertiser','supporter','reporter','admin','superadmin');

-- Renamed profiles to app_users with simplified structure
create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role user_role default 'public',
  created_at timestamptz default now()
);

-- Categories table
create table if not exists public.categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique
);

-- Tags table
create table if not exists public.tags (
  id serial primary key,
  name text not null unique
);

-- Simplified articles table with text status field
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  status text not null default 'draft',
  author_id uuid references public.app_users(id) on delete set null,
  category_id int references public.categories(id),
  featured_image text,
  reading_time int,
  is_featured boolean default false,
  views_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

-- Article tags junction table
create table if not exists public.article_tags (
  article_id uuid references public.articles(id) on delete cascade,
  tag_id int references public.tags(id) on delete cascade,
  primary key(article_id, tag_id)
);

-- Simplified subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  confirmed boolean default false,
  created_at timestamptz default now()
);

-- Simplified newsletters table
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  status text default 'draft',
  scheduled_at timestamptz,
  created_by uuid references public.app_users(id),
  created_at timestamptz default now()
);

-- Simplified audits table
create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  table_name text,
  row_id text,
  action text,
  changed_by uuid references public.app_users(id),
  diff jsonb,
  created_at timestamptz default now()
);

-- Create indexes for better performance
create index if not exists idx_articles_author on public.articles(author_id);
create index if not exists idx_articles_category on public.articles(category_id);
create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_published_at on public.articles(published_at desc);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at trigger
create trigger set_updated_at before update on public.articles
  for each row execute function public.handle_updated_at();
