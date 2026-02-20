-- ====================================
-- MYDIGITABLE - TABLAS DE PLATAFORMA (Nivel SaaS)
-- ====================================
-- Estas tablas son para María (dueña de MyDigitable)
-- Gestiona suscripciones, comisiones, vendedores

-- ====================================
-- 1. CONFIGURACIÓN GLOBAL DE LA PLATAFORMA
-- ====================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform_name VARCHAR(100) DEFAULT 'MyDigitable',
    support_email VARCHAR(255) DEFAULT 'soporte@mydigitable.com',
    support_phone VARCHAR(50),
    
    -- Comisiones
    commission_rate_starter DECIMAL(5,2) DEFAULT 0.15, -- 15% para plan Starter
    
    -- Precios de planes (EUR)
    price_starter_monthly DECIMAL(10,2) DEFAULT 0.00,
    price_starter_yearly DECIMAL(10,2) DEFAULT 0.00,
    price_basic_monthly DECIMAL(10,2) DEFAULT 40.00,
    price_basic_yearly DECIMAL(10,2) DEFAULT 384.00, -- 20% descuento anual
    price_pro_monthly DECIMAL(10,2) DEFAULT 90.00,
    price_pro_yearly DECIMAL(10,2) DEFAULT 864.00, -- 20% descuento anual
    
    -- Stripe de la plataforma
    stripe_account_id VARCHAR(255),
    stripe_webhook_secret VARCHAR(255),
    
    -- Configuración
    default_currency VARCHAR(3) DEFAULT 'EUR',
    default_timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO public.platform_settings (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ====================================
-- 2. USUARIOS ADMIN DE LA PLATAFORMA
-- ====================================
CREATE TABLE IF NOT EXISTS public.platform_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar a María como super_admin
-- (Ejecutar después de que María tenga cuenta en auth.users)
-- INSERT INTO public.platform_admins (user_id, email, name, role)
-- SELECT id, email, 'María Gustina', 'super_admin'
-- FROM auth.users WHERE email = 'mariagustina.rod@gmail.com';

-- ====================================
-- 3. VENDEDORES (Equipo comercial de María)
-- ====================================
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Datos del vendedor
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    
    -- Comisiones del vendedor
    commission_rate DECIMAL(5,2) DEFAULT 0.10, -- 10% de la venta
    commission_type VARCHAR(20) DEFAULT 'first_year' 
        CHECK (commission_type IN ('first_sale', 'first_year', 'lifetime')),
    
    -- Estado
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    
    -- Métricas (actualizadas por triggers)
    total_sales INTEGER DEFAULT 0,
    total_restaurants INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_earned DECIMAL(12,2) DEFAULT 0,
    
    -- Datos adicionales
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 4. SUSCRIPCIONES (Cada restaurante tiene una)
-- ====================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
    
    -- Plan actual
    plan VARCHAR(20) NOT NULL DEFAULT 'starter' 
        CHECK (plan IN ('starter', 'basic', 'pro')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' 
        CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Estado
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')),
    
    -- Período actual
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Cancelación
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Stripe
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    
    -- Vendedor que cerró la venta
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    
    -- Historial
    previous_plan VARCHAR(20),
    plan_changed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 5. PAGOS DE SUSCRIPCIONES (Ingresos de María)
-- ====================================
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    
    -- Monto
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Estado
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    
    -- Tipo de pago
    payment_type VARCHAR(20) DEFAULT 'subscription'
        CHECK (payment_type IN ('subscription', 'upgrade', 'one_time')),
    
    -- Stripe
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Facturación
    invoice_number VARCHAR(50),
    invoice_url TEXT,
    
    -- Fechas
    paid_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 6. COMISIONES DE PLATAFORMA (15% de plan Starter)
-- ====================================
CREATE TABLE IF NOT EXISTS public.platform_commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Montos
    order_total DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.15, -- 15%
    commission_amount DECIMAL(10,2) NOT NULL, -- order_total * commission_rate
    
    -- Estado
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'collected', 'paid', 'failed', 'waived')),
    
    -- Stripe Transfer
    stripe_transfer_id VARCHAR(255),
    
    -- Fechas
    collected_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 7. VENTAS DE VENDEDORES (Comisiones para el equipo comercial)
