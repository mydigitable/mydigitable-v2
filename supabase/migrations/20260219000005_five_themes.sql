-- ============================================================
-- 5 TEMAS VISUALMENTE DISTINTOS
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Ensure table exists
CREATE TABLE IF NOT EXISTS menu_themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    colors JSONB NOT NULL DEFAULT '{}',
    fonts JSONB NOT NULL DEFAULT '{}',
    header_style TEXT DEFAULT 'simple',
    category_style TEXT DEFAULT 'pills',
    card_shape TEXT DEFAULT 'rounded',
    featured_style TEXT DEFAULT 'none',
    layout_type TEXT DEFAULT 'grid',
    best_for TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 1: Clear FK references BEFORE deleting themes
UPDATE restaurant_design_config SET selected_theme_id = NULL WHERE selected_theme_id IS NOT NULL;

-- Step 2: Now safe to delete old themes
DELETE FROM menu_themes;

-- TEMA 1: MODERN MINIMAL
INSERT INTO menu_themes (name, slug, description, colors, fonts, header_style, category_style, card_shape, featured_style, layout_type, best_for, is_premium, display_order)
VALUES (
    'Modern Minimal', 'modern-minimal',
    'Limpio y fresco. Diseño moderno con tarjetas redondeadas.',
    '{"primary":"#16A34A","accent":"#22C55E","background":"#FAFAF9","surface":"#FFFFFF","border":"#E7E5E4","text":"#1C1917","text_secondary":"#78716C"}'::jsonb,
    '{"heading":"DM Sans","body":"DM Sans"}'::jsonb,
    'simple', 'pills', 'rounded', 'banner', 'grid',
    ARRAY['cafetería','brunch','healthy'], false, 1
);

-- TEMA 2: CLASSIC BISTRO
INSERT INTO menu_themes (name, slug, description, colors, fonts, header_style, category_style, card_shape, featured_style, layout_type, best_for, is_premium, display_order)
VALUES (
    'Classic Bistro', 'classic-bistro',
    'Elegancia clásica. Cabecera oscura con acentos dorados.',
    '{"primary":"#1E3A5F","accent":"#C9A84C","background":"#FAF8F2","surface":"#FFFFFF","border":"#E2D9C5","text":"#1A1408","text_secondary":"#6B5E45"}'::jsonb,
    '{"heading":"Playfair Display","body":"Lato"}'::jsonb,
    'hero', 'tabs', 'sharp', 'dark-banner', 'list',
    ARRAY['bistro','restaurante','wine bar'], false, 2
);

-- TEMA 3: CRAFT & BOLD
INSERT INTO menu_themes (name, slug, description, colors, fonts, header_style, category_style, card_shape, featured_style, layout_type, best_for, is_premium, display_order)
VALUES (
    'Craft & Bold', 'craft-bold',
    'Industrial y audaz. Tema oscuro con acentos cobre.',
    '{"primary":"#C2783A","accent":"#D4956A","background":"#1A1815","surface":"#252220","border":"#3A3630","text":"#F5F0E8","text_secondary":"#B0A898"}'::jsonb,
    '{"heading":"Bebas Neue","body":"Barlow"}'::jsonb,
    'industrial', 'tags', 'square', 'dark-banner', 'list',
    ARRAY['burger','craft beer','bbq','american'], false, 3
);

-- TEMA 4: NORDIC CLEAN
INSERT INTO menu_themes (name, slug, description, colors, fonts, header_style, category_style, card_shape, featured_style, layout_type, best_for, is_premium, display_order)
VALUES (
    'Nordic Clean', 'nordic-clean',
    'Ultra-minimalista. Tipografía delicada con mucho espacio.',
    '{"primary":"#171717","accent":"#A3A3A3","background":"#FFFFFF","surface":"#FFFFFF","border":"#E5E5E5","text":"#171717","text_secondary":"#737373"}'::jsonb,
    '{"heading":"Cormorant Garamond","body":"Outfit"}'::jsonb,
    'editorial', 'underline', 'borderless', 'hero-image', 'photo-grid',
    ARRAY['nordic','brunch','café','fine dining'], false, 4
);

-- TEMA 5: WARM RUSTIC
INSERT INTO menu_themes (name, slug, description, colors, fonts, header_style, category_style, card_shape, featured_style, layout_type, best_for, is_premium, display_order)
VALUES (
    'Warm Rustic', 'warm-rustic',
    'Cálido y acogedor. Tonos tierra con detalles artesanales.',
    '{"primary":"#B45309","accent":"#FEF3C7","background":"#FEF7EC","surface":"#FFFDF7","border":"#E7D9C1","text":"#3D1F00","text_secondary":"#7C4D14"}'::jsonb,
    '{"heading":"Libre Baskerville","body":"Source Sans 3"}'::jsonb,
    'ornamental', 'italic-tags', 'soft', 'ribbon', 'horizontal-cards',
    ARRAY['italiano','rústico','taberna','bodega'], false, 5
);

-- Step 3: Re-assign default theme
UPDATE restaurant_design_config 
SET selected_theme_id = (SELECT id FROM menu_themes WHERE slug = 'modern-minimal' LIMIT 1)
WHERE selected_theme_id IS NULL;
