-- ====================================
-- MYDIGITABLE v3 "ANTIGRAVITY" 
-- ESQUEMA COMPLETO PARA SUPABASE
-- ====================================
-- Ejecutar en: Supabase > SQL Editor > New Query

-- ============================================
-- PARTE 1: LIMPIAR TABLAS ANTERIORES (OPCIONAL)
-- ============================================
-- ADVERTENCIA: Esto borrará todos los datos existentes
-- Descomenta solo si quieres empezar de cero

-- DROP TABLE IF EXISTS public.webhook_outbox CASCADE;
-- DROP TABLE IF EXISTS public.order_events CASCADE;
-- DROP TABLE IF EXISTS public.order_item_allocations CASCADE;
-- DROP TABLE IF EXISTS public.order_groups CASCADE;
-- DROP TABLE IF EXISTS public.table_sessions CASCADE;
-- DROP TABLE IF EXISTS public.integrations CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.hourly_metrics CASCADE;
-- DROP TABLE IF EXISTS public.daily_metrics CASCADE;
-- DROP TABLE IF EXISTS public.promotion_uses CASCADE;
-- DROP TABLE IF EXISTS public.promotions CASCADE;
-- DROP TABLE IF EXISTS public.reviews CASCADE;
-- DROP TABLE IF EXISTS public.customer_favorites CASCADE;
-- DROP TABLE IF EXISTS public.customers CASCADE;
-- DROP TABLE IF EXISTS public.waiter_calls CASCADE;
-- DROP TABLE IF EXISTS public.order_items CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;
-- DROP TABLE IF EXISTS public.product_modifiers CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;
-- DROP TABLE IF EXISTS public.menus CASCADE;
-- DROP TABLE IF EXISTS public.tables CASCADE;
-- DROP TABLE IF EXISTS public.service_areas CASCADE;
-- DROP TABLE IF EXISTS public.beach_locations CASCADE;
-- DROP TABLE IF EXISTS public.staff_memberships CASCADE;
-- DROP TABLE IF EXISTS public.staff CASCADE;
-- DROP TABLE IF EXISTS public.venues CASCADE;
-- DROP TABLE IF EXISTS public.businesses CASCADE;

-- ============================================
-- PARTE 2: NÚCLEO DE NEGOCIO (MULTITENANCY)
-- ============================================

-- Negocios (Entidad principal - el dueño)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Información básica
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    legal_name TEXT,
    tax_id TEXT, -- CIF/NIF
    
    -- Contacto
    email TEXT,
    phone TEXT,
    website TEXT,
    
    -- Branding
    logo_url TEXT,
    cover_url TEXT,
    primary_color TEXT DEFAULT '#22C55E',
    
    -- Configuración regional
    country TEXT DEFAULT 'ES',
    currency TEXT DEFAULT 'EUR',
    timezone TEXT DEFAULT 'Europe/Madrid',
    default_language TEXT DEFAULT 'es',
    
    -- Suscripción
    subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('starter', 'basic', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')),
    trial_ends_at TIMESTAMPTZ,
    
    -- Stripe
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Configuración JSONB
    settings JSONB DEFAULT '{}',
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 1,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sedes/Venues (Ubicaciones físicas del negocio)
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Información
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Ubicación
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'ES',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contacto
    phone TEXT,
    email TEXT,
    
    -- Configuración regional
    timezone TEXT DEFAULT 'Europe/Madrid',
    tax_rate DECIMAL(5, 2) DEFAULT 21.00, -- IVA España
    
    -- Modos de operación
    mode_dine_in BOOLEAN DEFAULT true,
    mode_takeaway BOOLEAN DEFAULT false,
    mode_delivery BOOLEAN DEFAULT false,
    mode_beach BOOLEAN DEFAULT false,
    mode_pool BOOLEAN DEFAULT false,
    
    -- Capacidades
    accepts_orders BOOLEAN DEFAULT true,
    accepts_reservations BOOLEAN DEFAULT false,
    accepts_waiter_calls BOOLEAN DEFAULT true,
    
    -- Horarios
    opening_hours JSONB DEFAULT '{}',
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_open BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(business_id, slug)
);

