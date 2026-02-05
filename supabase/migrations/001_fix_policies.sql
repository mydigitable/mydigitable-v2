-- =============================================
-- MIGRACIÓN: Arreglar políticas duplicadas
-- Ejecutar ANTES del schema.sql principal
-- =============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Owners can manage their categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Owners can manage their products" ON public.products;
DROP POLICY IF EXISTS "Owners can view their menus" ON public.menus;
DROP POLICY IF EXISTS "Owners can manage their menus" ON public.menus;
DROP POLICY IF EXISTS "Owners can view their tables" ON public.tables;
DROP POLICY IF EXISTS "Owners can manage their tables" ON public.tables;
DROP POLICY IF EXISTS "Owners can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Owners can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Owners can view their waiter calls" ON public.waiter_calls;
DROP POLICY IF EXISTS "Public can create waiter calls" ON public.waiter_calls;
DROP POLICY IF EXISTS "Owners can view their staff" ON public.staff;
DROP POLICY IF EXISTS "Owners can manage their staff" ON public.staff;
DROP POLICY IF EXISTS "Owners can view their customers" ON public.customers;
DROP POLICY IF EXISTS "Public can create customers" ON public.customers;
DROP POLICY IF EXISTS "Owners can view their promotions" ON public.promotions;
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Owners can view their daily metrics" ON public.daily_metrics;
DROP POLICY IF EXISTS "Owners can view their notifications" ON public.notifications;

-- Mensaje de éxito
SELECT 'Políticas eliminadas correctamente. Ahora ejecuta schema.sql' as message;
