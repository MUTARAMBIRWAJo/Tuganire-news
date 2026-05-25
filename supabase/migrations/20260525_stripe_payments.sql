-- Stripe monetization schema for Tuganire News.
-- This keeps payment history, status tracking, advertiser details, article promotion IDs,
-- and donation records in a single news-friendly audit trail.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_kind') then
    create type payment_kind as enum (
      'donation',
      'sponsored_post',
      'featured_homepage',
      'premium_breaking',
      'article_boost',
      'business_ad',
      'event_promotion',
      'premium_promoted_post'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('created', 'pending', 'completed', 'failed', 'canceled');
  end if;
end $$;

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique,
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  payment_kind payment_kind not null,
  payment_status payment_status not null,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  customer_email text,
  customer_name text,
  article_id text,
  article_title text,
  advertiser_name text,
  advertiser_company text,
  promoted_article_id text,
  duration_days integer,
  homepage_priority boolean not null default false,
  trending_boost boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  event_type text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_event_logs (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  payment_kind payment_kind,
  payment_status payment_status,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists payment_transactions_kind_idx on public.payment_transactions (payment_kind);
create index if not exists payment_transactions_status_idx on public.payment_transactions (payment_status);
create index if not exists payment_transactions_article_idx on public.payment_transactions (article_id);
create index if not exists payment_transactions_advertiser_idx on public.payment_transactions (advertiser_company);
create index if not exists payment_event_logs_type_idx on public.payment_event_logs (event_type);

alter table public.payment_transactions enable row level security;
alter table public.payment_event_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'payment_transactions' and policyname = 'service role manages payment transactions'
  ) then
    create policy "service role manages payment transactions"
      on public.payment_transactions
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'payment_event_logs' and policyname = 'service role manages payment event logs'
  ) then
    create policy "service role manages payment event logs"
      on public.payment_event_logs
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;