-- ====================================
CREATE TABLE IF NOT EXISTS public.seller_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Detalles de la venta
    plan_sold VARCHAR(20) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    sale_amount DECIMAL(10,2) NOT NULL, -- Monto total de la suscripción
    
    -- Comisión del vendedor
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    
    -- Estado del pago al vendedor
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    
    -- Fechas
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 8. MÉTRICAS DE PLATAFORMA (Agregados diarios)
-- ====================================
CREATE TABLE IF NOT EXISTS public.platform_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- Restaurantes
    total_restaurants INTEGER DEFAULT 0,
    new_restaurants INTEGER DEFAULT 0,
    churned_restaurants INTEGER DEFAULT 0,
    
    -- Por plan
    restaurants_starter INTEGER DEFAULT 0,
    restaurants_basic INTEGER DEFAULT 0,
    restaurants_pro INTEGER DEFAULT 0,
    
    -- Ingresos
    mrr DECIMAL(12,2) DEFAULT 0, -- Monthly Recurring Revenue
    subscription_revenue DECIMAL(12,2) DEFAULT 0,
    commission_revenue DECIMAL(12,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Pedidos en plataforma
    total_orders INTEGER DEFAULT 0,
    total_gmv DECIMAL(12,2) DEFAULT 0, -- Gross Merchandise Value
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 9. ACTUALIZAR TABLA RESTAURANTS
-- ====================================

-- Añadir columnas de suscripción y negocio
DO $$ 
BEGIN
    -- Vendedor que captó el restaurante
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'seller_id') THEN
        ALTER TABLE public.restaurants ADD COLUMN seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;
    END IF;

    -- Datos de facturación
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'business_name') THEN
        ALTER TABLE public.restaurants ADD COLUMN business_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'tax_id') THEN
        ALTER TABLE public.restaurants ADD COLUMN tax_id VARCHAR(50); -- CIF/NIF
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'billing_email') THEN
        ALTER TABLE public.restaurants ADD COLUMN billing_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'billing_address') THEN
        ALTER TABLE public.restaurants ADD COLUMN billing_address TEXT;
    END IF;

    -- Stripe Connect (para recibir pagos)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'stripe_account_id') THEN
        ALTER TABLE public.restaurants ADD COLUMN stripe_account_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'stripe_account_status') THEN
        ALTER TABLE public.restaurants ADD COLUMN stripe_account_status VARCHAR(20) DEFAULT 'pending';
    END IF;

    -- Estado de onboarding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.restaurants ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'onboarding_step') THEN
        ALTER TABLE public.restaurants ADD COLUMN onboarding_step INTEGER DEFAULT 0;
    END IF;

    -- Fecha de baja
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'cancelled_at') THEN
        ALTER TABLE public.restaurants ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE public.restaurants ADD COLUMN cancellation_reason TEXT;
    END IF;
END $$;

-- ====================================
-- ROW LEVEL SECURITY
-- ====================================

-- Platform Settings: Solo super_admin puede modificar
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- Platform Admins: Solo super_admin puede gestionar
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins can manage platform admins" ON public.platform_admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );
CREATE POLICY "Admins can read their own record" ON public.platform_admins
    FOR SELECT USING (user_id = auth.uid());

-- Sellers: Solo admins pueden gestionar
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage sellers" ON public.sellers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins 
            WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

-- Subscriptions: Admins ven todo, restaurantes solo la suya
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins 
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Restaurants can view own subscription" ON public.subscriptions
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        )
    );

-- Subscription Payments: Admins ven todo
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all payments" ON public.subscription_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins 
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Restaurants can view own payments" ON public.subscription_payments
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        )
    );

-- Platform Commissions: Solo admins
ALTER TABLE public.platform_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage commissions" ON public.platform_commissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Seller Sales: Solo admins
ALTER TABLE public.seller_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage seller sales" ON public.seller_sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Platform Metrics: Solo admins
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view platform metrics" ON public.platform_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins 
            WHERE user_id = auth.uid()
        )
    );

