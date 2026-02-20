-- ============================================
-- General settings: add header_subtitle and show_header
-- ============================================
ALTER TABLE restaurant_design_config ADD COLUMN IF NOT EXISTS header_subtitle TEXT DEFAULT '';
ALTER TABLE restaurant_design_config ADD COLUMN IF NOT EXISTS show_header BOOLEAN DEFAULT true;
