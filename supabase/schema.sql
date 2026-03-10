-- ============================================================
-- Pet Passport - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PLANS
-- ============================================================
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  price_brl numeric(10,2) not null default 0,
  stripe_price_id text,
  max_pets int,                         -- null = unlimited
  max_vaccinations_per_pet int,         -- null = unlimited
  max_consultations_per_pet int,        -- null = unlimited
  max_occurrences_per_pet int,          -- null = unlimited
  features jsonb default '[]'::jsonb,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Seed plans
insert into plans (name, display_name, price_brl, max_pets, max_vaccinations_per_pet, max_consultations_per_pet, max_occurrences_per_pet, features, sort_order)
values
  ('free', 'Gratuito', 0, 1, 5, 5, 10, '["1 pet", "5 vacinas por pet", "5 consultas por pet", "10 ocorrências por pet"]'::jsonb, 0),
  ('basic', 'Básico', 9.90, 3, null, 20, 50, '["3 pets", "Vacinas ilimitadas", "20 consultas por pet", "50 ocorrências por pet"]'::jsonb, 1),
  ('pro', 'Pro', 15.00, 5, 50, 50, 50, '["5 pets", "50 registros por tipo por pet", "Suporte prioritário"]'::jsonb, 2),
  ('premium', 'Premium', 24.90, null, null, null, null, '["Pets ilimitados", "Registros ilimitados", "Exportar PDF", "Upload de fotos", "Lembretes de consultas"]'::jsonb, 3)
on conflict (name) do nothing;

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  plan_id uuid references plans(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
declare
  free_plan_id uuid;
begin
  select id into free_plan_id from plans where name = 'free' limit 1;
  insert into profiles (id, full_name, plan_id)
  values (new.id, new.raw_user_meta_data->>'full_name', free_plan_id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- PETS
-- ============================================================
create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  species text not null,   -- dog | cat | bird | rabbit | other
  breed text,
  birth_date date,
  sex text,                -- male | female | unknown
  weight_kg numeric(5,2),
  photo_url text,
  microchip text,
  color text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- VACCINATIONS
-- ============================================================
create table if not exists vaccinations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  vaccine_name text not null,
  date date not null,
  next_due_date date,
  vet_name text,
  clinic text,
  batch text,
  manufacturer text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- VET CONSULTATIONS
-- ============================================================
create table if not exists vet_consultations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  date date not null,
  vet_name text,
  clinic text,
  reason text not null,
  diagnosis text,
  prescription text,
  cost_brl numeric(10,2),
  follow_up_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- OCCURRENCES
-- ============================================================
create table if not exists occurrences (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  type text not null,      -- food_purchase | grooming | bath | vomit | diarrhea | injury | medication | other
  date date not null,
  description text,
  cost_brl numeric(10,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table profiles enable row level security;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Plans (public read)
alter table plans enable row level security;
drop policy if exists "Anyone can view plans" on plans;
create policy "Anyone can view plans" on plans for select using (true);

-- Pets
alter table pets enable row level security;
drop policy if exists "Users can view own pets" on pets;
drop policy if exists "Users can insert own pets" on pets;
drop policy if exists "Users can update own pets" on pets;
drop policy if exists "Users can delete own pets" on pets;
create policy "Users can view own pets"   on pets for select using (auth.uid() = owner_id);
create policy "Users can insert own pets" on pets for insert with check (auth.uid() = owner_id);
create policy "Users can update own pets" on pets for update using (auth.uid() = owner_id);
create policy "Users can delete own pets" on pets for delete using (auth.uid() = owner_id);

-- Vaccinations
alter table vaccinations enable row level security;
drop policy if exists "Users can view own vaccinations" on vaccinations;
drop policy if exists "Users can insert own vaccinations" on vaccinations;
drop policy if exists "Users can update own vaccinations" on vaccinations;
drop policy if exists "Users can delete own vaccinations" on vaccinations;
create policy "Users can view own vaccinations" on vaccinations for select
  using (exists (select 1 from pets where pets.id = vaccinations.pet_id and pets.owner_id = auth.uid()));
create policy "Users can insert own vaccinations" on vaccinations for insert
  with check (exists (select 1 from pets where pets.id = vaccinations.pet_id and pets.owner_id = auth.uid()));
create policy "Users can update own vaccinations" on vaccinations for update
  using (exists (select 1 from pets where pets.id = vaccinations.pet_id and pets.owner_id = auth.uid()));
create policy "Users can delete own vaccinations" on vaccinations for delete
  using (exists (select 1 from pets where pets.id = vaccinations.pet_id and pets.owner_id = auth.uid()));

-- Vet Consultations
alter table vet_consultations enable row level security;
drop policy if exists "Users can view own consultations" on vet_consultations;
drop policy if exists "Users can insert own consultations" on vet_consultations;
drop policy if exists "Users can update own consultations" on vet_consultations;
drop policy if exists "Users can delete own consultations" on vet_consultations;
create policy "Users can view own consultations" on vet_consultations for select
  using (exists (select 1 from pets where pets.id = vet_consultations.pet_id and pets.owner_id = auth.uid()));
create policy "Users can insert own consultations" on vet_consultations for insert
  with check (exists (select 1 from pets where pets.id = vet_consultations.pet_id and pets.owner_id = auth.uid()));
create policy "Users can update own consultations" on vet_consultations for update
  using (exists (select 1 from pets where pets.id = vet_consultations.pet_id and pets.owner_id = auth.uid()));
create policy "Users can delete own consultations" on vet_consultations for delete
  using (exists (select 1 from pets where pets.id = vet_consultations.pet_id and pets.owner_id = auth.uid()));

-- Occurrences
alter table occurrences enable row level security;
drop policy if exists "Users can view own occurrences" on occurrences;
drop policy if exists "Users can insert own occurrences" on occurrences;
drop policy if exists "Users can update own occurrences" on occurrences;
drop policy if exists "Users can delete own occurrences" on occurrences;
create policy "Users can view own occurrences" on occurrences for select
  using (exists (select 1 from pets where pets.id = occurrences.pet_id and pets.owner_id = auth.uid()));
create policy "Users can insert own occurrences" on occurrences for insert
  with check (exists (select 1 from pets where pets.id = occurrences.pet_id and pets.owner_id = auth.uid()));
create policy "Users can update own occurrences" on occurrences for update
  using (exists (select 1 from pets where pets.id = occurrences.pet_id and pets.owner_id = auth.uid()));
create policy "Users can delete own occurrences" on occurrences for delete
  using (exists (select 1 from pets where pets.id = occurrences.pet_id and pets.owner_id = auth.uid()));

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Pet counts per owner
create or replace view pet_record_counts as
select
  p.id as pet_id,
  p.owner_id,
  count(distinct v.id) as vaccination_count,
  count(distinct c.id) as consultation_count,
  count(distinct o.id) as occurrence_count
from pets p
left join vaccinations v on v.pet_id = p.id
left join vet_consultations c on c.pet_id = p.id
left join occurrences o on o.pet_id = p.id
group by p.id, p.owner_id;


