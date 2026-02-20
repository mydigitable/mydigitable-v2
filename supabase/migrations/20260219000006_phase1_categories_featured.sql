-- ============================================
-- Phase 1: Category-level layout config + Featured products
-- Run in Supabase SQL Editor
-- ============================================

-- Agregar configuración por categoría
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS layout_type TEXT DEFAULT 'grid';
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS grid_columns INTEGER DEFAULT 2;
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS card_style TEXT DEFAULT 'elevated';
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS show_images BOOLEAN DEFAULT true;
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS show_prices BOOLEAN DEFAULT true;
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS show_descriptions BOOLEAN DEFAULT true;

-- Agregar productos destacados
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_badge TEXT; -- 'Popular', 'Nuevo', 'Recomendado'

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured, featured_order) WHERE is_featured = true;