-- Staff (Personal base)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Información
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    pin TEXT, -- PIN de 4 dígitos para acceso rápido
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Memberships (Relación N:N entre staff y venues con roles)
CREATE TABLE IF NOT EXISTS public.staff_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Rol
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'waiter', 'kitchen', 'cashier', 'host')),
    
    -- Permisos granulares
    permissions JSONB DEFAULT '{}',
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(staff_id, venue_id)
);

-- ============================================
-- PARTE 3: GESTIÓN DE ESPACIOS (THE FLOOR PLAN)
-- ============================================

-- Áreas de servicio (Salón, Terraza, Barra, VIP)
CREATE TABLE IF NOT EXISTS public.service_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Información
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🍽️',
    color TEXT DEFAULT '#22C55E',
    
    -- Capacidad
    capacity INTEGER,
    
    -- Orden
    sort_order INTEGER DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesas
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    area_id UUID REFERENCES public.service_areas(id) ON DELETE SET NULL,
    
    -- Identificación
    table_number TEXT NOT NULL,
    name TEXT, -- Nombre descriptivo opcional "Mesa VIP 1"
    
    -- Capacidad
    capacity INTEGER DEFAULT 4,
    min_capacity INTEGER DEFAULT 1,
    
    -- QR único
    qr_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    qr_code_url TEXT,
    
    -- Estado
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'calling_waiter', 'cleaning', 'blocked')),
    
    -- Posición en mapa
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    
    -- Orden
    sort_order INTEGER DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(venue_id, table_number)
);

-- Beach/Pool Locations
CREATE TABLE IF NOT EXISTS public.beach_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    area_id UUID REFERENCES public.service_areas(id) ON DELETE SET NULL,
    
    -- Identificación
    location_number TEXT NOT NULL,
    row TEXT, -- Fila (A, B, C...)
    zone TEXT, -- VIP, Primera línea, etc.
    
    -- QR
    qr_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    
    -- GPS
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_occupied BOOLEAN DEFAULT false,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(venue_id, location_number)
);

-- ============================================
-- PARTE 4: MOTOR GASTRONÓMICO (DYNAMIC MENUS)
-- ============================================

-- Menús (contenedores)
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Información
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📋',
    
    -- Horarios de visibilidad
    schedule_enabled BOOLEAN DEFAULT false,
    schedule_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- 0=Domingo
    schedule_start_time TIME,
    schedule_end_time TIME,
    
    -- Configuración
    show_prices BOOLEAN DEFAULT true,
    show_descriptions BOOLEAN DEFAULT true,
    show_images BOOLEAN DEFAULT true,
    show_allergens BOOLEAN DEFAULT true,
    
    -- Orden
    sort_order INTEGER DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Nombres multi-idioma
    name_es TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT,
    name_de TEXT,
    name_pt TEXT,
    name_it TEXT,
    name_el TEXT,
    
    -- Descripción
    description_es TEXT,
    description_en TEXT,
    
    -- Visual
    icon TEXT DEFAULT '🍽️',
    image_url TEXT,
    
    -- Horarios
    schedule_enabled BOOLEAN DEFAULT false,
    available_from TIME,
    available_to TIME,
    available_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    
    -- Orden
    sort_order INTEGER DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Nombres multi-idioma
    name_es TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT,
    name_de TEXT,
    name_pt TEXT,
    name_it TEXT,
    name_el TEXT,
    
    -- Descripción
    description_es TEXT,
    description_en TEXT,
    
    -- Precios
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2), -- Precio tachado
    cost_price DECIMAL(10, 2), -- Coste para margen
    
    -- Visual
    image_url TEXT,
    
    -- Dietético
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    allergens TEXT[] DEFAULT '{}',
    
    -- Nutrición
    calories INTEGER,
    
    -- Tiempo
    preparation_time INTEGER, -- minutos
    
    -- Stock
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    stock_quantity INTEGER,
    
    -- IA Metadata (descripciones generadas por Vision/Writer)
    ai_metadata JSONB DEFAULT '{}',
    
    -- Orden
    sort_order INTEGER DEFAULT 0,
    
    -- Estado
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grupos de Modificadores
CREATE TABLE IF NOT EXISTS public.modifier_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Nombres
    name_es TEXT NOT NULL,
    name_en TEXT,
    
    -- Reglas de selección
    is_required BOOLEAN DEFAULT false,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER DEFAULT 1,
    
    -- Orden
    sort_order INTEGER DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opciones de Modificadores
