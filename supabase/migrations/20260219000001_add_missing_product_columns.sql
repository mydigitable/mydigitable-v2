-- ============================================
-- ADD MISSING COLUMNS TO PRODUCTS TABLE
-- Run in Supabase SQL Editor
-- ============================================

-- Base columns that might be missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_es TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Array/JSON columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS allergens TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS extras JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';

-- AI-related columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_generated_description BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_generated_image_url TEXT;

-- Time & display columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_prep_time BOOLEAN DEFAULT false;
