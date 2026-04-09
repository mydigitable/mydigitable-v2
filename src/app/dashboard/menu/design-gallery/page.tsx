import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DesignGallery } from './DesignGallery'

export const metadata = { title: 'Galería de Diseños — MyDigitable' }

export default async function DesignGalleryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: restaurantRaw } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!restaurantRaw) redirect('/onboarding')

    // Cast to include fields that exist in DB but may not be in generated types
    const restaurant = restaurantRaw as typeof restaurantRaw & {
        business_name?: string
        slug?: string
    }

    // Try to get real menus with categories + products for the previews
    const { data: menus } = await supabase
        .from('menus')
        .select(`
            id, name,
            categories:menu_categories(
                id, name, display_order, layout_type, grid_columns,
                show_images, show_prices, show_descriptions,
                products(
                    id, name, description, price, image_url,
                    is_available, is_featured, featured_badge
                )
            )
        `)
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('display_order')
        .limit(3)

    return (
        <DesignGallery
            restaurant={restaurant}
            realMenus={menus ?? []}
        />
    )
}
