-- ============================================================
-- Migration: Passport Features
-- Date: 2026-03-05
-- Description:
--   1. Adiciona campos de QR Code e perfil público na tabela pets
--   2. Cria tabela exam_attachments para galeria de exames vinculados
--      a consultas veterinárias
-- ============================================================

-- 1. Campos de QR Code e perfil público no pet
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS public_profile_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Garante que todos os pets existentes tenham um qr_token único
UPDATE pets SET qr_token = gen_random_uuid()::text WHERE qr_token IS NULL;

-- 2. Tabela de anexos de exames
CREATE TABLE IF NOT EXISTS exam_attachments (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID        NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  consultation_id UUID       REFERENCES vet_consultations(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  file_url       TEXT        NOT NULL,
  file_type      TEXT        NOT NULL,
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE exam_attachments ENABLE ROW LEVEL SECURITY;

-- Apenas o dono do pet pode ver/criar/editar/excluir seus anexos
CREATE POLICY "Owner can manage exam attachments"
  ON exam_attachments
  FOR ALL
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

-- Acesso público de leitura às consultas (para a página pública do QR Code)
-- A página pública só precisa de dados do pet + vacinas; sem acesso a exam_attachments.
