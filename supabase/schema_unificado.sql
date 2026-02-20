-- ====================================
-- MYDIGITABLE - ESQUEMA UNIFICADO
-- Basado en RESTAURANTS (no businesses)
-- ====================================
-- 
-- DECISIÓN: Mantener RESTAURANTS porque:
-- 1. El código frontend ya lo usa
-- 2. Es más simple (1 tabla = 1 negocio)
-- 3. No requiere migración de código
--
-- Ejecutar en Supabase SQL Editor en ORDEN (parte por parte)
-- ====================================

-- ============================================
-- PARTE 1: LIMPIAR TABLAS DUPLICADAS
-- ============================================
-- Ejecuta esto PRIMERO para eliminar conflictos

DROP TABLE IF EXISTS public.webhook_outbox CASCADE;
DROP TABLE IF EXISTS public.order_events CASCADE;
DROP TABLE IF EXISTS public.order_item_allocations CASCADE;
DROP TABLE IF EXISTS public.order_group_items CASCADE;
DROP TABLE IF EXISTS public.order_groups CASCADE;
DROP TABLE IF EXISTS public.session_participants CASCADE;
DROP TABLE IF EXISTS public.table_sessions CASCADE;
DROP TABLE IF EXISTS public.product_modifier_groups CASCADE;
DROP TABLE IF EXISTS public.modifier_options CASCADE;
DROP TABLE IF EXISTS public.modifier_groups CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.waiter_calls CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.daily_metrics CASCADE;
DROP TABLE IF EXISTS public.hourly_metrics CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
DROP TABLE IF EXISTS public.promotion_uses CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP TABLE IF EXISTS public.customer_favorites CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.beach_locations CASCADE;
DROP TABLE IF EXISTS public.tables CASCADE;
DROP TABLE IF EXISTS public.service_areas CASCADE;
DROP TABLE IF EXISTS public.zones CASCADE;
DROP TABLE IF EXISTS public.staff_memberships CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.venues CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.menu_combo_items CASCADE;
DROP TABLE IF EXISTS public.menu_combo_groups CASCADE;
DROP TABLE IF EXISTS public.menu_combos CASCADE;

-- ============================================
-- PARTE 2: ACTUALIZAR TABLA RESTAURANTS
-- ============================================
-- Agregar campos que faltan a restaurants

-- Primero verificar si restaurants existe, si no, crearla
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar todos los campos necesarios
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'ES';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Suscripción
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Stripe
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Configuración regional
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Madrid';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'es';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 21.00;

-- Modos de operación
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS mode_dine_in BOOLEAN DEFAULT true;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS mode_takeaway BOOLEAN DEFAULT false;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS mode_delivery BOOLEAN DEFAULT false;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS mode_beach BOOLEAN DEFAULT false;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS mode_pool BOOLEAN DEFAULT false;

-- Capacidades
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS accepts_orders BOOLEAN DEFAULT true;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS accepts_reservations BOOLEAN DEFAULT false;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS accepts_waiter_calls BOOLEAN DEFAULT true;

-- Horarios y redes
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{}';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS social_tiktok TEXT;

-- Apariencia
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#22C55E';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'classic';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Estado
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

-- ============================================
-- PARTE 3: STAFF (Personal)
-- ============================================

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    pin TEXT,
    role TEXT DEFAULT 'waiter' CHECK (role IN ('owner', 'manager', 'waiter', 'kitchen', 'cashier', 'host')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTE 4: ÁREAS Y MESAS
-- ============================================

-- Zonas/Áreas de servicio
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🍽️',
    color TEXT DEFAULT '#22C55E',
    capacity INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesas
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    table_number TEXT NOT NULL,
    name TEXT,
    capacity INTEGER DEFAULT 4,
    min_capacity INTEGER DEFAULT 1,
    qr_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    qr_code_url TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'calling_waiter', 'cleaning', 'blocked')),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, table_number)
);

-- Ubicaciones Beach/Pool
CREATE TABLE IF NOT EXISTS public.beach_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    location_number TEXT NOT NULL,
    row TEXT,
    zone_name TEXT,
    qr_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    is_occupied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, location_number)
);

-- ============================================
-- PARTE 5: MENÚS Y PRODUCTOS
-- ============================================

