-- ============================================================
-- Pet Passport - Health Tracking Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PET WEIGHTS
-- ============================================================
create table if not exists pet_weights (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  date date not null default current_date,
  weight_kg numeric(5,2) not null,
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table pet_weights enable row level security;
create policy "Users can view own pet weights" on pet_weights for select
  using (exists (select 1 from pets where pets.id = pet_weights.pet_id and pets.owner_id = auth.uid()));
create policy "Users can insert own pet weights" on pet_weights for insert
  with check (exists (select 1 from pets where pets.id = pet_weights.pet_id and pets.owner_id = auth.uid()));
create policy "Users can update own pet weights" on pet_weights for update
  using (exists (select 1 from pets where pets.id = pet_weights.pet_id and pets.owner_id = auth.uid()));
create policy "Users can delete own pet weights" on pet_weights for delete
  using (exists (select 1 from pets where pets.id = pet_weights.pet_id and pets.owner_id = auth.uid()));


-- ============================================================
-- PARASITE CONTROLS (Flea/Tick, Deworming)
-- ============================================================
create table if not exists parasite_controls (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  type text not null check (type in ('flea_tick', 'deworming')), -- Antipulgas/Carrapatos ou Vermífugo
  date date not null,
  next_due_date date,
  medication_name text not null,
  weight_at_time_kg numeric(5,2),
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table parasite_controls enable row level security;
create policy "Users can view own parasite controls" on parasite_controls for select
  using (exists (select 1 from pets where pets.id = parasite_controls.pet_id and pets.owner_id = auth.uid()));
create policy "Users can insert own parasite controls" on parasite_controls for insert
  with check (exists (select 1 from pets where pets.id = parasite_controls.pet_id and pets.owner_id = auth.uid()));
create policy "Users can update own parasite controls" on parasite_controls for update
  using (exists (select 1 from pets where pets.id = parasite_controls.pet_id and pets.owner_id = auth.uid()));
create policy "Users can delete own parasite controls" on parasite_controls for delete
  using (exists (select 1 from pets where pets.id = parasite_controls.pet_id and pets.owner_id = auth.uid()));


-- ============================================================
-- MEDICATIONS (Active or one-off routines)
-- ============================================================
create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  medication_name text not null,
  dosage text not null,
  frequency text, -- ex: "12/12 horas", "Diário"
  start_date date not null,
  end_date date, -- null if continuous
  active boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table medications enable row level security;
create policy "Users can view own medications" on medications for select
  using (exists (select 1 from pets where pets.id = medications.pet_id and pets.owner_id = auth.uid()));
create policy "Users can insert own medications" on medications for insert
  with check (exists (select 1 from pets where pets.id = medications.pet_id and pets.owner_id = auth.uid()));
create policy "Users can update own medications" on medications for update
  using (exists (select 1 from pets where pets.id = medications.pet_id and pets.owner_id = auth.uid()));
create policy "Users can delete own medications" on medications for delete
  using (exists (select 1 from pets where pets.id = medications.pet_id and pets.owner_id = auth.uid()));
