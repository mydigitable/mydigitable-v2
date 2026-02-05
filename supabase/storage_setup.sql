-- ==========================================
-- SCRIPT DE CONFIGURACIÓN DE STORAGE
-- Ejecuta esto en el Editor SQL de Supabase
-- ==========================================

-- 1. Crear el bucket 'images' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar Políticas de Seguridad (RLS)

-- Habilitar RLS en objetos (por si no lo está)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política: Acceso público de lectura (Ver imágenes)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'images' );

-- Política: Usuarios autenticados pueden subir imágenes
CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'images' );

-- Política: Usuarios autenticados pueden actualizar
CREATE POLICY "Authenticated Update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'images' );

-- Política: Usuarios autenticados pueden eliminar
CREATE POLICY "Authenticated Delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'images' );
