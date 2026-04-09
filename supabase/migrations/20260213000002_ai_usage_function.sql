-- ============================================================================
-- AI USAGE TRACKING - Function to increment usage counters
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_ai_usage(
    restaurant_id UUID,
    usage_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE restaurants
    SET ai_settings = jsonb_set(
        ai_settings,
        ARRAY['usage', usage_type],
        to_jsonb(COALESCE((ai_settings->'usage'->>usage_type)::int, 0) + 1)
    )
    WHERE id = restaurant_id;
END;
$$;
