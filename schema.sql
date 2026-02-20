-- ==========================================
-- MYDIGITABLE V5 - DATABASE SCHEMA
-- ==========================================
-- Version: 5.0 (Feb 2026)
-- Target: PostgreSQL 14+ (Supabase)
-- Architecture: Multi-tenant SaaS
-- Pricing: BASIC €49 | PRO €99 | PREMIUM €150
-- ==========================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- ENUMS
-- ==========================================

-- Tipos de plan
CREATE TYPE plan_tier AS ENUM ('basic', 'pro', 'premium');

-- Estado de suscripción
CREATE TYPE subscription_status AS ENUM (
  'active', 'past_due', 'canceled', 'paused'
);

-- Tipo de negocio
CREATE TYPE business_type AS ENUM (
  'restaurant', 'bar', 'hotel', 'beach_club', 'event'
);

-- Roles de staff
CREATE TYPE staff_role AS ENUM (
  'owner', 'manager', 'waiter', 'chef', 'host'
);

-- Estado de mesa
CREATE TYPE table_status AS ENUM (
  'available', 'occupied', 'reserved', 'cleaning'
);

-- Estado de pedido
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'canceled'
);

-- Tipo de pedido
CREATE TYPE order_type AS ENUM (
  'dine_in', 'takeaway', 'delivery', 'room_service', 'beach', 'event'
);

-- Estado de pago
CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded'
);

-- Método de pago
CREATE TYPE payment_method AS ENUM (
  'card', 'cash', 'apple_pay', 'google_pay', 'room_charge', 'mixed'
);

-- Distribución de propinas
CREATE TYPE tip_distribution AS ENUM ('individual', 'shared');

-- Frecuencia de pago de propinas
CREATE TYPE tip_payout AS ENUM ('end_of_shift', 'daily', 'weekly');

-- Estado de reserva
CREATE TYPE reservation_status AS ENUM (
  'pending', 'confirmed', 'seated', 'completed', 'canceled', 'no_show'
);

-- Modo de cocina
CREATE TYPE kitchen_mode AS ENUM ('tablet', 'integrated', 'print_only');

-- Modo de ubicación
CREATE TYPE location_mode AS ENUM (
  'fixed_table', 'gps_free', 'room_number', 'sector_seat', 'pickup_point'
);

-- ==========================================
-- TABLA: restaurants
-- ==========================================

CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  business_type business_type NOT NULL DEFAULT 'restaurant',
  
  -- Suscripción
  plan_tier plan_tier NOT NULL DEFAULT 'basic',
  subscription_status subscription_status NOT NULL DEFAULT 'active',
  subscription_started_at TIMESTAMPTZ DEFAULT NOW(),
  next_billing_date TIMESTAMPTZ,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- Multi-locales y pricing
  total_locations INT DEFAULT 1 CHECK (total_locations >= 1),
  location_discount_percent DECIMAL(5,2) DEFAULT 0,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 49.00,
  monthly_total DECIMAL(10,2) NOT NULL DEFAULT 49.00,
  
  -- Contacto
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Ubicación principal
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(2) DEFAULT 'ES',
  
  -- Branding
  logo_url TEXT,
  cover_image_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#22C55E',
  secondary_color VARCHAR(7) DEFAULT '#FFC107',
  
  -- Idiomas
  default_language VARCHAR(5) DEFAULT 'es',
  supported_languages TEXT[] DEFAULT ARRAY['es'],
  auto_detect_language BOOLEAN DEFAULT FALSE,
  
  -- Config general
  timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Estados
  is_active BOOLEAN DEFAULT TRUE,
  is_accepting_orders BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: restaurant_config
-- ==========================================

