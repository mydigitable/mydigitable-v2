-- ============================================
-- Per-category design fields: change defaults to NULL
-- so new categories inherit the global Design Studio config.
-- Only when the user explicitly configures a category
-- will a non-NULL value be stored.
-- ============================================

-- Change column defaults to NULL
ALTER TABLE menu_categories ALTER COLUMN layout_type SET DEFAULT NULL;
ALTER TABLE menu_categories ALTER COLUMN grid_columns SET DEFAULT NULL;
ALTER TABLE menu_categories ALTER COLUMN show_images SET DEFAULT NULL;
ALTER TABLE menu_categories ALTER COLUMN show_prices SET DEFAULT NULL;
ALTER TABLE menu_categories ALTER COLUMN show_descriptions SET DEFAULT NULL;

-- Reset existing categories that still have default values back to NULL
-- so they inherit the global config
UPDATE menu_categories SET layout_type = NULL WHERE layout_type = 'grid';
UPDATE menu_categories SET grid_columns = NULL WHERE grid_columns = 2;
UPDATE menu_categories SET show_images = NULL WHERE show_images = true;
UPDATE menu_categories SET show_prices = NULL WHERE show_prices = true;
UPDATE menu_categories SET show_descriptions = NULL WHERE show_descriptions = true;
