-- ============================================================================
-- CREATE MENUS TABLE
-- ============================================================================
-- Created: 2026-02-18
-- Description: Creates the 'menus' table for managing multiple menu cards
--              (e.g. "Desayunos", "Carta de Bebidas", "Carta Completa")
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📋',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    -- Schedule fields
    schedule_enabled BOOLEAN DEFAULT false,
    schedule_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    schedule_start_time TEXT,
    schedule_end_time TEXT,
    -- Categories included in this menu
    included_categories UUID[] DEFAULT '{}',
    -- Display configuration
    show_prices BOOLEAN DEFAULT true,
    show_descriptions BOOLEAN DEFAULT true,
    show_images BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Owners can manage their menus
DROP POLICY IF EXISTS "Owners can manage menus" ON public.menus;
CREATE POLICY "Owners can manage menus"
    ON public.menus FOR ALL
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

-- Public can view active menus
DROP POLICY IF EXISTS "Public can view active menus" ON public.menus;
CREATE POLICY "Public can view active menus"
    ON public.menus FOR SELECT
    USING (is_active = true);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_menus_restaurant ON public.menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_active ON public.menus(is_active);
CREATE INDEX IF NOT EXISTS idx_menus_sort ON public.menus(sort_order);

SELECT 'Tabla menus creada correctamente' as message;