CREATE TABLE IF NOT EXISTS public.modifier_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE NOT NULL,
    
    -- Nombres
    name_es TEXT NOT NULL,
    name_en TEXT,
    
    -- Precio
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    
    -- Default
    is_default BOOLEAN DEFAULT false,
    
    -- Orden
    sort_order INTEGER DEFAULT 0,
    
    -- Estado
    is_available BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación Producto <-> Grupo de Modificadores
CREATE TABLE IF NOT EXISTS public.product_modifier_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(product_id, group_id)
);

-- ============================================
-- PARTE 5: SOCIAL DINING (EL DIFERENCIAL)
-- ============================================

-- Sesiones de Mesa (código 4 dígitos para unir amigos)
CREATE TABLE IF NOT EXISTS public.table_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Código de 4 dígitos para unirse
    join_code TEXT NOT NULL,
    
    -- Token seguro para APIs
    session_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    
    -- Estado
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_payment', 'closed')),
    
    -- Contadores
    guest_count INTEGER DEFAULT 1,
    
    -- Tiempos
    started_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(table_id, join_code)
);

-- Participantes de Sesión
CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.table_sessions(id) ON DELETE CASCADE NOT NULL,
    
    -- Identificación
    name TEXT NOT NULL,
    device_token TEXT, -- Para push notifications
    
    -- Avatar (color o imagen)
    avatar_color TEXT DEFAULT '#22C55E',
    
    -- Es el host? (quien abrió la sesión)
    is_host BOOLEAN DEFAULT false,
    
    -- Auditoría
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grupos de Pedido (carrito compartido)
CREATE TABLE IF NOT EXISTS public.order_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.table_sessions(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Número de ronda (1, 2, 3...)
    round_number INTEGER DEFAULT 1,
    
    -- Totales
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    
    -- Estado
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'confirmed', 'preparing', 'delivered')),
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ
);

-- Items del Grupo de Pedido
CREATE TABLE IF NOT EXISTS public.order_group_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_group_id UUID REFERENCES public.order_groups(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- Quien lo pidió
    participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
    
    -- Detalles
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    modifiers JSONB DEFAULT '[]',
    notes TEXT,
    
    -- Total línea
    line_total DECIMAL(10, 2) NOT NULL,
    
    -- Estado del item
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asignación de Items a Pagadores (TABLA CRÍTICA)
CREATE TABLE IF NOT EXISTS public.order_item_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_group_item_id UUID REFERENCES public.order_group_items(id) ON DELETE CASCADE NOT NULL,
    participant_id UUID REFERENCES public.session_participants(id) ON DELETE CASCADE NOT NULL,
    
    -- Fracción del item (1.0 = completo, 0.5 = mitad, etc.)
    fraction DECIMAL(5, 4) DEFAULT 1.0 CHECK (fraction > 0 AND fraction <= 1),
    
    -- Monto calculado
    amount DECIMAL(10, 2) NOT NULL,
    
    -- Pagado?
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    payment_intent_id TEXT,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(order_group_item_id, participant_id)
);

-- ============================================
-- PARTE 6: PEDIDOS CONSOLIDADOS
-- ============================================

-- Pedidos (consolidado de order_groups o pedido directo)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Origen
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.table_sessions(id) ON DELETE SET NULL,
    beach_location_id UUID REFERENCES public.beach_locations(id) ON DELETE SET NULL,
    
    -- Número
    order_number TEXT NOT NULL,
    
    -- Tipo
    order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery', 'beach', 'pool')),
    
    -- Cliente
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    delivery_address TEXT,
    
    -- Totales
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    
    -- Estado del ciclo de vida
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'paid_to_kitchen', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')),
    
    -- Pago
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    
    -- Balance pendiente (CONSTRAINT: no enviar a cocina si > 0)
    pending_balance DECIMAL(10, 2) DEFAULT 0,
    
    -- Notas
    notes TEXT,
    
    -- Tiempos
    estimated_time INTEGER,
    
    -- Staff asignado
    assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- CONSTRAINT: No puede ir a cocina si hay balance pendiente
    CONSTRAINT check_balance_before_kitchen CHECK (
        status != 'paid_to_kitchen' OR pending_balance = 0
    )
);

