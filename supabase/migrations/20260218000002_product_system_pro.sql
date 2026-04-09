-- ============================================
-- SISTEMA DE PRODUCTOS PROFESIONAL
-- MyDigitable V5 - Feb 2026
-- ============================================
-- NOTA: DROP + CREATE para evitar conflictos
-- con tablas pre-existentes de intentos anteriores

-- Asegurar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- LIMPIAR TABLAS ANTERIORES (si existen)
-- =============================================
DROP TABLE IF EXISTS product_recommendations CASCADE;
DROP TABLE IF EXISTS price_rules CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;

-- =============================================
-- 1. VARIANTES DE PRODUCTOS
-- =============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10,2) NOT NULL DEFAULT 0,
  attributes JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. REGLAS DE PRECIO DINÁMICO
-- =============================================
CREATE TABLE price_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('location', 'time', 'day', 'customer_type')),
  condition_value JSONB NOT NULL,
  price_modifier_type TEXT NOT NULL CHECK (price_modifier_type IN ('fixed', 'percentage')),
  price_modifier_value DECIMAL(10,2) NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. RECOMENDACIONES DE PRODUCTOS
-- =============================================
CREATE TABLE product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recommended_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('similar', 'combo', 'upsell', 'cross-sell')),
  reason TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, recommended_product_id)
);

-- =============================================
-- 4. NUEVOS CAMPOS EN PRODUCTS
-- =============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_generated_description BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_generated_image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_hours JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS times_ordered INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_ordered_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_prep_time BOOLEAN DEFAULT false;

-- =============================================
-- 5. NUEVOS CAMPOS EN RESTAURANTS
-- =============================================
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS show_prep_times_globally BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS default_prep_time INTEGER DEFAULT 15;

-- =============================================
-- 6. ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_price_rules_product ON price_rules(product_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_product ON product_recommendations(product_id);

-- =============================================
-- 7. TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_rules_updated_at
    BEFORE UPDATE ON price_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 8. RLS POLICIES
-- =============================================

-- === product_variants ===
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "variants_select_owner"
ON product_variants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = product_variants.product_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "variants_insert_owner"
ON product_variants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = product_variants.product_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "variants_update_owner"
ON product_variants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = product_variants.product_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "variants_delete_owner"
ON product_variants FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = product_variants.product_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "variants_select_public"
ON product_variants FOR SELECT
USING (is_available = true);

-- === price_rules ===
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_rules_select_owner"
ON price_rules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = price_rules.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "price_rules_insert_owner"
ON price_rules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = price_rules.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "price_rules_update_owner"
ON price_rules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = price_rules.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "price_rules_delete_owner"
ON price_rules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = price_rules.restaurant_id
    AND r.owner_id = auth.uid()
  )
);

-- === product_recommendations ===
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recommendations_select_owner"
ON product_recommendations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = product_recommendations.product_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "recommendations_insert_owner"
ON product_recommendations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = product_recommendations.product_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "recommendations_update_owner"
ON product_recommendations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = product_recommendations.product_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "recommendations_delete_owner"
ON product_recommendations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = product_recommendations.product_id
    AND r.owner_id = auth.uid()
  )
);

CREATE POLICY "recommendations_select_public"
ON product_recommendations FOR SELECT
USING (true);

-- Comentarios
COMMENT ON TABLE product_variants IS 'Variantes de productos (tamaños, versiones) con modificador de precio';
COMMENT ON TABLE price_rules IS 'Reglas de precio dinámico por ubicación, horario, día o tipo de cliente';
COMMENT ON TABLE product_recommendations IS 'Recomendaciones entre productos: similar, combo, upsell, cross-sell';
