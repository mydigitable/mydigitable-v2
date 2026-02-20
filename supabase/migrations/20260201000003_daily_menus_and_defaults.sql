-- =============================================
-- NUEVAS TABLAS Y DATOS PREDETERMINADOS
-- =============================================

-- Tabla para menús del día con opciones
CREATE TABLE IF NOT EXISTS public.daily_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Menú del Día',
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    courses JSONB DEFAULT '[]',
    available_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    start_time TIME DEFAULT '12:00',
    end_time TIME DEFAULT '16:00',
    includes_drink BOOLEAN DEFAULT true,
    includes_bread BOOLEAN DEFAULT true,
    includes_dessert BOOLEAN DEFAULT false,
    includes_coffee BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para preferencias dietéticas de pedidos
CREATE TABLE IF NOT EXISTS public.order_dietary_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_celiac BOOLEAN DEFAULT false,
    allergies TEXT[],
    allergy_notes TEXT,
    other_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para temas personalizados del menú
CREATE TABLE IF NOT EXISTS public.menu_themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    theme_id TEXT NOT NULL DEFAULT 'classic',
    custom_css TEXT,
    custom_config JSONB DEFAULT '{}',
    is_custom_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Añadir campo de tema personalizado a restaurants
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS theme_id TEXT DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS custom_theme_enabled BOOLEAN DEFAULT false;

-- =============================================
-- CATEGORÍAS PREDETERMINADAS (ESPAÑOL)
-- =============================================

-- Función para crear categorías predeterminadas al crear restaurante
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (restaurant_id, name_es, icon, sort_order, is_active)
    VALUES
        (NEW.id, 'Entrantes', '🥗', 1, true),
        (NEW.id, 'Ensaladas', '🥬', 2, true),
        (NEW.id, 'Sopas y Cremas', '🍲', 3, true),
        (NEW.id, 'Carnes', '🥩', 4, true),
        (NEW.id, 'Pescados y Mariscos', '🐟', 5, true),
        (NEW.id, 'Pastas', '🍝', 6, true),
        (NEW.id, 'Arroces', '🥘', 7, true),
        (NEW.id, 'Pizzas', '🍕', 8, true),
        (NEW.id, 'Hamburguesas', '🍔', 9, true),
        (NEW.id, 'Tacos y Burritos', '🌮', 10, true),
        (NEW.id, 'Bocadillos', '🥪', 11, true),
        (NEW.id, 'Platos Combinados', '🍽️', 12, true),
        (NEW.id, 'Guarniciones', '🍟', 13, true),
        (NEW.id, 'Postres', '🍰', 14, true),
        (NEW.id, 'Helados', '🍦', 15, true),
        (NEW.id, 'Bebidas', '🥤', 16, true),
        (NEW.id, 'Cervezas', '🍺', 17, true),
        (NEW.id, 'Vinos', '🍷', 18, true),
        (NEW.id, 'Cócteles', '🍹', 19, true),
        (NEW.id, 'Cafés e Infusiones', '☕', 20, true),
        (NEW.id, 'Desayunos', '🥐', 21, true),
        (NEW.id, 'Para Niños', '👶', 22, true),
        (NEW.id, 'Vegano', '🌱', 23, true),
        (NEW.id, 'Sin Gluten', '🌾', 24, true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear categorías al crear restaurante
DROP TRIGGER IF EXISTS create_default_categories_trigger ON public.restaurants;
CREATE TRIGGER create_default_categories_trigger
    AFTER INSERT ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_categories();

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_themes ENABLE ROW LEVEL SECURITY;

-- Políticas para daily_menus
DROP POLICY IF EXISTS "Owners can manage daily menus" ON public.daily_menus;
CREATE POLICY "Owners can manage daily menus"
    ON public.daily_menus FOR ALL
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view active daily menus" ON public.daily_menus;
CREATE POLICY "Public can view active daily menus"
    ON public.daily_menus FOR SELECT
    USING (is_active = true);

-- Políticas para order_dietary_preferences
DROP POLICY IF EXISTS "Public can create dietary preferences" ON public.order_dietary_preferences;
CREATE POLICY "Public can create dietary preferences"
    ON public.order_dietary_preferences FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view dietary preferences" ON public.order_dietary_preferences;
CREATE POLICY "Owners can view dietary preferences"
    ON public.order_dietary_preferences FOR SELECT
    USING (order_id IN (
        SELECT o.id FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE r.owner_id = auth.uid()
    ));

-- Políticas para menu_themes
DROP POLICY IF EXISTS "Owners can manage themes" ON public.menu_themes;
CREATE POLICY "Owners can manage themes"
    ON public.menu_themes FOR ALL
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_daily_menus_restaurant ON public.daily_menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_daily_menus_active ON public.daily_menus(is_active);
CREATE INDEX IF NOT EXISTS idx_order_dietary_order ON public.order_dietary_preferences(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_themes_restaurant ON public.menu_themes(restaurant_id);

SELECT 'Tablas y datos predeterminados creados correctamente' as message;
