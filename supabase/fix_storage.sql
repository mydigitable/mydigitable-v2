-- ==========================================
-- SCRIPT DE CORRECCIÓN (Ejecuta esto en SQL Editor)
-- ==========================================

-- 1. Intentar crear el bucket 'images' (sin tocar permisos de sistema)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurar que la tabla categories tenga la columna image_url
-- (El error anterior indicaba que faltaba esta columna)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Políticas de Seguridad (Simplificadas para evitar error de permisos)

-- Borrar políticas previas si existen para evitar duplicados
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Crear nuevas políticas
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'images' );

CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'images' );

CREATE POLICY "Authenticated Update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'images' );

CREATE POLICY "Authenticated Delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'images' );
