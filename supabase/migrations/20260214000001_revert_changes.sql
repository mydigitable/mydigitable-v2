-- =====================================================
-- REVERTIR MIGRACIONES DEL 2026-02-14
-- =====================================================
-- Este script elimina los cambios aplicados hoy en Supabase Cloud
-- para restaurar el esquema anterior

-- 1. Eliminar tabla product_assignments (creada hoy)
DROP TABLE IF EXISTS product_assignments CASCADE;

-- 2. Eliminar columnas agregadas a products
ALTER TABLE products DROP COLUMN IF EXISTS notes;
ALTER TABLE products DROP COLUMN IF EXISTS is_featured;

-- Verificación: Listar tablas para confirmar
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'product%'
ORDER BY table_name;
