-- ============================================================================
-- AI SETTINGS - Add AI configuration to restaurants
-- ============================================================================
-- Created: 2026-02-13
-- Description: Add JSONB column for AI feature toggles and API keys
-- ============================================================================

-- Add ai_settings column to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{
  "enabled": false,
  "features": {
    "auto_descriptions": true,
    "allergen_detection": true,
    "extra_suggestions": true,
    "image_generation": false,
    "price_optimization": false,
    "menu_analysis": true
  },
  "openai_api_key": null,
  "usage": {
    "descriptions_count": 0,
    "images_count": 0,
    "last_reset": null
  }
}'::jsonb;

-- Add comment
COMMENT ON COLUMN restaurants.ai_settings IS 'AI feature configuration, API keys (encrypted), and usage tracking';

-- Create index for AI queries
CREATE INDEX IF NOT EXISTS idx_restaurants_ai_settings ON restaurants USING GIN (ai_settings);
