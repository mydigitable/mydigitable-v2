-- =============================================
-- TABLAS ADICIONALES: Zonas y Temas
-- =============================================

-- Tabla para zonas con precios diferentes (terraza, interior, playa)
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🏠',
    price_modifier DECIMAL(5,2) DEFAULT 0, -- Porcentaje, ej: 10 = +10%
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Añadir zona a las mesas
ALTER TABLE public.tables 
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;

-- RLS para zonas
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage zones" ON public.zones;
CREATE POLICY "Owners can manage zones"
    ON public.zones FOR ALL
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view active zones" ON public.zones;
CREATE POLICY "Public can view active zones"
    ON public.zones FOR SELECT
    USING (is_active = true);

-- Índice
CREATE INDEX IF NOT EXISTS idx_zones_restaurant ON public.zones(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_zone ON public.tables(zone_id);

-- =============================================
-- TABLA PARA COMPRAS ÚNICAS (Add-ons)
-- =============================================

CREATE TABLE IF NOT EXISTS public.addon_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    addon_type TEXT NOT NULL, -- 'custom_theme', 'vip_support', etc.
    price DECIMAL(10,2) NOT NULL,
    payment_id TEXT, -- Stripe payment ID
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL = no expira (pago único)
    is_active BOOLEAN DEFAULT true
);

-- Añadir campo para tema personalizado desbloqueado
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS custom_theme_purchased BOOLEAN DEFAULT false;

-- RLS
ALTER TABLE public.addon_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view their addons" ON public.addon_purchases;
CREATE POLICY "Owners can view their addons"
    ON public.addon_purchases FOR SELECT
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

-- =============================================
-- ACTUALIZAR TABLA PRODUCTS PARA DIETÉTICOS
-- =============================================

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_vegan BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS spicy_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS calories INTEGER;

-- =============================================
-- MENSAJE DE ÉXITO
-- =============================================

SELECT 'Tablas de zonas, add-ons y campos dietéticos creados correctamente' as message;
