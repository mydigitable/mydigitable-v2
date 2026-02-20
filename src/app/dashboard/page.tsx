
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardModernClient } from "@/components/dashboard/modern/DashboardModernClient"

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/login")
    }

    // 1. Obtener restaurante del usuario
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) {
        return redirect("/onboarding")
    }

    // Fecha de hoy para filtros (ISO format YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]

    // Ejecutar queries en paralelo para máxima velocidad
    const [
        tablesResult,
        activeOrdersResult,
        todayOrdersResult,
        waiterCallsResult,
        onboardingResult
    ] = await Promise.allSettled([
        // 1. Mesas (Todas)
        supabase.from('tables').select('*').eq('restaurant_id', restaurant.id).order('number'),

        // 2. Pedidos Activos (Para la lista y contador)
        supabase.from('orders')
            .select('id, table_id, status, total_amount, created_at')
            .eq('restaurant_id', restaurant.id)
            .in('status', ['pending', 'preparing', 'ready'])
            .order('created_at', { ascending: false })
            .limit(10),

        // 3. Pedidos de Hoy (Para ventas totales)
        supabase.from('orders')
            .select('total_amount, created_at')
            .eq('restaurant_id', restaurant.id)
            .gte('created_at', `${today}T00:00:00`)
            .neq('status', 'cancelled'), // Incluimos completed y activos para "Ventas Hoy" proyeccion

        // 4. Llamadas al mozo
        supabase.from('service_requests')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('status', 'pending'),

        // 5. Onboarding status (si es necesario para alguna lógica futura)
        supabase.from('onboarding_progress').select('*').eq('restaurant_id', restaurant.id).single()
    ])

    // Procesar resultados
    const tables = tablesResult.status === 'fulfilled' ? tablesResult.value.data || [] : []
    const activeOrders = activeOrdersResult.status === 'fulfilled' ? activeOrdersResult.value.data || [] : []
    const todayOrders = todayOrdersResult.status === 'fulfilled' ? todayOrdersResult.value.data || [] : []
    const waiterCalls = waiterCallsResult.status === 'fulfilled' ? waiterCallsResult.value.data || [] : []

    // Calcular métricas
    const todayRevenue = todayOrders.reduce((acc, order) => acc + (order.total_amount || 0), 0)
    const averageTicket = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0
    const onboardingSteps = onboardingResult.status === 'fulfilled' && onboardingResult.value.data ? onboardingResult.value.data.completed_steps : 0


    const initialData = {
        user,
        restaurant,
        tables,
        activeOrders, // Lista de pedidos recientes/activos
        waiterCalls,
        stats: {
            todayRevenue,
            todayOrders: todayOrders.length,
            averageTicket,
            activeOrdersCount: activeOrders.length,
        },
        onboardingSteps
    }

    return <DashboardModernClient initialData={initialData} />
}
