import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MenuWizard } from './MenuWizard'

export default async function MenuWizardPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) redirect('/onboarding')

    // Fetch menu with categories and products
    const { data: menu } = await supabase
        .from('menus')
        .select(`
            *,
            categories:menu_categories(
                *,
                products(*)
            )
        `)
        .eq('id', params.id)
        .eq('restaurant_id', restaurant.id)
        .single()

    if (!menu) redirect('/dashboard/menu/menus')

    // Fetch design config with theme
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
        <MenuWizard
            restaurant={restaurant}
            menu={menu}
            designConfig={designConfig}
            themes={themes || []}
        />
    )
}
