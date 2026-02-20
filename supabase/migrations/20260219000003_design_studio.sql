-- ============================================
-- MENU DESIGN STUDIO - Tables & Data
-- Run in Supabase SQL Editor
-- ============================================

-- Tabla de temas predefinidos
CREATE TABLE IF NOT EXISTS menu_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  colors JSONB NOT NULL,
  fonts JSONB NOT NULL,
  layout_type TEXT NOT NULL,
  best_for TEXT[],
  is_premium BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar los 5 temas base
INSERT INTO menu_themes (name, slug, description, colors, fonts, layout_type, best_for, display_order) VALUES
(
  'Modern Minimal',
  'modern-minimal',
  'Diseño limpio y minimalista',
  '{"primary": "#16A34A", "background": "#FAFAF9", "surface": "#FFFFFF", "border": "#E7E5E4", "text": "#1C1917"}',
  '{"heading": "DM Sans", "body": "DM Sans"}',
  'grid',
  ARRAY['cafes', 'brunch', 'healthy', 'modern'],
  1
),
(
  'Classic Bistro',
  'classic-bistro',
  'Elegante y clásico',
  '{"primary": "#1E3A5F", "accent": "#C9A84C", "background": "#FAF8F2", "surface": "#FFFFFF", "border": "#E2D9C5", "text": "#1A1408"}',
  '{"heading": "Playfair Display", "body": "Lato"}',
  'tabs',
  ARRAY['french', 'fine-dining', 'traditional'],
  2
),
(
  'Craft & Bold',
  'craft-bold',
  'Industrial y atrevido',
  '{"primary": "#C2783A", "background": "#1A1815", "surface": "#252220", "border": "#3A3630", "text": "#F5F0E8"}',
  '{"heading": "Bebas Neue", "body": "Barlow"}',
  'list',
  ARRAY['burgers', 'bbq', 'american', 'craft-beer'],
  3
),
(
  'Nordic Clean',
  'nordic-clean',
  'Minimalista escandinavo',
  '{"primary": "#171717", "background": "#FFFFFF", "surface": "#FFFFFF", "border": "#E5E5E5", "text": "#171717"}',
  '{"heading": "Cormorant Garamond", "body": "Outfit"}',
  'photo-grid',
  ARRAY['nordic', 'minimalist', 'healthy'],
  4
),
(
  'Warm Rustic',
  'warm-rustic',
  'Cálido y acogedor',
  '{"primary": "#B45309", "background": "#FEF7EC", "surface": "#FFFDF7", "border": "#E7D9C1", "text": "#3D1F00"}',
  '{"heading": "Libre Baskerville", "body": "Source Sans 3"}',
  'horizontal-cards',
  ARRAY['italian', 'mediterranean', 'homemade'],
  5
);

-- Configuración de diseño personalizada por restaurante
CREATE TABLE IF NOT EXISTS restaurant_design_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE,
  selected_theme_id UUID REFERENCES menu_themes(id),
  custom_colors JSONB,
  layout_type TEXT DEFAULT 'grid',
  grid_columns INTEGER DEFAULT 2,
  card_style TEXT DEFAULT 'elevated',
  spacing TEXT DEFAULT 'normal',
  border_radius INTEGER DEFAULT 12,
  custom_fonts JSONB,
  show_search BOOLEAN DEFAULT true,
  show_categories BOOLEAN DEFAULT true,
  show_images BOOLEAN DEFAULT true,
  show_prices BOOLEAN DEFAULT true,
  show_descriptions BOOLEAN DEFAULT true,
  show_badges BOOLEAN DEFAULT true,
  show_prep_time BOOLEAN DEFAULT false,
  logo_url TEXT,
  show_powered_by BOOLEAN DEFAULT true,
  last_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear configuración por defecto para restaurantes existentes
INSERT INTO restaurant_design_config (restaurant_id, selected_theme_id)
SELECT 
  r.id,
  (SELECT id FROM menu_themes WHERE slug = 'modern-minimal' LIMIT 1)
FROM restaurants r
WHERE r.id NOT IN (SELECT restaurant_id FROM restaurant_design_config);

-- Índices
CREATE INDEX IF NOT EXISTS idx_restaurant_design_restaurant 
ON restaurant_design_config(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_menu_themes_slug 
ON menu_themes(slug);
