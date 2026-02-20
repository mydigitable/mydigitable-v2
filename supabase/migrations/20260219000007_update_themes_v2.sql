-- ============================================
-- UPDATE MENU THEMES - Add structural metadata
-- and make each theme visually unique
-- Run in Supabase SQL Editor
-- ============================================

-- Add new structural columns to menu_themes
ALTER TABLE menu_themes ADD COLUMN IF NOT EXISTS header_style TEXT DEFAULT 'simple';
ALTER TABLE menu_themes ADD COLUMN IF NOT EXISTS category_style TEXT DEFAULT 'pills';
ALTER TABLE menu_themes ADD COLUMN IF NOT EXISTS card_shape TEXT DEFAULT 'rounded';
ALTER TABLE menu_themes ADD COLUMN IF NOT EXISTS featured_style TEXT DEFAULT 'none';

-- Add show_allergens and show_logo to restaurant_design_config
ALTER TABLE restaurant_design_config ADD COLUMN IF NOT EXISTS show_allergens BOOLEAN DEFAULT true;
ALTER TABLE restaurant_design_config ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT true;

-- ============================================
-- STEP 1: Remove FK references so we can delete themes
-- ============================================
UPDATE restaurant_design_config SET selected_theme_id = NULL;

-- ============================================
-- STEP 2: Delete old themes and re-insert with rich data
-- ============================================
DELETE FROM menu_themes;

INSERT INTO menu_themes (name, slug, description, colors, fonts, layout_type, header_style, category_style, card_shape, featured_style, best_for, display_order) VALUES
(
  'Modern Minimal',
  'modern-minimal',
  'Diseño limpio y contemporáneo. Perfecto para cafeterías, brunch spots y restaurantes healthy. Líneas limpias, colores frescos y tipografía moderna.',
  '{"primary": "#16A34A", "accent": "#10B981", "background": "#FAFAF9", "surface": "#FFFFFF", "border": "#E7E5E4", "text": "#1C1917", "text_secondary": "#78716C"}',
  '{"heading": "DM Sans", "body": "DM Sans"}',
  'grid',
  'simple',
  'pills',
  'rounded',
  'none',
  ARRAY['cafeterías', 'brunch', 'healthy', 'moderno'],
  1
),
(
  'Classic Bistro',
  'classic-bistro',
  'Elegancia clásica con toques dorados. Ideal para bistrós, restaurantes franceses y fine dining. Tipografía serif, cabecera de lujo y presentación refinada.',
  '{"primary": "#1E3A5F", "accent": "#C9A84C", "background": "#FAF8F2", "surface": "#FFFFFF", "border": "#E2D9C5", "text": "#1A1408", "text_secondary": "#6B5E45"}',
  '{"heading": "Playfair Display", "body": "Lato"}',
  'list',
  'hero',
  'tabs',
  'sharp',
  'dark-banner',
  ARRAY['bistrós', 'francés', 'fine dining', 'clásico'],
  2
),
(
  'Craft & Bold',
  'craft-bold',
  'Industrial y atrevido con modo oscuro. Perfecto para hamburguesas, BBQ, cervecerías artesanales. Tipografía bold condensada, diseño angular y colores cálidos de cobre.',
  '{"primary": "#C2783A", "accent": "#D4956A", "background": "#1A1815", "surface": "#252220", "border": "#3A3630", "text": "#F5F0E8", "text_secondary": "#B0A898"}',
  '{"heading": "Bebas Neue", "body": "Barlow"}',
  'list',
  'industrial',
  'tags',
  'square',
  'dark-banner',
  ARRAY['burgers', 'BBQ', 'cervecería', 'american'],
  3
),
(
  'Nordic Clean',
  'nordic-clean',
  'Minimalismo escandinavo en su máxima expresión. Para restaurantes de autor, brunch spots nórdicos y cocina de mercado. Fotos grandes, tipografía editorial y espacios limpios.',
  '{"primary": "#171717", "accent": "#404040", "background": "#FFFFFF", "surface": "#FFFFFF", "border": "#E5E5E5", "text": "#171717", "text_secondary": "#737373"}',
  '{"heading": "Cormorant Garamond", "body": "Outfit"}',
  'photo-grid',
  'editorial',
  'underline',
  'borderless',
  'hero-image',
  ARRAY['nórdico', 'minimalista', 'autor', 'brunch'],
  4
),
(
  'Warm Rustic',
  'warm-rustic',
  'Calidez artesanal con toques rústicos. Ideal para cocina italiana, mediterránea y casera. Decoraciones ornamentales, colores terrosos y tipografía con personalidad.',
  '{"primary": "#B45309", "accent": "#D97706", "background": "#FEF7EC", "surface": "#FFFDF7", "border": "#E7D9C1", "text": "#3D1F00", "text_secondary": "#7C4D14"}',
  '{"heading": "Libre Baskerville", "body": "Source Sans 3"}',
  'horizontal-cards',
  'ornamental',
  'italic-tags',
  'soft',
  'ribbon',
  ARRAY['italiano', 'mediterráneo', 'casero', 'trattoria'],
  5
);

-- ============================================
-- STEP 3: Re-link existing configs to Modern Minimal
-- ============================================
UPDATE restaurant_design_config
SET selected_theme_id = (SELECT id FROM menu_themes WHERE slug = 'modern-minimal' LIMIT 1)
WHERE selected_theme_id IS NULL;