-- Menús (contenedores)
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📋',
    schedule_enabled BOOLEAN DEFAULT false,
    schedule_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    schedule_start_time TIME,
    schedule_end_time TIME,
    show_prices BOOLEAN DEFAULT true,
    show_images BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    menu_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
    name_es TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT,
    name_de TEXT,
    name_pt TEXT,
    name_it TEXT,
    name_el TEXT,
    description_es TEXT,
    description_en TEXT,
    icon TEXT DEFAULT '🍽️',
    image_url TEXT,
    schedule_enabled BOOLEAN DEFAULT false,
    available_from TIME,
    available_to TIME,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name_es TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT,
    name_de TEXT,
    name_pt TEXT,
    name_it TEXT,
    name_el TEXT,
    description_es TEXT,
    description_en TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    image_url TEXT,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    allergens TEXT[] DEFAULT '{}',
    calories INTEGER,
    preparation_time INTEGER,
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    stock_quantity INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grupos de Modificadores
CREATE TABLE IF NOT EXISTS public.modifier_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name_es TEXT NOT NULL,
    name_en TEXT,
    is_required BOOLEAN DEFAULT false,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opciones de Modificadores
CREATE TABLE IF NOT EXISTS public.modifier_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE NOT NULL,
    name_es TEXT NOT NULL,
    name_en TEXT,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación Producto <-> Modificadores
CREATE TABLE IF NOT EXISTS public.product_modifier_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(product_id, group_id)
);

-- ============================================
-- PARTE 6: SOCIAL DINING (Sesiones de Mesa)
-- ============================================

-- Sesiones de Mesa
CREATE TABLE IF NOT EXISTS public.table_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE NOT NULL,
    join_code TEXT NOT NULL,
    session_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_payment', 'closed')),
    guest_count INTEGER DEFAULT 1,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participantes
CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.table_sessions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    device_token TEXT,
    avatar_color TEXT DEFAULT '#22C55E',
    is_host BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grupos de Pedido (carrito compartido)
CREATE TABLE IF NOT EXISTS public.order_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.table_sessions(id) ON DELETE CASCADE NOT NULL,
    round_number INTEGER DEFAULT 1,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'confirmed', 'preparing', 'delivered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- Items del Grupo
CREATE TABLE IF NOT EXISTS public.order_group_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_group_id UUID REFERENCES public.order_groups(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    modifiers JSONB DEFAULT '[]',
    notes TEXT,
    line_total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asignación de Items a Pagadores
CREATE TABLE IF NOT EXISTS public.order_item_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_group_item_id UUID REFERENCES public.order_group_items(id) ON DELETE CASCADE NOT NULL,
    participant_id UUID REFERENCES public.session_participants(id) ON DELETE CASCADE NOT NULL,
    fraction DECIMAL(5, 4) DEFAULT 1.0 CHECK (fraction > 0 AND fraction <= 1),
    amount DECIMAL(10, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_group_item_id, participant_id)
);

-- ============================================
-- PARTE 7: PEDIDOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.table_sessions(id) ON DELETE SET NULL,
    beach_location_id UUID REFERENCES public.beach_locations(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery', 'beach', 'pool')),
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    delivery_address TEXT,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    notes TEXT,
    estimated_time INTEGER,
    assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Items del Pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    modifiers JSONB DEFAULT '[]',
    notes TEXT,
    line_total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTE 8: CLIENTES Y MARKETING
-- ============================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    average_order DECIMAL(10, 2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    preferences JSONB DEFAULT '{}',
    first_order_at TIMESTAMPTZ,
    last_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, email)
);

CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'bogo', 'free_item')),
    value DECIMAL(10, 2),
    min_order_amount DECIMAL(10, 2),
    max_discount DECIMAL(10, 2),
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTE 9: OPERACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS public.waiter_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    table_number TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('waiter', 'bill', 'question', 'complaint', 'utensils', 'water', 'other')),
    notes TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    comment TEXT,
    reply TEXT,
    replied_at TIMESTAMPTZ,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTE 10: ANALYTICS Y SISTEMA
-- ============================================

CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_guests INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_tips DECIMAL(10, 2) DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    dine_in_orders INTEGER DEFAULT 0,
    takeaway_orders INTEGER DEFAULT 0,
    delivery_orders INTEGER DEFAULT 0,
    beach_orders INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, date)
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_order', 'order_update', 'waiter_call', 'low_stock', 'review', 'payment', 'system')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('stripe', 'pos', 'printer', 'kitchen_display', 'accounting', 'delivery')),
    name TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoría de pedidos
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    actor_type TEXT CHECK (actor_type IN ('customer', 'staff', 'system')),
    actor_id TEXT,
    actor_name TEXT,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTE 11: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beach_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 12: POLÍTICAS RLS
