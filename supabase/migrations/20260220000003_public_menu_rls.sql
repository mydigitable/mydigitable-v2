-- ============================================================
-- PUBLIC READ POLICIES for public menu access
-- ============================================================
-- The public menu page is accessed anonymously (no auth).
-- These policies allow reading design config, themes,
-- and product extras without authentication.
-- ============================================================

-- 1. menu_themes — anyone can read
ALTER TABLE menu_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view themes" ON menu_themes;
CREATE POLICY "Anyone can view themes"
ON menu_themes FOR SELECT
USING (true);

-- 2. restaurant_design_config — anyone can read 
DROP POLICY IF EXISTS "Anyone can view design config" ON restaurant_design_config;
CREATE POLICY "Anyone can view design config"
ON restaurant_design_config FOR SELECT
USING (true);

-- 3. product_extras — anyone can view available extras
DROP POLICY IF EXISTS "Anyone can view available extras" ON product_extras;
CREATE POLICY "Anyone can view available extras"
ON product_extras FOR SELECT
USING (is_available = true);

-- 4. product_extra_groups — anyone can view groups
DROP POLICY IF EXISTS "Anyone can view extra groups" ON product_extra_groups;
CREATE POLICY "Anyone can view extra groups"
ON product_extra_groups FOR SELECT
USING (true);
