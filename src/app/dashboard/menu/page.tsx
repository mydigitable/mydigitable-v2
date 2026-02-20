import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedMenuManager } from './components/UnifiedMenuManager'

export default async function MenuPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) redirect('/onboarding')

    // Fetch TODO en una sola query
    const { data: menuData } = await supabase
        .from('menus')
        .select(`
      *,
      categories:menu_categories(
        *,
        products(
          *
        )
      )
    `)
        .eq('restaurant_id', restaurant.id)
        .order('display_order')

    // Fetch design config
    const { data: designConfig } = await supabase
        .from('restaurant_design_config')
        .select(`
      *,
      selected_theme:menu_themes(*)
    `)
        .eq('restaurant_id', restaurant.id)
        .single()

    // Fetch all themes
    const { data: themes } = await supabase
        .from('menu_themes')
        .select('*')
        .order('display_order')

    return (
        <UnifiedMenuManager
            restaurant={restaurant}
            menus={menuData || []}
            designConfig={designConfig}
            themes={themes || []}
        />
    )
}
