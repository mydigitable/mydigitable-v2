'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// HELPER: Get authenticated user's restaurant
// ============================================
async function getAuthRestaurant() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { supabase, user: null, restaurant: null }

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    return { supabase, user, restaurant }
}

// ============================================
// Update global design config
// ============================================
export async function updateDesignConfig(updates: Record<string, unknown>) {
    try {
        const { supabase, user, restaurant } = await getAuthRestaurant()
        if (!user) return { success: false, error: 'No autenticado' }
        if (!restaurant) return { success: false, error: 'Restaurante no encontrado' }

        // ✅ WHITELIST: solo campos permitidos
        const allowedFields = [
            'selected_theme_id', 'custom_colors', 'layout_type', 'grid_columns',
            'card_style', 'spacing', 'spacing_value', 'border_radius', 'custom_fonts',
            'show_search', 'show_categories', 'show_images', 'show_prices',
            'show_descriptions', 'show_badges', 'show_prep_time', 'show_allergens',
            'logo_url', 'show_powered_by', 'show_featured', 'show_logo',
            'featured_style', 'header_style', 'category_style', 'card_shape',
            'header_subtitle', 'show_header',
        ]

        const sanitized: Record<string, unknown> = {}
        for (const key of allowedFields) {
            if (key in updates) sanitized[key] = updates[key]
        }

        const { error } = await supabase
            .from('restaurant_design_config')
            .update({ ...sanitized, updated_at: new Date().toISOString() })
            .eq('restaurant_id', restaurant.id)

        if (error) return { success: false, error: error.message }

        // No revalidatePath here — config state is managed client-side to avoid page flicker
        return { success: true }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: msg }
    }
}

// ============================================
// Select a theme
// ============================================
export async function selectTheme(themeId: string) {
    try {
        const { supabase, user, restaurant } = await getAuthRestaurant()
        if (!user) return { success: false, error: 'No autenticado' }
        if (!restaurant) return { success: false, error: 'Restaurante no encontrado' }

        const { error } = await supabase
            .from('restaurant_design_config')
            .update({
                selected_theme_id: themeId,
                updated_at: new Date().toISOString()
            })
            .eq('restaurant_id', restaurant.id)

        if (error) return { success: false, error: error.message }

        revalidatePath('/dashboard/menu/design')
        revalidatePath('/dashboard/menu/menus')
        return { success: true }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: msg }
    }
}

// ============================================
// Update per-category layout settings
// ============================================
export async function updateCategoryLayout(categoryId: string, updates: Record<string, unknown>) {
    try {
        const { supabase, user, restaurant } = await getAuthRestaurant()
        if (!user) return { success: false, error: 'No autenticado' }
        if (!restaurant) return { success: false, error: 'Restaurante no encontrado' }

        // ✅ Whitelist allowed per-category fields
        const ALLOWED = ['layout_type', 'grid_columns', 'card_style', 'show_images', 'show_prices', 'show_descriptions']
        const sanitized: Record<string, unknown> = {}
        for (const key of ALLOWED) {
            if (key in updates) sanitized[key] = updates[key]
        }
        if (Object.keys(sanitized).length === 0) return { success: false, error: 'No hay campos válidos' }

        // ✅ VERIFY OWNERSHIP: category → menu → restaurant
        const { data: category } = await supabase
            .from('menu_categories')
            .select('id, menu_id')
            .eq('id', categoryId)
            .single()

        if (!category) return { success: false, error: 'Categoría no encontrada' }

        // Verify the menu belongs to user's restaurant
        const { data: menu } = await supabase
            .from('menus')
            .select('id')
            .eq('id', category.menu_id)
            .eq('restaurant_id', restaurant.id)
            .single()

        if (!menu) return { success: false, error: 'Sin permisos sobre esta categoría' }

        const { error } = await supabase
            .from('menu_categories')
            .update(sanitized)
            .eq('id', categoryId)

        if (error) return { success: false, error: error.message }

        return { success: true }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: msg }
    }
}

// ============================================
// Toggle product featured status
// ============================================
export async function toggleProductFeatured(productId: string, isFeatured: boolean, badge?: string) {
    try {
        const { supabase, user, restaurant } = await getAuthRestaurant()
        if (!user) return { success: false, error: 'No autenticado' }
        if (!restaurant) return { success: false, error: 'Restaurante no encontrado' }

        // ✅ VERIFY OWNERSHIP: product → category → menu → restaurant
        const { data: product } = await supabase
            .from('products')
            .select('id, category_id')
            .eq('id', productId)
            .single()

        if (!product) return { success: false, error: 'Producto no encontrado' }

        const { data: category } = await supabase
            .from('menu_categories')
            .select('id, menu_id')
            .eq('id', product.category_id)
            .single()

        if (!category) return { success: false, error: 'Categoría no encontrada' }

        const { data: menu } = await supabase
            .from('menus')
            .select('id')
            .eq('id', category.menu_id)
            .eq('restaurant_id', restaurant.id)
            .single()

        if (!menu) return { success: false, error: 'Sin permisos sobre este producto' }

        const { error } = await supabase
            .from('products')
            .update({
                is_featured: isFeatured,
                featured_badge: badge || null,
                featured_order: isFeatured ? Date.now() : 0,
            })
            .eq('id', productId)

        if (error) return { success: false, error: error.message }

        revalidatePath('/dashboard/menu/design')
        revalidatePath('/dashboard/menu/menus')
        return { success: true }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: msg }
    }
}

// ============================================
// Publish design (make it live)
// ============================================
export async function publishDesign() {
    try {
        const { supabase, user, restaurant } = await getAuthRestaurant()
        if (!user) return { success: false, error: 'No autenticado' }
        if (!restaurant) return { success: false, error: 'Restaurante no encontrado' }

        const { error } = await supabase
            .from('restaurant_design_config')
            .update({
                last_published_at: new Date().toISOString()
            })
            .eq('restaurant_id', restaurant.id)

        if (error) return { success: false, error: error.message }

        revalidatePath('/[slug]', 'page')
        return { success: true }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: msg }
    }
}
