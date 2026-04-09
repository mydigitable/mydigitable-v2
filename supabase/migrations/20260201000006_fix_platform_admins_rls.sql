-- =====================================================
-- FIX: Permitir que platform_admins pueda ser leído por el user autenticado
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Eliminar políticas existentes que causan el problema circular
DROP POLICY IF EXISTS "Super admins can manage platform admins" ON public.platform_admins;
DROP POLICY IF EXISTS "Admins can read their own record" ON public.platform_admins;

-- Nueva política: usuarios pueden leer su propio registro
CREATE POLICY "Users can read own admin record" ON public.platform_admins
    FOR SELECT 
    USING (user_id = auth.uid());

-- Nueva política: super_admins pueden hacer todo
CREATE POLICY "Super admins full access" ON public.platform_admins
    FOR ALL 
    USING (
        user_id = auth.uid() 
        OR 
        EXISTS (
            SELECT 1 FROM public.platform_admins pa
            WHERE pa.user_id = auth.uid() AND pa.role = 'super_admin'
        )
    );

-- Verificar que la tabla tiene RLS habilitado
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Verificar los registros existentes
SELECT * FROM public.platform_admins;