CREATE TABLE restaurant_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Configuración operativa
  operational_settings JSONB DEFAULT '{
    "location_mode": "fixed_table",
    "has_delivery": false,
    "has_beach_service": false,
    "has_room_service": false,
    "has_zones": false,
    "payment_timing": "after",
    "accepts_cash": true,
    "working_hours": {
      "monday": {"open": "08:00", "close": "23:00", "closed": false},
      "tuesday": {"open": "08:00", "close": "23:00", "closed": false},
      "wednesday": {"open": "08:00", "close": "23:00", "closed": false},
      "thursday": {"open": "08:00", "close": "23:00", "closed": false},
      "friday": {"open": "08:00", "close": "23:00", "closed": false},
      "saturday": {"open": "08:00", "close": "23:00", "closed": false},
      "sunday": {"open": "08:00", "close": "23:00", "closed": false}
    },
    "menu_schedules": {
      "breakfast": {"start": "08:00", "end": "12:00", "enabled": false},
      "lunch": {"start": "12:00", "end": "17:00", "enabled": false},
      "dinner": {"start": "19:00", "end": "23:00", "enabled": false}
    },
    "auto_switch_menus": false,
    "auto_free_tables_after_hours": 3,
    "room_service_enabled": false,
    "floor_numbers": [],
    "gps_mode_enabled": false,
    "gps_radius_meters": 100,
    "sector_mode_enabled": false,
    "seat_numbering_enabled": false,
    "pre_orders_enabled": false
  }'::JSONB,

  -- Configuración de staff
  staff_settings JSONB DEFAULT '{
    "waiters_enabled": false,
    "zones_assignment_enabled": false,
    "notifications_mode": "all",
    "call_waiter_enabled": true,
    "call_motives": ["Agua", "Cubiertos", "Servilletas", "Hielo", "La cuenta", "Otro"],
    "tips_enabled": true,
    "tip_suggestions": [10, 15, 20],
    "tips_distribution": "individual",
    "tips_payout": "end_of_shift",
    "confirm_served": false
  }'::JSONB,

  -- Configuración de cocina
  kitchen_settings JSONB DEFAULT '{
    "kitchen_enabled": false,
    "kitchen_mode": "tablet",
    "enable_prep_timer": false,
    "default_prep_time_minutes": 15,
    "alert_if_late_minutes": 5,
    "chef_can_call_waiter": true
  }'::JSONB,

  -- Configuración del cliente
  customer_settings JSONB DEFAULT '{
    "shared_table_enabled": false,
    "shared_table_expiry_hours": 3,
    "show_call_waiter_button": true,
    "show_order_progress": false,
    "allow_cancel_order": true,
    "show_allergens": true,
    "show_dietary_filters": true,
    "auto_detect_language": false
  }'::JSONB,

  -- Configuración de QR
  qr_settings JSONB DEFAULT '{
    "mode": "per_table",
    "color": "#22C55E",
    "custom_text": "Escanea para pedir",
    "include_logo": true
  }'::JSONB,

  -- Configuración de temas
  theme_settings JSONB DEFAULT '{
    "menu_theme": "classic_white",
    "dashboard_theme": "modern_light",
    "custom_css": null
  }'::JSONB,

  -- Configuración de reservas
  reservations_settings JSONB DEFAULT '{
    "reservations_enabled": false,
    "min_party_size": 1,
    "max_party_size": 20,
    "booking_advance_days": 30,
    "default_duration_minutes": 90,
    "send_confirmation_email": true,
    "allow_cancellation": true,
    "cancellation_deadline_hours": 24
  }'::JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: restaurant_locations
-- ==========================================

CREATE TABLE restaurant_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(2) DEFAULT 'ES',
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Precio adicional calculado automáticamente
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 40.00,
  
  is_main BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, slug)
);

-- ==========================================
-- TABLA: zones
-- ==========================================

CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES restaurant_locations(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#22C55E',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: tables
-- ==========================================

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES restaurant_locations(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  
  table_number VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 4,
  qr_slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- GPS mode (beach clubs)
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Eventos (sector/asiento)
  sector VARCHAR(50),
  row_number VARCHAR(10),
  seat_number VARCHAR(10),
  
  status table_status DEFAULT 'available',
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: staff_members
-- ==========================================

CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES restaurant_locations(id) ON DELETE SET NULL,
  
  role staff_role NOT NULL,
  assigned_zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, user_id)
);

-- ==========================================
-- TABLA: menu_categories
-- ==========================================

CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Multi-idioma en JSONB
  -- Ejemplo: {"es": "Entrantes", "en": "Starters", "de": "Vorspeisen"}
  name JSONB NOT NULL,
  description JSONB,
  
  icon VARCHAR(50),
  image_url TEXT,
  active_schedule VARCHAR(50), -- 'all_day', 'breakfast', 'lunch', 'dinner'
  
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: products
-- ==========================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  
  -- Multi-idioma en JSONB
  name JSONB NOT NULL,
  description JSONB,
  
  -- Precios
  price DECIMAL(10,2) NOT NULL,
  terrace_price DECIMAL(10,2), -- Precio distinto en terraza (Plan PRO+)
  cost_price DECIMAL(10,2),    -- Coste del plato (Plan PREMIUM)
  
  image_url TEXT,
  
  -- Stock
  is_available BOOLEAN DEFAULT TRUE,
  stock_quantity INT,           -- null = sin control, número = stock exacto
  track_stock BOOLEAN DEFAULT FALSE,
  
  -- Info dietética
  allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
  dietary_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadatos
  is_featured BOOLEAN DEFAULT FALSE,
  imported_via_ai BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: product_modifiers
-- ==========================================

CREATE TABLE product_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  name JSONB NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'size', 'extra', 'option', 'remove'
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  
  is_required BOOLEAN DEFAULT FALSE,
  allow_multiple BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: product_recommendations (IA Sugerencias)
-- ==========================================

CREATE TABLE product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  base_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  suggested_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  rule_type VARCHAR(50) DEFAULT 'manual', -- 'manual', 'ai_generated'
  weight_score DECIMAL(5,2) DEFAULT 1.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: table_sessions (Mesa Compartida)
-- ==========================================

CREATE TABLE table_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  
  pin VARCHAR(6) UNIQUE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ
);

-- ==========================================
-- TABLA: session_participants
-- ==========================================

CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
  
  user_session_id VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  color VARCHAR(7) NOT NULL,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- ==========================================
-- TABLA: orders
-- ==========================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  location_id UUID REFERENCES restaurant_locations(id) ON DELETE SET NULL,
  
  order_number VARCHAR(50) UNIQUE NOT NULL,
  order_type order_type DEFAULT 'dine_in',
  status order_status DEFAULT 'pending',
  
  -- Mesa compartida
  is_shared_session BOOLEAN DEFAULT FALSE,
  session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
  
  -- Asignación
  assigned_waiter_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  
  -- Totales
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Notas
  customer_notes TEXT,
  kitchen_notes TEXT,
  
  -- Hotel
  room_number VARCHAR(50),
  guest_name VARCHAR(255),
  
  -- Delivery
  delivery_address TEXT,
  delivery_notes TEXT,
  
  -- Timestamps de estados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: order_items
-- ==========================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Mesa compartida
  ordered_by_participant_id UUID REFERENCES session_participants(id) ON DELETE SET NULL,
  paid_by_participant_id UUID REFERENCES session_participants(id) ON DELETE SET NULL,
  gifted_by_participant_id UUID REFERENCES session_participants(id) ON DELETE SET NULL,
  
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  modifiers JSONB,
  subtotal DECIMAL(10,2) NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: payments
-- ==========================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  paid_by_participant_id UUID REFERENCES session_participants(id) ON DELETE SET NULL,
  
  amount DECIMAL(10,2) NOT NULL,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  
  stripe_payment_intent_id VARCHAR(255),
  
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: tip_distributions
-- ==========================================

CREATE TABLE tip_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  waiter_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  
  amount DECIMAL(10,2) NOT NULL,
  distribution_type tip_distribution NOT NULL,
  payout_status VARCHAR(50) DEFAULT 'pending',
  payout_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: waiter_calls
-- ==========================================

CREATE TABLE waiter_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  assigned_waiter_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  
  reason VARCHAR(50) NOT NULL,
  custom_reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  
  called_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ==========================================
-- TABLA: reservations
-- ==========================================

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50) NOT NULL,
  
  party_size INT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INT DEFAULT 90,
  
  status reservation_status DEFAULT 'pending',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: customer_metrics (CRM futuro)
-- ==========================================

CREATE TABLE customer_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_identifier VARCHAR(255) NOT NULL,
  
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  average_ticket DECIMAL(10,2) DEFAULT 0,
  last_visit TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, customer_identifier)
);

-- ==========================================
-- ÍNDICES
-- ==========================================

