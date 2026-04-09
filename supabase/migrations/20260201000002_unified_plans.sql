-- ====================================
-- MIGRACIÓN DE PLANES UNIFICADO
-- MyDigitable - Sistema de Planes v2
-- ====================================
-- Ejecutar en Supabase SQL Editor
-- COMPATIBLE CON SUPABASE HOSTED
-- ====================================

-- PASO 1: Primero, arreglar el trigger problemático
-- ====================================
-- El trigger update_updated_at intenta actualizar un campo que no existe.
-- Opción 1: Añadir el campo faltante
-- Opción 2: Eliminar el trigger problemático

-- Verificar si existe el campo updated_at
-- Si no existe, lo añadimos:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurants' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.restaurants ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Campo updated_at añadido a restaurants';
    END IF;
END $$;

-- PASO 2: Ahora sí, migrar los códigos de planes
-- ====================================

UPDATE public.restaurants 
SET subscription_plan = 'starter' 
WHERE subscription_plan = 'basic';

UPDATE public.restaurants 
SET subscription_plan = 'growth' 
WHERE subscription_plan = 'pro';

UPDATE public.restaurants 
SET subscription_plan = 'scale' 
WHERE subscription_plan = 'enterprise';

-- PASO 3: Actualizar constraint (si existe)
-- ====================================

-- Eliminar constraint viejo si existe
DO $$
BEGIN
    ALTER TABLE public.restaurants DROP CONSTRAINT IF EXISTS restaurants_subscription_plan_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Crear nuevo constraint con códigos unificados
ALTER TABLE public.restaurants 
ADD CONSTRAINT restaurants_subscription_plan_check 
CHECK (subscription_plan IN ('starter', 'growth', 'scale'));

-- PASO 4: Crear tabla subscription_limits
-- ====================================

CREATE TABLE IF NOT EXISTS public.subscription_limits (
    plan_code TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    price_monthly DECIMAL(10, 2) DEFAULT 0,
    price_yearly DECIMAL(10, 2) DEFAULT 0,
    max_products INTEGER,
    max_orders_month INTEGER,
    max_menus INTEGER,
    max_locations INTEGER,
    max_languages INTEGER,
    max_staff INTEGER,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 5: Insertar límites por plan
-- ====================================

INSERT INTO public.subscription_limits 
(plan_code, display_name, price_monthly, price_yearly, max_products, max_orders_month, max_menus, max_locations, max_languages, max_staff, features)
VALUES 
(
    'starter', 
    'Starter', 
    0, 
    0,
    50,      -- max_products
    100,     -- max_orders_month
    1,       -- max_menus
    1,       -- max_locations
    2,       -- max_languages
    2,       -- max_staff
    '{"analytics": false, "beach_gps": false, "api_access": false, "priority_support": false, "branding_removable": false}'
),
(
    'growth', 
    'Growth', 
    39, 
    390,
    NULL,    -- unlimited products
    1000,    -- max_orders_month
    NULL,    -- unlimited menus
    1,       -- max_locations
    7,       -- max_languages
    5,       -- max_staff
    '{"analytics": true, "beach_gps": false, "api_access": false, "priority_support": false, "branding_removable": true}'
),
(
    'scale', 
    'Scale', 
    89, 
    890,
    NULL,    -- unlimited products
    NULL,    -- unlimited orders
    NULL,    -- unlimited menus
    5,       -- max_locations
    7,       -- max_languages
    NULL,    -- unlimited staff
    '{"analytics": true, "beach_gps": true, "api_access": true, "priority_support": true, "branding_removable": true}'
)
ON CONFLICT (plan_code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    max_products = EXCLUDED.max_products,
    max_orders_month = EXCLUDED.max_orders_month,
    max_menus = EXCLUDED.max_menus,
    max_locations = EXCLUDED.max_locations,
    max_languages = EXCLUDED.max_languages,
    max_staff = EXCLUDED.max_staff,
    features = EXCLUDED.features,
    updated_at = NOW();

-- PASO 6: Habilitar RLS
-- ====================================

ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (cualquiera puede ver los planes)
DROP POLICY IF EXISTS "subscription_limits_public_read" ON public.subscription_limits;
CREATE POLICY "subscription_limits_public_read" ON public.subscription_limits
    FOR SELECT USING (is_active = true);

-- PASO 7: Crear índice
-- ====================================

CREATE INDEX IF NOT EXISTS idx_subscription_limits_code ON public.subscription_limits(plan_code);

-- PASO 8: Verificación
-- ====================================

-- Ver planes migrados
SELECT subscription_plan, COUNT(*) as count 
FROM public.restaurants 
GROUP BY subscription_plan;

-- Ver límites creados
SELECT * FROM public.subscription_limits ORDER BY price_monthly;

-- ====================================
-- FIN DE MIGRACIÓN
-- ====================================
