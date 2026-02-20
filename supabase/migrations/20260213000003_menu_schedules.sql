-- ============================================================================
-- MENU SCHEDULES - Add schedule support to menus
-- ============================================================================
-- Created: 2026-02-13
-- Description: Add JSONB column to store weekly schedules for menus
-- ============================================================================

-- Add schedule column to menus table
ALTER TABLE menus ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{
  "monday": {"enabled": true, "start": "09:00", "end": "23:00"},
  "tuesday": {"enabled": true, "start": "09:00", "end": "23:00"},
  "wednesday": {"enabled": true, "start": "09:00", "end": "23:00"},
  "thursday": {"enabled": true, "start": "09:00", "end": "23:00"},
  "friday": {"enabled": true, "start": "09:00", "end": "23:00"},
  "saturday": {"enabled": true, "start": "09:00", "end": "23:00"},
  "sunday": {"enabled": true, "start": "09:00", "end": "23:00"}
}'::jsonb;

-- Add comment
COMMENT ON COLUMN menus.schedule IS 'Weekly schedule with enabled/start/end times per day';

-- Create index for schedule queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_menus_schedule ON menus USING GIN (schedule);
