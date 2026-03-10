-- ============================================================
-- DOCUMENTS MIGRATION — Run in Supabase SQL Editor
-- ============================================================

-- Documents table: stores uploaded files linked to vaccinations or consultations
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  reference_type text not null check (reference_type in ('vaccination', 'consultation', 'occurrence', 'other')),
  reference_id uuid,            -- ID of the related vaccination / consultation record
  file_url text not null,       -- Supabase Storage public URL
  file_name text not null,
  file_type text,               -- image/jpeg, image/png, application/pdf, etc.
  ai_extracted_text text,       -- Raw text extracted by AI OCR
  created_at timestamptz default now()
);

alter table documents enable row level security;

drop policy if exists "Users can view own documents" on documents;
drop policy if exists "Users can insert own documents" on documents;
drop policy if exists "Users can delete own documents" on documents;

create policy "Users can view own documents" on documents for select
  using (exists (select 1 from pets where pets.id = documents.pet_id and pets.owner_id = auth.uid()));

create policy "Users can insert own documents" on documents for insert
  with check (exists (select 1 from pets where pets.id = documents.pet_id and pets.owner_id = auth.uid()));

create policy "Users can delete own documents" on documents for delete
  using (exists (select 1 from pets where pets.id = documents.pet_id and pets.owner_id = auth.uid()));

-- ============================================================
-- Supabase Storage Bucket (run in Storage tab or via SQL)
-- ============================================================
-- Create bucket via Supabase Dashboard: Storage → New bucket → Name: "pet-documents"
-- Set as: Private (recommended) or Public
-- Then add these storage policies in Dashboard → Storage → pet-documents → Policies:

-- INSERT: authenticated users can upload to their own folder
-- SELECT: authenticated users can read their own files
-- DELETE: authenticated users can delete their own files

-- Or run these if using service role:
-- insert into storage.buckets (id, name, public) values ('pet-documents', 'pet-documents', false)
-- on conflict do nothing;