-- Items del Pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- Detalles
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    modifiers JSONB DEFAULT '[]',
    notes TEXT,
    
    -- Total línea
    line_total DECIMAL(10, 2) NOT NULL,
    
    -- Estado
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTE 7: AUDITORÍA Y WEBHOOKS
-- ============================================

-- Eventos de Pedido (quién hizo qué y cuándo)
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    
    -- Tipo de evento
    event_type TEXT NOT NULL CHECK (event_type IN (
        'created', 'item_added', 'item_removed', 'submitted', 
        'payment_initiated', 'payment_completed', 'payment_failed',
        'sent_to_kitchen', 'started_preparing', 'ready',
        'delivered', 'completed', 'cancelled', 'refunded'
    )),
    
    -- Quien lo hizo
    actor_type TEXT CHECK (actor_type IN ('customer', 'staff', 'system')),
    actor_id TEXT,
    actor_name TEXT,
    
    -- Datos del evento
    data JSONB DEFAULT '{}',
    
    -- IP y device
    ip_address INET,
    user_agent TEXT,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Outbox (para integración con TPV externos)
CREATE TABLE IF NOT EXISTS public.webhook_outbox (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Destino
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    endpoint_url TEXT NOT NULL,
    
    -- Evento
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    
    -- Estado
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    
    -- Reintentos
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    last_attempt_at TIMESTAMPTZ,
    next_attempt_at TIMESTAMPTZ,
    last_error TEXT,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- ============================================
-- PARTE 8: TABLAS COMPLEMENTARIAS
-- ============================================

-- Clientes
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Información
    name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Estadísticas
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    average_order DECIMAL(10, 2) DEFAULT 0,
    
    -- Fidelización
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    
    -- Preferencias
    preferences JSONB DEFAULT '{}',
    
    -- Auditoría
    first_order_at TIMESTAMPTZ,
    last_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(business_id, email)
);

-- Promociones
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Información
    name TEXT NOT NULL,
    description TEXT,
    code TEXT,
    
    -- Tipo y valor
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'bogo', 'free_item')),
    value DECIMAL(10, 2),
    
    -- Límites
    min_order_amount DECIMAL(10, 2),
    max_discount DECIMAL(10, 2),
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    
    -- Validez
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Llamadas al Camarero
CREATE TABLE IF NOT EXISTS public.waiter_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Motivo
    reason TEXT NOT NULL CHECK (reason IN ('waiter', 'bill', 'question', 'complaint', 'utensils', 'water', 'other')),
    notes TEXT,
    
    -- Prioridad
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Estado
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
    
    -- Asignación
    assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    
    -- Tiempos
    acknowledged_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integraciones
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    
    -- Tipo
    type TEXT NOT NULL CHECK (type IN ('stripe', 'pos', 'printer', 'kitchen_display', 'accounting', 'delivery')),
    name TEXT NOT NULL,
    
    -- Configuración (encriptada en producción)
    config JSONB DEFAULT '{}',
    
    -- Webhook endpoint
    webhook_url TEXT,
    webhook_secret TEXT,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    
    -- Tipo
    type TEXT NOT NULL CHECK (type IN ('new_order', 'order_update', 'waiter_call', 'low_stock', 'review', 'payment', 'system')),
    
    -- Contenido
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    
    -- Estado
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas Diarias
CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    
    -- Contadores
    total_orders INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_guests INTEGER DEFAULT 0,
    
    -- Ingresos
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_tips DECIMAL(10, 2) DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    
    -- Por tipo
    dine_in_orders INTEGER DEFAULT 0,
    takeaway_orders INTEGER DEFAULT 0,
    delivery_orders INTEGER DEFAULT 0,
    beach_orders INTEGER DEFAULT 0,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(venue_id, date)
);

-- Reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Ratings
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    
    -- Comentario
    comment TEXT,
    
    -- Respuesta
    reply TEXT,
    replied_at TIMESTAMPTZ,
    
    -- Estado
    is_public BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTE 9: ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 10: POLÍTICAS RLS
-- ============================================

-- Businesses: Owner puede todo
CREATE POLICY "business_owner_all" ON public.businesses
    FOR ALL USING (owner_id = auth.uid());

