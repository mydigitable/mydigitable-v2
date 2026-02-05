-- ====================================
-- MYDIGITABLE - ESQUEMA COMPLETO DE BASE DE DATOS
-- ====================================

-- Tablas base (ya existentes, actualizadas)
-- ====================================

-- Restaurantes
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    primary_color TEXT DEFAULT '#22C55E',
    secondary_color TEXT,
    menu_theme TEXT DEFAULT 'light',
    default_locale TEXT DEFAULT 'es',
    supported_locales TEXT[] DEFAULT ARRAY['es'],
    subscription_plan TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    is_accepting_orders BOOLEAN DEFAULT true,
    mode_dine_in BOOLEAN DEFAULT true,
    mode_takeaway BOOLEAN DEFAULT false,
    mode_delivery BOOLEAN DEFAULT false,
    mode_beach_service BOOLEAN DEFAULT false,
    opening_hours JSONB,
    social_instagram TEXT,
    social_facebook TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorías del menú
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name_es TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT,
    name_de TEXT,
    name_pt TEXT,
    name_it TEXT,
    name_el TEXT,
    description_es TEXT,
    icon TEXT DEFAULT '🍽️',
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name_es TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT,
    name_de TEXT,
    name_pt TEXT,
    name_it TEXT,
    name_el TEXT,
    description_es TEXT,
    description_en TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    image_url TEXT,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    allergens TEXT[],
    calories INTEGER,
    preparation_time INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cartas/Menús configurables
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📋',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    -- Horarios de activación
    schedule_enabled BOOLEAN DEFAULT false,
    schedule_days INTEGER[],
    schedule_start_time TIME,
    schedule_end_time TIME,
    -- Categorías incluidas
    included_categories UUID[],
    -- Configuración de visualización
    show_prices BOOLEAN DEFAULT true,
    show_descriptions BOOLEAN DEFAULT true,
    show_images BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- NUEVAS TABLAS
-- ====================================

-- Mesas
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_number INTEGER NOT NULL,
    name TEXT,
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
    zone TEXT,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, table_number)
);

-- Ubicaciones de playa
CREATE TABLE IF NOT EXISTS public.beach_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    location_number INTEGER NOT NULL,
    name TEXT,
    row TEXT,
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, location_number)
);

-- Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery', 'beach_service')),
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    beach_location_id UUID REFERENCES public.beach_locations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    delivery_address TEXT,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    tip DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_id TEXT,
    notes TEXT,
    estimated_time INTEGER,
    assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Items del pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    modifiers JSONB,
    notes TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modificadores de productos
CREATE TABLE IF NOT EXISTS public.product_modifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name_es TEXT NOT NULL,
    name_en TEXT,
    type TEXT DEFAULT 'addon' CHECK (type IN ('addon', 'size', 'removal', 'option')),
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    max_selections INTEGER DEFAULT 1,
    options JSONB,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Llamadas de camarero
CREATE TABLE IF NOT EXISTS public.waiter_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    table_number INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('waiter', 'bill', 'question', 'complaint', 'utensils', 'other')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed')),
    assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Personal
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    pin TEXT,
    role TEXT DEFAULT 'waiter' CHECK (role IN ('owner', 'manager', 'waiter', 'cook', 'delivery', 'cashier')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB,
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clientes
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    first_order_at TIMESTAMP WITH TIME ZONE,
    last_order_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, email),
    UNIQUE(restaurant_id, phone)
);

-- Favoritos de clientes
CREATE TABLE IF NOT EXISTS public.customer_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- Promociones
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'bogo', 'free_item', 'bundle')),
    value DECIMAL(10,2),
    min_order DECIMAL(10,2),
    code TEXT,
    applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'product', 'order_type')),
    applies_to_ids UUID[],
    days_of_week INTEGER[],
    start_time TIME,
    end_time TIME,
    start_date DATE,
    end_date DATE,
    max_uses INTEGER,
    max_uses_per_customer INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_automatic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uso de promociones
