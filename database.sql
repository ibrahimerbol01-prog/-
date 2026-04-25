-- Run this SQL before everything:

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age integer,
  iin text unique,
  phone text,
  avatar_url text,
  telegram_id bigint unique,
  telegram_username text,
  role text default 'worker', -- 'worker' or 'employers'
  skills text[] default '{}',
  experience boolean default false,
  experience_text text,
  bio text,
  portfolio_url text,
  portfolio_items jsonb default '[]',
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  link_code text unique
);

alter table profiles enable row level security;

create policy "profiles_read" on profiles for select using (true);
create policy "profiles_own" on profiles for all using (auth.uid() = id);

-- Assuming vacancies and applications tables exist, add columns:
-- alter table vacancies add column if not exists employers_id uuid references profiles(id);
-- alter table applications add column if not exists worker_id uuid references profiles(id);
-- alter table workers add column if not exists profile_id uuid references profiles(id);