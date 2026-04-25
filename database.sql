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

-- Add employer-specific fields to profiles
alter table profiles add column if not exists company_name text;
alter table profiles add column if not exists industry text;
alter table profiles add column if not exists company_description text;

alter table profiles enable row level security;

create policy "profiles_read" on profiles for select using (true);
create policy "profiles_own" on profiles for all using (auth.uid() = id);

-- Create vacancies table
create table if not exists vacancies (
  id uuid primary key default gen_random_uuid(),
  employers_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  salary text not null,
  district text,
  type text,
  urgent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table vacancies enable row level security;

create policy "vacancies_read" on vacancies for select using (true);
create policy "vacancies_employer_insert" on vacancies for insert with check (auth.uid() = employers_id);
create policy "vacancies_employer_update" on vacancies for update using (auth.uid() = employers_id);
create policy "vacancies_employer_delete" on vacancies for delete using (auth.uid() = employers_id);

-- Create applications table
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references vacancies(id) on delete cascade,
  worker_id uuid not null references profiles(id) on delete cascade,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table applications enable row level security;

create policy "applications_worker_select" on applications for select using (
  auth.uid() = worker_id or 
  auth.uid() in (select employers_id from vacancies where vacancies.id = applications.vacancy_id)
);
create policy "applications_worker_insert" on applications for insert with check (auth.uid() = worker_id);
create policy "applications_worker_update" on applications for update using (
  auth.uid() in (select employers_id from vacancies where vacancies.id = applications.vacancy_id)
);

-- Create saved_jobs table for wishlist
create table if not exists saved_jobs (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references profiles(id) on delete cascade,
  vacancy_id uuid not null references vacancies(id) on delete cascade,
  created_at timestamptz default now(),
  unique(worker_id, vacancy_id)
);

alter table saved_jobs enable row level security;

create policy "saved_jobs_user_select" on saved_jobs for select using (auth.uid() = worker_id);
create policy "saved_jobs_user_insert" on saved_jobs for insert with check (auth.uid() = worker_id);
create policy "saved_jobs_user_delete" on saved_jobs for delete using (auth.uid() = worker_id);