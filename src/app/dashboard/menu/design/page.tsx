import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DesignStudio } from './components/DesignStudio'

export default async function DesignPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) redirect('/onboarding')

    // Get design config con tema
    const { data: designConfig } = await supabase
        .from('restaurant_design_config')
        .select(`
      *,
      selected_theme:menu_themes(*)
    `)
        .eq('restaurant_id', restaurant.id)
        .single()

    // Get todos los temas disponibles
    const { data: themes } = await supabase
        .from('menu_themes')
        .select('*')
        .order('display_order')

    // Get menus para preview
    const { data: menus } = await supabase
        .from('menus')
        .select(`
      *,
      categories:menu_categories(
        *,
        products(*)
      )
    `)
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('display_order')

    return (
        <DesignStudio
            restaurant={restaurant}
            designConfig={designConfig}
            themes={themes || []}
            menus={menus || []}
        />
    )
}
