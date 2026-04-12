-- ============================================================
-- Migration: Public Profile RLS + Profiles INSERT policy
-- Date: 2026-04-11
-- Description:
--   1. Permite leitura anônima de pets (e suas vacinas/medicações)
--      quando public_profile_enabled = true. Sem isto, a página
--      pública /pet/[token] retorna 404 porque o cliente anon
--      não consegue ler os dados através do RLS padrão.
--   2. Adiciona policy de INSERT no profiles para que o fallback
--      de criação de perfil funcione caso o trigger falhe.
-- ============================================================

-- profiles: permite que o próprio usuário crie seu perfil (fallback do trigger)
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles
  for insert
  with check (auth.uid() = id);

-- pets: leitura pública quando o perfil público está ativado
drop policy if exists "Anyone can view public pets" on pets;
create policy "Anyone can view public pets"
  on pets
  for select
  to anon, authenticated
  using (public_profile_enabled = true);

-- vaccinations: leitura pública quando o pet tem perfil público ativado
drop policy if exists "Anyone can view vaccinations of public pets" on vaccinations;
create policy "Anyone can view vaccinations of public pets"
  on vaccinations
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from pets
      where pets.id = vaccinations.pet_id
        and pets.public_profile_enabled = true
    )
  );

-- medications: leitura pública quando o pet tem perfil público ativado
drop policy if exists "Anyone can view medications of public pets" on medications;
create policy "Anyone can view medications of public pets"
  on medications
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from pets
      where pets.id = medications.pet_id
        and pets.public_profile_enabled = true
    )
  );