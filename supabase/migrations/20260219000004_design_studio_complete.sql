-- ============================================================
-- DESIGN STUDIO: Ensure all required columns exist
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. restaurant_design_config — layout fields
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='layout_type') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN layout_type TEXT DEFAULT 'grid';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='grid_columns') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN grid_columns INTEGER DEFAULT 2;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='card_style') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN card_style TEXT DEFAULT 'elevated';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='spacing') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN spacing TEXT DEFAULT 'normal';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='border_radius') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN border_radius INTEGER DEFAULT 12;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_search') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_search BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_categories') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_categories BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_images') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_images BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_prices') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_prices BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_descriptions') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_descriptions BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_badges') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_badges BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_allergens') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_allergens BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_logo') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_logo BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_powered_by') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_powered_by BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='show_prep_time') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN show_prep_time BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurant_design_config' AND column_name='last_published_at') THEN
    ALTER TABLE restaurant_design_config ADD COLUMN last_published_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. menu_categories — per-category layout config
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_categories' AND column_name='layout_type') THEN
    ALTER TABLE menu_categories ADD COLUMN layout_type TEXT DEFAULT 'grid';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_categories' AND column_name='grid_columns') THEN
    ALTER TABLE menu_categories ADD COLUMN grid_columns INTEGER DEFAULT 2;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_categories' AND column_name='show_images') THEN
    ALTER TABLE menu_categories ADD COLUMN show_images BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_categories' AND column_name='show_prices') THEN
    ALTER TABLE menu_categories ADD COLUMN show_prices BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_categories' AND column_name='show_descriptions') THEN
    ALTER TABLE menu_categories ADD COLUMN show_descriptions BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 3. products — featured fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_featured') THEN
    ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='featured_order') THEN
    ALTER TABLE products ADD COLUMN featured_order INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='featured_badge') THEN
    ALTER TABLE products ADD COLUMN featured_badge TEXT;
  END IF;
END $$;

-- 4. Performance indices
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(restaurant_id, is_featured, featured_order) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_layout ON menu_categories(menu_id, layout_type);
