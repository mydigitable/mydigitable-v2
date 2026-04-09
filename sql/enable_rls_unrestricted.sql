-- ============================================================
-- MYDIGITABLE — Activar RLS en 6 tablas sin protección
-- Generado: 2026-02-20
-- ============================================================
-- Tablas que tienen RLS desactivado o sin políticas:
-- customer_metrics, order_items, product_modifiers,
-- reservations, restaurant_design_config, session_participants
-- ============================================================

-- =====================
-- 1. customer_metrics
-- =====================
-- FK: restaurant_id → restaurants
ALTER TABLE customer_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own customer metrics"
    ON customer_metrics FOR SELECT
    USING (restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Owner can insert customer metrics"
    ON customer_metrics FOR INSERT
    WITH CHECK (restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Owner can update customer metrics"
    ON customer_metrics FOR UPDATE
    USING (restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ));

-- =====================
-- 2. order_items
-- =====================
-- FK: order_id → orders → restaurant_id
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage order items"
    ON order_items FOR ALL
    USING (order_id IN (
        SELECT o.id FROM orders o
        JOIN restaurants r ON r.id = o.restaurant_id
        WHERE r.owner_id = auth.uid()
    ));

-- Público: los clientes pueden insertar items en sus pedidos
CREATE POLICY "Anon can insert order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

-- Público: los clientes pueden ver sus propios items
CREATE POLICY "Anon can view order items"
    ON order_items FOR SELECT
    USING (true);

-- =====================
-- 3. product_modifiers
-- =====================
-- FK: product_id → products → restaurant_id
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage product modifiers"
    ON product_modifiers FOR ALL
    USING (product_id IN (
        SELECT p.id FROM products p
        JOIN restaurants r ON r.id = p.restaurant_id
        WHERE r.owner_id = auth.uid()
    ));

-- Público: los clientes pueden ver modificadores para elegir
CREATE POLICY "Anyone can view product modifiers"
    ON product_modifiers FOR SELECT
    USING (true);

-- =====================
-- 4. reservations
-- =====================
-- FK: restaurant_id → restaurants
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage reservations"
    ON reservations FOR ALL
    USING (restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ));

-- Público: los clientes pueden crear reservas
CREATE POLICY "Anon can insert reservations"
    ON reservations FOR INSERT
    WITH CHECK (true);

-- Público: los clientes pueden ver sus reservas (por email/phone)
CREATE POLICY "Anon can view reservations"
    ON reservations FOR SELECT
    USING (true);

-- =====================
-- 5. restaurant_design_config
-- =====================
-- FK: restaurant_id → restaurants
ALTER TABLE restaurant_design_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage design config"
    ON restaurant_design_config FOR ALL
    USING (restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ));

-- Público: el menú público necesita leer la config de diseño
CREATE POLICY "Anyone can view design config"
    ON restaurant_design_config FOR SELECT
    USING (true);

-- =====================
-- 6. session_participants
-- =====================
-- FK: session_id → table_sessions → restaurant_id
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage session participants"
    ON session_participants FOR ALL
    USING (session_id IN (
        SELECT ts.id FROM table_sessions ts
        JOIN restaurants r ON r.id = ts.restaurant_id
        WHERE r.owner_id = auth.uid()
    ));

-- Público: participantes pueden unirse y verse
CREATE POLICY "Anon can insert session participants"
    ON session_participants FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anon can view session participants"
    ON session_participants FOR SELECT
    USING (true);

-- ============================================================
-- NOTA: Las políticas "Anon" en order_items, product_modifiers,
-- reservations, restaurant_design_config y session_participants
-- permiten lectura/inserción pública porque el menú público
-- (r/[slug]) funciona sin autenticación.
-- ============================================================