-- ============================================

-- Restaurants: Owner puede todo
DROP POLICY IF EXISTS "restaurants_owner_all" ON public.restaurants;
CREATE POLICY "restaurants_owner_all" ON public.restaurants
    FOR ALL USING (owner_id = auth.uid());

-- Staff
DROP POLICY IF EXISTS "staff_via_restaurant" ON public.staff;
CREATE POLICY "staff_via_restaurant" ON public.staff
    FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Categories: Público puede ver activas
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "categories_owner_all" ON public.categories;
CREATE POLICY "categories_owner_all" ON public.categories
    FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Products: Público puede ver disponibles
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
    FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "products_owner_all" ON public.products;
CREATE POLICY "products_owner_all" ON public.products
    FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Tables
DROP POLICY IF EXISTS "tables_via_restaurant" ON public.tables;
CREATE POLICY "tables_via_restaurant" ON public.tables
    FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Orders
DROP POLICY IF EXISTS "orders_via_restaurant" ON public.orders;
CREATE POLICY "orders_via_restaurant" ON public.orders
    FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Waiter calls: Cualquiera puede crear
DROP POLICY IF EXISTS "waiter_calls_public_insert" ON public.waiter_calls;
CREATE POLICY "waiter_calls_public_insert" ON public.waiter_calls
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "waiter_calls_owner_all" ON public.waiter_calls;
CREATE POLICY "waiter_calls_owner_all" ON public.waiter_calls
    FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Sessions: Público puede crear y ver
DROP POLICY IF EXISTS "sessions_public_all" ON public.table_sessions;
CREATE POLICY "sessions_public_all" ON public.table_sessions
    FOR ALL USING (true);

DROP POLICY IF EXISTS "participants_public_all" ON public.session_participants;
CREATE POLICY "participants_public_all" ON public.session_participants
    FOR ALL USING (true);

DROP POLICY IF EXISTS "order_groups_public_all" ON public.order_groups;
CREATE POLICY "order_groups_public_all" ON public.order_groups
    FOR ALL USING (true);

-- Menus
DROP POLICY IF EXISTS "menus_public_read" ON public.menus;
CREATE POLICY "menus_public_read" ON public.menus
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "menus_owner_all" ON public.menus;
CREATE POLICY "menus_owner_all" ON public.menus
    FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- ============================================
-- PARTE 13: ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_staff_restaurant ON public.staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON public.tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_tables_qr_token ON public.tables(qr_token);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_restaurant ON public.products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(restaurant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_restaurant ON public.waiter_calls(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON public.waiter_calls(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON public.daily_metrics(restaurant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_table ON public.table_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_sessions_code ON public.table_sessions(join_code);

-- ============================================
-- PARTE 14: FUNCIONES Y TRIGGERS
-- ============================================

-- Función updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;
CREATE TRIGGER update_tables_updated_at
    BEFORE UPDATE ON public.tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generador de número de pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    today_prefix TEXT;
    seq_num INTEGER;
BEGIN
    today_prefix := TO_CHAR(NOW(), 'YYMMDD');
    
    SELECT COALESCE(MAX(
        CASE 
            WHEN order_number LIKE today_prefix || '%' 
            THEN SUBSTRING(order_number FROM 7)::INTEGER 
            ELSE 0 
        END
    ), 0) + 1
    INTO seq_num
    FROM public.orders 
    WHERE restaurant_id = NEW.restaurant_id;
    
    NEW.order_number := today_prefix || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Generador de código de sesión
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := LPAD((RANDOM() * 9999)::INTEGER::TEXT, 4, '0');
        
        SELECT EXISTS(
            SELECT 1 FROM public.table_sessions 
            WHERE table_id = NEW.table_id 
            AND join_code = new_code 
            AND status = 'active'
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    NEW.join_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_session_code ON public.table_sessions;
CREATE TRIGGER set_session_code
    BEFORE INSERT ON public.table_sessions
    FOR EACH ROW EXECUTE FUNCTION generate_session_code();

-- ============================================
-- PARTE 15: REALTIME
-- ============================================

-- Agregar tablas a Realtime (ignorar si ya existen)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.table_sessions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.order_groups;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_calls;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ============================================
-- FIN DEL ESQUEMA UNIFICADO
-- ============================================
-- Total: 26 tablas basadas en RESTAURANTS
-- ============================================