-- Restaurants
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_plan ON restaurants(plan_tier);

-- Locations
CREATE INDEX idx_locations_restaurant ON restaurant_locations(restaurant_id);

-- Tables
CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX idx_tables_qr ON tables(qr_slug);
CREATE INDEX idx_tables_status ON tables(status);

-- Products
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);

-- Orders
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_table ON orders(table_id);

-- Payments
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_restaurant ON payments(restaurant_id);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas principales
CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_restaurant_config_updated_at
  BEFORE UPDATE ON restaurant_config FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Calcular pricing automáticamente
CREATE OR REPLACE FUNCTION calculate_pricing()
RETURNS TRIGGER AS $$
BEGIN
  -- Precio base según plan
  IF NEW.plan_tier = 'basic' THEN NEW.base_price := 49.00;
  ELSIF NEW.plan_tier = 'pro' THEN NEW.base_price := 99.00;
  ELSIF NEW.plan_tier = 'premium' THEN NEW.base_price := 150.00;
  END IF;
  
  -- Descuento según locales
  IF NEW.total_locations = 1 THEN
    NEW.location_discount_percent := 0;
  ELSIF NEW.total_locations <= 5 THEN
    NEW.location_discount_percent := 5;
  ELSE
    NEW.location_discount_percent := 10;
  END IF;
  
  -- Total mensual = precio_base × total_locations × (1 - descuento/100)
  NEW.monthly_total := NEW.base_price 
    * NEW.total_locations 
    * (1 - NEW.location_discount_percent / 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_pricing
  BEFORE INSERT OR UPDATE OF plan_tier, total_locations ON restaurants
  FOR EACH ROW EXECUTE FUNCTION calculate_pricing();

-- Distribuir propinas automáticamente
CREATE OR REPLACE FUNCTION distribute_tips()
RETURNS TRIGGER AS $$
DECLARE
  config_record RECORD;
  order_record RECORD;
  waiter_count INT;
BEGIN
  IF NEW.tip_amount <= 0 THEN RETURN NEW; END IF;
  
  SELECT rc.* INTO config_record 
  FROM restaurant_config rc WHERE rc.restaurant_id = NEW.restaurant_id;
  
  SELECT o.* INTO order_record 
  FROM orders o WHERE o.id = NEW.order_id;
  
  IF (config_record.staff_settings->>'tips_distribution') = 'individual' THEN
    IF order_record.assigned_waiter_id IS NOT NULL THEN
      INSERT INTO tip_distributions (restaurant_id, payment_id, waiter_id, amount, distribution_type)
      VALUES (NEW.restaurant_id, NEW.id, order_record.assigned_waiter_id, NEW.tip_amount, 'individual');
    END IF;
  ELSE
    SELECT COUNT(*) INTO waiter_count FROM staff_members
    WHERE restaurant_id = NEW.restaurant_id AND role = 'waiter' AND is_active = TRUE;
    
    IF waiter_count > 0 THEN
      INSERT INTO tip_distributions (restaurant_id, payment_id, waiter_id, amount, distribution_type)
      SELECT NEW.restaurant_id, NEW.id, id, NEW.tip_amount / waiter_count, 'shared'
      FROM staff_members
      WHERE restaurant_id = NEW.restaurant_id AND role = 'waiter' AND is_active = TRUE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_distribute_tips
  AFTER INSERT ON payments FOR EACH ROW
  EXECUTE FUNCTION distribute_tips();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

-- Habilitar RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Owner puede hacer todo en su restaurant
CREATE POLICY owner_all ON restaurants
  FOR ALL USING (owner_id = auth.uid());

-- Staff puede ver su restaurant
CREATE POLICY staff_select ON restaurants
  FOR SELECT USING (
    id IN (SELECT restaurant_id FROM staff_members WHERE user_id = auth.uid())
  );

-- Public puede ver productos activos
CREATE POLICY public_view_products ON products
  FOR SELECT USING (
    is_available = TRUE AND 
    EXISTS (
      SELECT 1 FROM restaurants r 
      WHERE r.id = products.restaurant_id 
      AND r.is_active = TRUE 
      AND r.is_accepting_orders = TRUE
    )
  );
