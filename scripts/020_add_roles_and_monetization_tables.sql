-- 020_add_roles_and_monetization_tables.sql
-- Adds role enum and columns + basic advertiser/subscriber tables and placeholders for RLS

BEGIN;

-- Create a user role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('public', 'subscriber', 'advertiser', 'supporter', 'reporter', 'admin', 'superadmin');
  END IF;
END$$;

-- Add role column to app_users (or profiles) with default 'public'
ALTER TABLE IF EXISTS app_users
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'public' NOT NULL;

-- Subscriber metadata
CREATE TABLE IF NOT EXISTS subscriber_metadata (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_tier text,
  created_at timestamptz default now()
);

-- Advertisers / Campaigns
CREATE TABLE IF NOT EXISTS advertisers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  company_name text,
  contact_email text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid references advertisers(id) on delete cascade,
  name text,
  budget numeric default 0,
  start_date date,
  end_date date,
  status text default 'draft',
  created_at timestamptz default now()
);

-- Simple sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid primary key default gen_random_uuid(),
  name text,
  website text,
  contact_email text,
  created_at timestamptz default now()
);

COMMIT;

-- NOTE: Add RLS policies appropriate for your Supabase project after review.
