-- ============================================================================
-- QUICK VERIFICATION - Check that database is properly installed
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
    has_rls BOOLEAN;
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN RÁPIDA DE LA BASE DE DATOS ===';
    RAISE NOTICE '';
    
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '📊 Tablas: % (esperado: 14)', table_count;
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE '⚡ Índices: % (esperado: 30+)', index_count;
    
    -- Count functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc
    WHERE proname IN (
        'update_updated_at_column',
        'generate_order_number',
        'check_plan_limits',
        'check_multiple_locations',
        'calculate_waiter_call_priority',
        'check_order_rate_limit',
        'get_restaurant_menu'
    );
    
    RAISE NOTICE '⚙️  Funciones: % (esperado: 7)', function_count;
    
    -- Check RLS on restaurants
    SELECT rowsecurity INTO has_rls
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'restaurants';
    
    IF has_rls THEN
        RAISE NOTICE '🔒 RLS: Habilitado ✅';
    ELSE
        RAISE NOTICE '🔒 RLS: Deshabilitado ❌';
    END IF;
    
    RAISE NOTICE '';
    
    -- Final verdict
    IF table_count >= 14 AND index_count >= 30 AND function_count = 7 AND has_rls THEN
        RAISE NOTICE '╔════════════════════════════════════╗';
        RAISE NOTICE '║  ✅ BASE DE DATOS CORRECTA         ║';
        RAISE NOTICE '╚════════════════════════════════════╝';
        RAISE NOTICE '';
        RAISE NOTICE '¡Todo perfecto! Base de datos lista para usar. 🚀';
    ELSE
        RAISE NOTICE '⚠️  Algunos elementos pueden faltar.';
        RAISE NOTICE 'Revisa los números arriba.';
    END IF;
    
END $$;

-- Show all tables created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
