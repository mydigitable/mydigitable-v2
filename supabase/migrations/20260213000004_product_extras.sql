-- =====================================================
-- FASE 1: Sistema de Extras para Productos
-- =====================================================
-- Este script crea las tablas necesarias para gestionar
-- extras, modificadores y opciones de productos

-- Tabla: product_extra_groups
-- Agrupa extras relacionados (ej: "Elige tu proteína")
CREATE TABLE IF NOT EXISTS product_extra_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name JSONB NOT NULL, -- {"es": "Elige tu proteína", "en": "Choose your protein"}
  description JSONB, -- {"es": "Selecciona una opción", "en": "Select one option"}
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: product_extras
-- Extras individuales (simples o dentro de grupos)
CREATE TABLE IF NOT EXISTS product_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  group_id UUID REFERENCES product_extra_groups(id) ON DELETE CASCADE,
  name JSONB NOT NULL, -- {"es": "Bacon extra", "en": "Extra bacon"}
  description JSONB, -- {"es": "Tiras de bacon crujiente", "en": "Crispy bacon strips"}
  price DECIMAL(10,2) DEFAULT 0.00,
  type TEXT NOT NULL CHECK (type IN ('addon', 'modifier', 'cooking_point', 'option')),
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_product_extras_product_id ON product_extras(product_id);
CREATE INDEX IF NOT EXISTS idx_product_extras_group_id ON product_extras(group_id);
CREATE INDEX IF NOT EXISTS idx_product_extra_groups_product_id ON product_extra_groups(product_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_product_extras_updated_at ON product_extras;
CREATE TRIGGER update_product_extras_updated_at
    BEFORE UPDATE ON product_extras
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_extra_groups_updated_at ON product_extra_groups;
CREATE TRIGGER update_product_extra_groups_updated_at
    BEFORE UPDATE ON product_extra_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para product_extras
ALTER TABLE product_extras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view extras for their restaurant products" ON product_extras;
CREATE POLICY "Users can view extras for their restaurant products"
ON product_extras FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN menu_categories mc ON p.category_id = mc.id
    JOIN menus m ON mc.menu_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE p.id = product_extras.product_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert extras for their restaurant products" ON product_extras;
CREATE POLICY "Users can insert extras for their restaurant products"
ON product_extras FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    JOIN menu_categories mc ON p.category_id = mc.id
    JOIN menus m ON mc.menu_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE p.id = product_extras.product_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update extras for their restaurant products" ON product_extras;
CREATE POLICY "Users can update extras for their restaurant products"
ON product_extras FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN menu_categories mc ON p.category_id = mc.id
    JOIN menus m ON mc.menu_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE p.id = product_extras.product_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete extras for their restaurant products" ON product_extras;
CREATE POLICY "Users can delete extras for their restaurant products"
ON product_extras FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN menu_categories mc ON p.category_id = mc.id
    JOIN menus m ON mc.menu_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE p.id = product_extras.product_id
    AND r.owner_id = auth.uid()
  )
);

-- RLS Policies para product_extra_groups
ALTER TABLE product_extra_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view extra groups for their restaurant products" ON product_extra_groups;
CREATE POLICY "Users can view extra groups for their restaurant products"
ON product_extra_groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN menu_categories mc ON p.category_id = mc.id
    JOIN menus m ON mc.menu_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE p.id = product_extra_groups.product_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert extra groups for their restaurant products" ON product_extra_groups;
CREATE POLICY "Users can insert extra groups for their restaurant products"
ON product_extra_groups FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    JOIN menu_categories mc ON p.category_id = mc.id
    JOIN menus m ON mc.menu_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE p.id = product_extra_groups.product_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update extra groups for their restaurant products" ON product_extra_groups;
CREATE POLICY "Users can update extra groups for their restaurant products"
ON product_extra_groups FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN menu_categories mc ON p.category_id = mc.id
    JOIN menus m ON mc.menu_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE p.id = product_extra_groups.product_id
    AND r.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete extra groups for their restaurant products" ON product_extra_groups;
CREATE POLICY "Users can delete extra groups for their restaurant products"
ON product_extra_groups FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN menu_categories mc ON p.category_id = mc.id
    JOIN menus m ON mc.menu_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE p.id = product_extra_groups.product_id
    AND r.owner_id = auth.uid()
  )
);

-- Comentarios para documentación
COMMENT ON TABLE product_extras IS 'Extras, modificadores y opciones para productos del menú';
COMMENT ON TABLE product_extra_groups IS 'Grupos de extras relacionados (ej: Elige tu proteína)';
COMMENT ON COLUMN product_extras.type IS 'Tipo: addon (extra simple), modifier (modificador), cooking_point (punto de cocción), option (opción de grupo)';
COMMENT ON COLUMN product_extra_groups.min_selections IS 'Mínimo de opciones que el cliente debe seleccionar';
COMMENT ON COLUMN product_extra_groups.max_selections IS 'Máximo de opciones que el cliente puede seleccionar';