-- Venues: Acceso via business
CREATE POLICY "venue_via_business" ON public.venues
    FOR ALL USING (
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    );

-- Staff memberships: Acceso via business
CREATE POLICY "staff_membership_via_business" ON public.staff_memberships
    FOR ALL USING (
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    );

-- Categories: Público puede ver activas
CREATE POLICY "categories_public_read" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "categories_owner_all" ON public.categories
    FOR ALL USING (
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    );

-- Products: Público puede ver disponibles
CREATE POLICY "products_public_read" ON public.products
    FOR SELECT USING (is_available = true);

CREATE POLICY "products_owner_all" ON public.products
    FOR ALL USING (
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    );

-- Tables: Acceso via business
CREATE POLICY "tables_via_business" ON public.tables
    FOR ALL USING (
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    );

-- Orders: Acceso via business
CREATE POLICY "orders_via_business" ON public.orders
    FOR ALL USING (
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    );

-- Waiter calls: Cualquiera puede crear, owner gestiona
CREATE POLICY "waiter_calls_public_insert" ON public.waiter_calls
    FOR INSERT WITH CHECK (true);

CREATE POLICY "waiter_calls_owner_all" ON public.waiter_calls
    FOR ALL USING (
        business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    );

-- Sessions: Público puede crear y ver
CREATE POLICY "sessions_public_all" ON public.table_sessions
    FOR ALL USING (true);

-- Participants: Público puede unirse
CREATE POLICY "participants_public_all" ON public.session_participants
    FOR ALL USING (true);

-- Order groups: Público puede crear
CREATE POLICY "order_groups_public_all" ON public.order_groups
    FOR ALL USING (true);

-- ============================================
-- PARTE 11: ÍNDICES PARA RENDIMIENTO
-- ============================================

-- Businesses
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);

-- Venues
CREATE INDEX IF NOT EXISTS idx_venues_business ON public.venues(business_id);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON public.venues(business_id, slug);

-- Tables
CREATE INDEX IF NOT EXISTS idx_tables_venue ON public.tables(venue_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_tables_qr_token ON public.tables(qr_token);

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_menu ON public.categories(menu_id);
CREATE INDEX IF NOT EXISTS idx_categories_venue ON public.categories(venue_id);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_venue ON public.products(venue_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(venue_id, is_available);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_table ON public.table_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_sessions_code ON public.table_sessions(join_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.table_sessions(status);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_venue ON public.orders(venue_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_session ON public.orders(session_id);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Order events
CREATE INDEX IF NOT EXISTS idx_order_events_order ON public.order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created ON public.order_events(created_at DESC);

-- Waiter calls
CREATE INDEX IF NOT EXISTS idx_waiter_calls_venue ON public.waiter_calls(venue_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON public.waiter_calls(venue_id, status);

-- Metrics
CREATE INDEX IF NOT EXISTS idx_daily_metrics_venue_date ON public.daily_metrics(venue_id, date DESC);

-- ============================================
-- PARTE 12: FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON public.venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tables_updated_at
    BEFORE UPDATE ON public.tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función para generar número de pedido por venue
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
    WHERE venue_id = NEW.venue_id;
    
    NEW.order_number := today_prefix || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Función para generar código de sesión único de 4 dígitos
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

CREATE TRIGGER set_session_code
    BEFORE INSERT ON public.table_sessions
    FOR EACH ROW EXECUTE FUNCTION generate_session_code();

-- Función para actualizar métricas diarias
CREATE OR REPLACE FUNCTION update_daily_metrics_on_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.daily_metrics (venue_id, business_id, date, total_orders, total_revenue)
    VALUES (NEW.venue_id, NEW.business_id, DATE(NEW.created_at), 1, COALESCE(NEW.total, 0))
    ON CONFLICT (venue_id, date) DO UPDATE SET
        total_orders = daily_metrics.total_orders + 1,
        total_revenue = daily_metrics.total_revenue + COALESCE(NEW.total, 0),
        average_order_value = (daily_metrics.total_revenue + COALESCE(NEW.total, 0)) / 
                              NULLIF(daily_metrics.total_orders + 1, 0),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_order
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_daily_metrics_on_order();

-- ============================================
-- PARTE 13: HABILITAR REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_group_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- FIN DEL ESQUEMA "ANTIGRAVITY"
-- ============================================
