-- ============================================================
-- MYDIGITABLE — Tablas fantasma: crear las que faltan en Supabase
-- Generado: 2026-02-20
-- ============================================================
-- Tablas que el código referencia pero NO existen en la DB.
-- 9 tablas nuevas + 1 rename (staff → staff_members ya existe)
-- ============================================================

-- =====================
-- 1. platform_admins
-- =====================
-- Usado en: adminStore.ts (loadAdmin)
-- Columnas deducidas del .select('*').eq('user_id', ...)
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read own" ON platform_admins FOR SELECT USING (auth.uid() = user_id);

-- =====================
-- 2. platform_settings
-- =====================
-- Usado en: adminStore.ts (loadSettings, updateSettings)
-- Singleton — una sola fila
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name TEXT DEFAULT 'MyDigitable',
    commission_rate NUMERIC(5,2) DEFAULT 15.00,
    default_plan TEXT DEFAULT 'starter',
    trial_days INTEGER DEFAULT 14,
    support_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON platform_settings FOR ALL
    USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

-- =====================
-- 3. sellers
-- =====================
-- Usado en: adminStore.ts (CRUD completo)
-- Agentes comerciales / vendedores que refieren restaurantes
CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    commission_rate NUMERIC(5,2) DEFAULT 10.00,
    total_referrals INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON sellers FOR ALL
    USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

-- =====================
-- 4. platform_commissions
-- =====================
-- Usado en: adminStore.ts (loadCommissions), admin/page.tsx, admin/analytics/page.tsx
-- Join con restaurants(name, slug) y orders(order_number)
CREATE TABLE IF NOT EXISTS platform_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON platform_commissions FOR ALL
    USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

-- =====================
-- 5. subscriptions
-- =====================
-- Usado en: adminStore.ts (restaurants select '*, subscriptions(*)')
-- y updateRestaurantPlan (.from('subscriptions').update({ plan }))
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'starter',
    status TEXT DEFAULT 'active',
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(restaurant_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON subscriptions FOR ALL
    USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));
CREATE POLICY "Restaurant owner can view own" ON subscriptions FOR SELECT
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

-- =====================
-- 6. subscription_payments
-- =====================
-- Usado en: admin/page.tsx (.select("amount").eq("status", "succeeded"))
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'eur',
    status TEXT DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON subscription_payments FOR ALL
    USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

-- =====================
-- 7. promotions
-- =====================
-- Usado en: restaurantStore.ts (CRUD), marketing/promotions/page.tsx
-- Esquema completo deducido del interface Promotion
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'percentage',
    value NUMERIC(10,2),
    min_order NUMERIC(10,2),
    code TEXT,
    applies_to TEXT DEFAULT 'all',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    max_uses INTEGER,
    max_uses_per_customer INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_automatic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant owner CRUD" ON promotions FOR ALL
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

-- =====================
-- 9. daily_metrics
-- =====================
-- Usado en: restaurantStore.ts (.from('daily_metrics'))
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC(10,2) DEFAULT 0,
    avg_ticket NUMERIC(10,2) DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(restaurant_id, date)
);

ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant owner read" ON daily_metrics FOR SELECT
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

-- =====================
-- 10. product_assignments
-- =====================
-- Usado en: menu/[menuId]/productos/page.tsx, AssignProductsPanel.tsx
-- Vincula productos a menús específicos
CREATE TABLE IF NOT EXISTS product_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(menu_id, product_id)
);

ALTER TABLE product_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant owner CRUD" ON product_assignments FOR ALL
    USING (menu_id IN (
        SELECT m.id FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE r.owner_id = auth.uid()
    ));

-- ============================================================
-- NOTA: "staff" → "staff_members"
-- ============================================================
-- El código en staff/page.tsx usa .from("staff") pero la DB tiene
-- "staff_members". Esto requiere cambiar el código, NO crear tabla.
-- Se resuelve renombrando en el código: .from("staff") → .from("staff_members")
--
-- Alternativa: crear un VIEW
-- CREATE OR REPLACE VIEW staff AS SELECT * FROM staff_members;
-- ============================================================
