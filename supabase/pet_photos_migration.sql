-- Migration: pet_photos table for premium photo gallery (max 10 per pet)
CREATE TABLE IF NOT EXISTS pet_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by pet
CREATE INDEX idx_pet_photos_pet_id ON pet_photos(pet_id);

-- RLS
ALTER TABLE pet_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet photos"
    ON pet_photos FOR SELECT
    USING (
        pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
    );

CREATE POLICY "Users can insert photos for their own pets"
    ON pet_photos FOR INSERT
    WITH CHECK (
        pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
    );

CREATE POLICY "Users can delete their own pet photos"
    ON pet_photos FOR DELETE
    USING (
        pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
    );

-- Update premium plan features to include photo gallery
UPDATE plans
SET features = '["Pets ilimitados", "Registros ilimitados", "Exportar PDF", "Upload de fotos", "Galeria de fotos (até 10 por pet)", "Lembretes de consultas"]'::jsonb
WHERE name = 'premium';