-- ====================================
-- ÍNDICES
-- ====================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant ON public.subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_seller ON public.subscriptions(seller_id);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_restaurant ON public.subscription_payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON public.subscription_payments(status);

CREATE INDEX IF NOT EXISTS idx_platform_commissions_restaurant ON public.platform_commissions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_platform_commissions_order ON public.platform_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_platform_commissions_status ON public.platform_commissions(status);

CREATE INDEX IF NOT EXISTS idx_seller_sales_seller ON public.seller_sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_sales_restaurant ON public.seller_sales(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON public.platform_metrics(date);

CREATE INDEX IF NOT EXISTS idx_restaurants_seller ON public.restaurants(seller_id);

-- ====================================
-- TRIGGER: Calcular comisión cuando se crea pedido (plan Starter)
-- ====================================
CREATE OR REPLACE FUNCTION calculate_platform_commission()
RETURNS TRIGGER AS $$
DECLARE
    restaurant_plan VARCHAR(20);
    commission_rate DECIMAL(5,2);
BEGIN
    -- Obtener plan del restaurante
    SELECT s.plan INTO restaurant_plan
    FROM public.subscriptions s
    WHERE s.restaurant_id = NEW.restaurant_id
    AND s.status = 'active';
    
    -- Solo cobrar comisión en plan Starter
    IF restaurant_plan = 'starter' THEN
        -- Obtener tasa de comisión de la plataforma
        SELECT ps.commission_rate_starter INTO commission_rate
        FROM public.platform_settings ps
        LIMIT 1;
        
        IF commission_rate IS NULL THEN
            commission_rate := 0.15; -- Default 15%
        END IF;
        
        -- Crear registro de comisión
        INSERT INTO public.platform_commissions (
            restaurant_id,
            order_id,
            order_total,
            commission_rate,
            commission_amount,
            status
        ) VALUES (
            NEW.restaurant_id,
            NEW.id,
            NEW.total,
            commission_rate,
            NEW.total * commission_rate,
            'pending'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_commission ON public.orders;
CREATE TRIGGER trigger_calculate_commission
    AFTER INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.status != 'cancelled' AND NEW.total > 0)
    EXECUTE FUNCTION calculate_platform_commission();

-- ====================================
-- TRIGGER: Actualizar métricas de vendedor
-- ====================================
CREATE OR REPLACE FUNCTION update_seller_metrics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.sellers
    SET 
        total_sales = total_sales + 1,
        total_revenue = total_revenue + NEW.sale_amount,
        total_earned = total_earned + NEW.commission_amount,
        updated_at = NOW()
    WHERE id = NEW.seller_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_seller_metrics ON public.seller_sales;
CREATE TRIGGER trigger_update_seller_metrics
    AFTER INSERT ON public.seller_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_metrics();

-- ====================================
-- FUNCIÓN: Crear suscripción automática al registrar restaurante
-- ====================================
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (
        restaurant_id,
        plan,
        status,
        current_period_start
    ) VALUES (
        NEW.id,
        COALESCE(NEW.subscription_plan, 'starter'),
        'active',
        NOW()
    )
    ON CONFLICT (restaurant_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_subscription ON public.restaurants;
CREATE TRIGGER trigger_create_subscription
    AFTER INSERT ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION create_default_subscription();

-- ====================================
-- RESUMEN DE TABLAS CREADAS
-- ====================================
-- 1. platform_settings    - Configuración global (precios, comisiones)
-- 2. platform_admins      - María y su equipo admin
-- 3. sellers              - Vendedores/comerciales
-- 4. subscriptions        - Suscripción de cada restaurante
-- 5. subscription_payments - Pagos de suscripciones (ingresos María)
-- 6. platform_commissions - Comisiones 15% de plan Starter
-- 7. seller_sales         - Ventas y comisiones de vendedores
-- 8. platform_metrics     - Métricas agregadas diarias
--
-- COLUMNAS AÑADIDAS A restaurants:
-- - seller_id, business_name, tax_id, billing_email, billing_address
-- - stripe_account_id, stripe_account_status
-- - onboarding_completed, onboarding_step
-- - cancelled_at, cancellation_reason
