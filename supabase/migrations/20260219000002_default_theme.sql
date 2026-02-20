-- Ensure all restaurants have Modern Minimal as the default theme
UPDATE restaurant_design_config
SET selected_theme_id = (
  SELECT id FROM menu_themes WHERE slug = 'modern-minimal' LIMIT 1
)
WHERE selected_theme_id IS NULL;
