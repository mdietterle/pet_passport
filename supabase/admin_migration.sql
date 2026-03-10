-- ============================================================
-- ADMIN MIGRATION — Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add is_admin column to profiles
alter table profiles add column if not exists is_admin boolean default false;

-- 2. Helper function: returns true if the current user is an admin
create or replace function is_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid() limit 1),
    false
  );
$$ language sql security definer stable;

-- 3. Update Plans RLS — admins can write, everyone can read
-- Drop old policies first
drop policy if exists "Anyone can view plans" on plans;
drop policy if exists "Admins can insert plans" on plans;
drop policy if exists "Admins can update plans" on plans;
drop policy if exists "Admins can delete plans" on plans;

create policy "Anyone can view plans"   on plans for select using (true);
create policy "Admins can insert plans" on plans for insert with check (is_admin());
create policy "Admins can update plans" on plans for update using (is_admin());
create policy "Admins can delete plans" on plans for delete using (is_admin());

-- 4. Profiles RLS — admins can read/update everyone, users only themselves
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;

create policy "Users can view own profile"     on profiles for select using (auth.uid() = id or is_admin());
create policy "Users can update own profile"   on profiles for update using (auth.uid() = id);
create policy "Admins can update all profiles" on profiles for update using (is_admin());

-- 5. App config table (used for species and other settings)
create table if not exists app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table app_config enable row level security;
drop policy if exists "Anyone can read config"   on app_config;
drop policy if exists "Admins can write config"  on app_config;
drop policy if exists "Admins can update config" on app_config;
create policy "Anyone can read config"   on app_config for select using (true);
create policy "Admins can write config"  on app_config for insert with check (is_admin());
create policy "Admins can update config" on app_config for update using (is_admin());


-- ============================================================
-- PROMOTE A USER TO ADMIN
-- Replace the email below and run this query:
-- ============================================================
-- update profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'seu-email@admin.com');

