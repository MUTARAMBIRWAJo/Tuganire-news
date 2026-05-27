-- 032_security_tables.sql
-- Security and authentication support tables for 2FA, sessions, and login activity.

begin;

create table if not exists user_security (
  user_id uuid primary key references app_users(id) on delete cascade,
  email_alerts boolean not null default true,
  password_change_alerts boolean not null default true,
  two_factor_alerts boolean not null default true,
  suspicious_login_alerts boolean not null default true,
  newsletter_alerts boolean not null default true,
  theme_preference text not null default 'system',
  language_preference text not null default 'en',
  avatar_upload_allowed boolean not null default true,
  last_password_change_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists two_factor_auth (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_users(id) on delete cascade,
  secret text not null,
  enabled boolean not null default false,
  backup_codes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  code_hash text not null unique,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  session_token text not null unique,
  device text,
  ip_address inet,
  user_agent text,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists login_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  ip_address inet,
  browser text,
  device text,
  country text,
  user_agent text,
  login_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists security_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  kind text not null,
  title text not null,
  message text not null,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_sessions_user_id_last_active_at on user_sessions(user_id, last_active_at desc);
create index if not exists idx_login_activity_user_id_login_at on login_activity(user_id, login_at desc);
create index if not exists idx_security_notifications_user_id_created_at on security_notifications(user_id, created_at desc);
create index if not exists idx_recovery_codes_user_id on recovery_codes(user_id);

drop trigger if exists set_user_security_updated_at on user_security;
create trigger set_user_security_updated_at
before update on user_security
for each row execute function public.handle_updated_at();

drop trigger if exists set_two_factor_auth_updated_at on two_factor_auth;
create trigger set_two_factor_auth_updated_at
before update on two_factor_auth
for each row execute function public.handle_updated_at();

drop trigger if exists set_user_sessions_updated_at on user_sessions;
create trigger set_user_sessions_updated_at
before update on user_sessions
for each row execute function public.handle_updated_at();

commit;