CREATE TABLE IF NOT EXISTS public.promotion_uses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    comment TEXT,
    reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métricas diarias
CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    menu_views INTEGER DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    dine_in_orders INTEGER DEFAULT 0,
    takeaway_orders INTEGER DEFAULT 0,
    delivery_orders INTEGER DEFAULT 0,
    beach_service_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, date)
);

-- Métricas por hora
CREATE TABLE IF NOT EXISTS public.hourly_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    orders INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, date, hour)
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_order', 'order_update', 'waiter_call', 'low_stock', 'review', 'promo', 'system')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integraciones
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('stripe', 'pos', 'printer', 'delivery_platform', 'accounting')),
    name TEXT NOT NULL,
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beach_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hourly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- ====================================
-- POLÍTICAS RLS
-- ====================================

-- Políticas para restaurantes
CREATE POLICY "Users can manage own restaurants" ON public.restaurants
    FOR ALL USING (owner_id = auth.uid());

-- Políticas para categorías
CREATE POLICY "Users can manage categories of own restaurants" ON public.categories
    FOR ALL USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
    );

CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

-- Políticas para productos
CREATE POLICY "Users can manage products of own restaurants" ON public.products
    FOR ALL USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
    );

CREATE POLICY "Public can view available products" ON public.products
    FOR SELECT USING (is_available = true);

-- Políticas para mesas
CREATE POLICY "Users can manage tables of own restaurants" ON public.tables
    FOR ALL USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
    );

-- Políticas para pedidos
CREATE POLICY "Users can manage orders of own restaurants" ON public.orders
    FOR ALL USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
    );

-- Políticas para llamadas de camarero
CREATE POLICY "Users can manage waiter calls of own restaurants" ON public.waiter_calls
    FOR ALL USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
    );

CREATE POLICY "Anyone can create waiter calls" ON public.waiter_calls
    FOR INSERT WITH CHECK (true);

-- Políticas para métricas
CREATE POLICY "Users can view metrics of own restaurants" ON public.daily_metrics
    FOR SELECT USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
    );

-- ====================================
-- ÍNDICES
-- ====================================

CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_restaurant ON public.products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_restaurant ON public.waiter_calls(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON public.waiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_restaurant_date ON public.daily_metrics(restaurant_id, date);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON public.tables(restaurant_id);

-- ====================================
-- FUNCIONES Y TRIGGERS
-- ====================================

-- Función para generar número de pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := LPAD(
        (SELECT COALESCE(MAX(
            CASE WHEN order_number ~ '^\d+$' THEN order_number::integer ELSE 0 END
        ), 0) + 1 FROM public.orders WHERE restaurant_id = NEW.restaurant_id)::text,
        4,
        '0'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Función para actualizar métricas diarias
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS TRIGGER AS $$
DECLARE
    order_date DATE;
BEGIN
    order_date := DATE(COALESCE(NEW.created_at, OLD.created_at));
    
    INSERT INTO public.daily_metrics (restaurant_id, date, total_orders, total_revenue)
    VALUES (
        COALESCE(NEW.restaurant_id, OLD.restaurant_id),
        order_date,
        1,
        COALESCE(NEW.total, 0)
    )
    ON CONFLICT (restaurant_id, date) DO UPDATE SET
        total_orders = daily_metrics.total_orders + 
            CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
        total_revenue = daily_metrics.total_revenue + 
            CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.total, 0) 
                 WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.total, 0) - COALESCE(OLD.total, 0)
                 ELSE 0 END,
        average_order_value = (daily_metrics.total_revenue + COALESCE(NEW.total, 0)) / 
            NULLIF(daily_metrics.total_orders + 1, 0),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_order
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_metrics();

-- ====================================
-- FUNCIONES DE SUPABASE REALTIME
-- ====================================

-- Habilitar Realtime para tablas clave
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
