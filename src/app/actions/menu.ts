// ============================================================================
// MENU DASHBOARD V7 - SERVER ACTIONS (CORREGIDO)
// ============================================================================
// Server Actions para gestión de menús, categorías y productos
// CORRECCIONES: menu_categories table, display_order column
// ============================================================================

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    CreateMenuSchema,
    UpdateMenuSchema,
    CreateCategorySchema,
    UpdateCategorySchema,
    CreateProductSchema,
    UpdateProductSchema,
    ReorderSchema,
    UpdateThemeSchema,
} from '@/lib/validations/menu-dashboard'
import type {
    Menu,
    Category,
    Product,
    ActionResult,
} from '@/types/menu-dashboard'

// ============================================================================
// HELPER: Get Restaurant ID
// ============================================================================

async function getRestaurantId(): Promise<string | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    return restaurant?.id || null
}

// ============================================================================
// MENUS
// ============================================================================

export async function createMenu(input: unknown): Promise<ActionResult<Menu>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = CreateMenuSchema.parse(input)

        // Get max display_order
        const { data: maxOrder } = await supabase
            .from('menus')
            .select('display_order')
            .eq('restaurant_id', restaurantId)
            .order('display_order', { ascending: false })
            .limit(1)
            .single()

        const { data, error } = await supabase
            .from('menus')
            .insert({
                restaurant_id: restaurantId,
                name: validated.name,
                type: validated.type,
                is_active: validated.is_active,
                schedule_type: validated.schedule_type || 'all_day',
                start_time: validated.start_time || null,
                end_time: validated.end_time || null,
                schedule: validated.schedule || null,
                display_order: (maxOrder?.display_order ?? -1) + 1,
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('━━━ ERROR CREATING MENU ━━━')
        console.error('Error object:', JSON.stringify(error, null, 2))

        let errorMessage = 'Error al crear el menú'

        if (error && typeof error === 'object') {
            // Supabase error
            if ('message' in error) {
                errorMessage = String(error.message)
            } else if ('error' in error) {
                errorMessage = String(error.error)
            }
        } else if (error instanceof Error) {
            errorMessage = error.message
        }

        console.error('Error message:', errorMessage)

        return {
            success: false,
            error: errorMessage,
        }
    }
}

export async function updateMenu(
    id: string,
    input: unknown
): Promise<ActionResult<Menu>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = UpdateMenuSchema.parse(input)

        // Build update object explicitly to handle all fields
        const updateData: Record<string, unknown> = {}
        if (validated.name !== undefined) updateData.name = validated.name
        if (validated.type !== undefined) updateData.type = validated.type
        if (validated.is_active !== undefined) updateData.is_active = validated.is_active
        if (validated.schedule_type !== undefined) updateData.schedule_type = validated.schedule_type
        if (validated.start_time !== undefined) updateData.start_time = validated.start_time
        if (validated.end_time !== undefined) updateData.end_time = validated.end_time
        if (validated.schedule !== undefined) updateData.schedule = validated.schedule
        updateData.updated_at = new Date().toISOString()

        const { data, error } = await supabase
            .from('menus')
            .update(updateData)
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('Error updating menu:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al actualizar el menú',
        }
    }
}

export async function deleteMenu(id: string): Promise<ActionResult> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const { error } = await supabase
            .from('menus')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId)

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error deleting menu:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al eliminar el menú',
        }
    }
}

export async function toggleMenuActive(id: string): Promise<ActionResult<Menu>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        // Get current state
        const { data: menu } = await supabase
            .from('menus')
            .select('is_active')
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .single()

        if (!menu) {
            return { success: false, error: 'Menú no encontrado' }
        }

        const { data, error } = await supabase
            .from('menus')
            .update({ is_active: !menu.is_active })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('Error toggling menu:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al cambiar el estado',
        }
    }
}

export async function reorderMenus(orderedIds: string[]): Promise<ActionResult> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = ReorderSchema.parse({ orderedIds })

        // Update each menu's display_order
        const updates = validated.orderedIds.map((id, index) =>
            supabase
                .from('menus')
                .update({ display_order: index })
                .eq('id', id)
                .eq('restaurant_id', restaurantId)
        )

        await Promise.all(updates)

        revalidatePath('/dashboard/menu')
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error reordering menus:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al reordenar',
        }
    }
}

// ============================================================================
// CATEGORIES (usando tabla menu_categories)
// ============================================================================

export async function createCategory(input: unknown): Promise<ActionResult<Category>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = CreateCategorySchema.parse(input)

        // Get restaurant's default language
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('default_language')
            .eq('id', restaurantId)
            .single()

        const defaultLang = restaurant?.default_language || 'es'

        // Convert string fields to JSONB format
        const nameJsonb = typeof validated.name === 'string'
            ? { [defaultLang]: validated.name }
            : validated.name

        const descriptionJsonb = validated.description
            ? (typeof validated.description === 'string'
                ? { [defaultLang]: validated.description }
                : validated.description)
            : null

        // Get max display_order for this menu
        const { data: maxOrder } = await supabase
            .from('menu_categories')
            .select('display_order')
            .eq('restaurant_id', restaurantId)
            .eq('menu_id', validated.menu_id)
            .order('display_order', { ascending: false })
            .limit(1)
            .single()

        const { data, error } = await supabase
            .from('menu_categories')
            .insert({
                restaurant_id: restaurantId,
                menu_id: validated.menu_id,
                name: nameJsonb,
                description: descriptionJsonb,
                is_visible: validated.is_visible,
                display_order: (maxOrder?.display_order ?? -1) + 1,
            })
            .select()
            .single()

        if (error) {
            console.error('SUPABASE ERROR:', error)
            return {
                success: false,
                error: error.message || error.toString(),
                details: error
            }
        }

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('CATCH ERROR:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            details: error
        }
    }
}

export async function updateCategory(
    id: string,
    input: unknown
): Promise<ActionResult<Category>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = UpdateCategorySchema.parse(input)

        // Get restaurant's default language
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('default_language')
            .eq('id', restaurantId)
            .single()

        const defaultLang = restaurant?.default_language || 'es'

        // Build update object with JSONB conversion
        const updateData: any = {}

        if (validated.name !== undefined) {
            updateData.name = typeof validated.name === 'string'
                ? { [defaultLang]: validated.name }
                : validated.name
        }

        if (validated.description !== undefined) {
            updateData.description = validated.description
                ? (typeof validated.description === 'string'
                    ? { [defaultLang]: validated.description }
                    : validated.description)
                : null
        }

        if (validated.is_visible !== undefined) {
            updateData.is_visible = validated.is_visible
        }

        const { data, error } = await supabase
            .from('menu_categories')
            .update(updateData)
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single()

        if (error) {
            console.error('SUPABASE ERROR:', error)
            return {
                success: false,
                error: error.message || error.toString(),
                details: error
            }
        }

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('CATCH ERROR:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al actualizar la categoría',
            details: error
        }
    }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const { error } = await supabase
            .from('menu_categories')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId)

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error deleting category:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al eliminar la categoría',
        }
    }
}

export async function toggleCategoryVisible(id: string): Promise<ActionResult<Category>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        // Get current state
        const { data: category } = await supabase
            .from('menu_categories')
            .select('is_visible')
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .single()

        if (!category) {
            return { success: false, error: 'Categoría no encontrada' }
        }

        const { data, error } = await supabase
            .from('menu_categories')
            .update({ is_visible: !category.is_visible })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('Error toggling category:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al cambiar la visibilidad',
        }
    }
}

export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = ReorderSchema.parse({ orderedIds })

        const updates = validated.orderedIds.map((id, index) =>
            supabase
                .from('menu_categories')
                .update({ display_order: index })
                .eq('id', id)
                .eq('restaurant_id', restaurantId)
        )

        await Promise.all(updates)

        revalidatePath('/dashboard/menu')
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error reordering categories:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al reordenar',
        }
    }
}

// ============================================================================
// PRODUCTS
// ============================================================================

export async function createProduct(input: unknown): Promise<ActionResult<Product>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = CreateProductSchema.parse(input)

        // Get restaurant's default language
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('default_language')
            .eq('id', restaurantId)
            .single()

        const defaultLang = restaurant?.default_language || 'es'

        // Convert string fields to JSONB format
        const nameJsonb = typeof validated.name === 'string'
            ? { [defaultLang]: validated.name }
            : validated.name

        const descriptionJsonb = validated.description
            ? (typeof validated.description === 'string'
                ? { [defaultLang]: validated.description }
                : validated.description)
            : null

        // Get max display_order for this category
        const { data: maxOrder } = await supabase
            .from('products')
            .select('display_order')
            .eq('restaurant_id', restaurantId)
            .eq('category_id', validated.category_id)
            .order('display_order', { ascending: false })
            .limit(1)
            .single()

        const { data, error } = await supabase
            .from('products')
            .insert({
                restaurant_id: restaurantId,
                category_id: validated.category_id,
                name: nameJsonb,
                description: descriptionJsonb,
                price: validated.price,
                image_url: validated.image_url,
                allergens: validated.allergens || [],
                labels: validated.labels || [],  // FIX: Use 'labels' (JSONB), not 'dietary_tags' (ARRAY)
                extras: validated.extras || [],
                options: validated.options || [],
                is_available: validated.is_available ?? true,
                // REMOVED: is_visible - doesn't exist in products table
                display_order: (maxOrder?.display_order ?? -1) + 1,
            })
            .select()
            .single()

        if (error) {
            console.error('SUPABASE ERROR:', error)
            return {
                success: false,
                error: error.message || error.toString(),
                details: error
            }
        }

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('CATCH ERROR:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al crear el producto',
            details: error
        }
    }
}

export async function updateProduct(
    id: string,
    input: unknown
): Promise<ActionResult<Product>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = UpdateProductSchema.parse(input)

        // Get restaurant's default language
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('default_language')
            .eq('id', restaurantId)
            .single()

        const defaultLang = restaurant?.default_language || 'es'

        // Build update object with JSONB conversion and field mapping
        const updateData: any = {}

        if (validated.name !== undefined) {
            updateData.name = typeof validated.name === 'string'
                ? { [defaultLang]: validated.name }
                : validated.name
        }

        if (validated.description !== undefined) {
            updateData.description = validated.description
                ? (typeof validated.description === 'string'
                    ? { [defaultLang]: validated.description }
                    : validated.description)
                : null
        }

        if (validated.price !== undefined) {
            updateData.price = validated.price
        }

        if (validated.image_url !== undefined) {
            updateData.image_url = validated.image_url
        }

        if (validated.allergens !== undefined) {
            updateData.allergens = validated.allergens
        }

        if (validated.labels !== undefined) {
            updateData.labels = validated.labels  // FIX: Use 'labels', not 'dietary_tags'
        }

        if (validated.extras !== undefined) {
            updateData.extras = validated.extras
        }

        if (validated.options !== undefined) {
            updateData.options = validated.options
        }

        if (validated.is_available !== undefined) {
            updateData.is_available = validated.is_available
        }

        // REMOVED: is_visible - doesn't exist in products table

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single()

        if (error) {
            console.error('SUPABASE ERROR:', error)
            return {
                success: false,
                error: error.message || error.toString(),
                details: error
            }
        }

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('CATCH ERROR:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al actualizar el producto',
            details: error
        }
    }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId)

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error deleting product:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al eliminar el producto',
        }
    }
}

export async function toggleProductAvailable(id: string): Promise<ActionResult<Product>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const { data: product } = await supabase
            .from('products')
            .select('is_available')
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .single()

        if (!product) {
            return { success: false, error: 'Producto no encontrado' }
        }

        const { data, error } = await supabase
            .from('products')
            .update({ is_available: !product.is_available })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('Error toggling product availability:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al cambiar disponibilidad',
        }
    }
}

export async function toggleProductVisible(id: string): Promise<ActionResult<Product>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const { data: product } = await supabase
            .from('products')
            .select('is_visible')
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .single()

        if (!product) {
            return { success: false, error: 'Producto no encontrado' }
        }

        const { data, error } = await supabase
            .from('products')
            .update({ is_visible: !product.is_visible })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data }
    } catch (error) {
        console.error('Error toggling product visibility:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al cambiar visibilidad',
        }
    }
}

export async function reorderProducts(orderedIds: string[]): Promise<ActionResult> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = ReorderSchema.parse({ orderedIds })

        const updates = validated.orderedIds.map((id, index) =>
            supabase
                .from('products')
                .update({ display_order: index })
                .eq('id', id)
                .eq('restaurant_id', restaurantId)
        )

        await Promise.all(updates)

        revalidatePath('/dashboard/menu')
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error reordering products:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al reordenar',
        }
    }
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

export async function uploadProductImage(formData: FormData): Promise<ActionResult<string>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const file = formData.get('file') as File
        if (!file) {
            return { success: false, error: 'No se proporcionó ningún archivo' }
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            return { success: false, error: 'Tipo de archivo no válido. Use JPG, PNG o WebP' }
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: 'El archivo es demasiado grande. Máximo 5MB' }
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${restaurantId}/${Date.now()}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path)

        return { success: true, data: publicUrl }
    } catch (error) {
        console.error('Error uploading image:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al subir la imagen',
        }
    }
}

// ============================================================================
// THEME
// ============================================================================

export async function updateRestaurantTheme(
    themeId: string,
    overrides?: { primaryColor?: string }
): Promise<ActionResult> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        const validated = UpdateThemeSchema.parse({ themeId, overrides })

        // Update restaurant theme
        const { error } = await supabase
            .from('restaurants')
            .update({
                theme_id: validated.themeId,
                theme_overrides: validated.overrides || null,
            })
            .eq('id', restaurantId)

        if (error) throw error

        revalidatePath('/dashboard/menu')
        revalidatePath('/menu/[slug]', 'page')
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error updating theme:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al actualizar el tema',
        }
    }
}


// HELPER FOR HOSTINGER DASHBOARD
export async function getCategoriesForMenu(menuId: string): Promise<ActionResult<Category[]>> {
    const supabase = await createClient()
    const restaurantId = await getRestaurantId()
    if (!restaurantId) return { success: false, error: 'Auth required' }

    const { data } = await supabase.from('menu_categories').select('*').eq('menu_id', menuId).eq('restaurant_id', restaurantId).order('display_order')
    return { success: true, data: data as Category[] }
}

export async function getProductsForMenu(menuId: string): Promise<ActionResult<Product[]>> {
    const supabase = await createClient()
    const restaurantId = await getRestaurantId()
    if (!restaurantId) return { success: false, error: 'Auth required' }

    // First categories
    const { data: cats } = await supabase.from('menu_categories').select('id').eq('menu_id', menuId)
    if (!cats?.length) return { success: true, data: [] }

    const catIds = cats.map(c => c.id)
    const { data } = await supabase.from('products').select('*').in('category_id', catIds).order('display_order')
    return { success: true, data: data as Product[] }
}


export async function duplicateProduct(id: string): Promise<ActionResult<Product>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()
        if (!restaurantId) return { success: false, error: 'No se encontró el restaurante' }

        const { data: original } = await supabase.from('products').select('*').eq('id', id).eq('restaurant_id', restaurantId).single()
        if (!original) return { success: false, error: 'Producto no encontrado' }

        // Create copy excluding system fields
        const { id: _id, created_at: _created, updated_at: _updated, ...rest } = original
        const copy = { ...rest, name: `${original.name} (Copia)`, is_available: false, restaurant_id: restaurantId }

        const { data, error } = await supabase.from('products').insert(copy).select().single()
        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data: data as Product }
    } catch (error) {
        console.error('Error duplicating:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Error' }
    }
}

export async function deleteProductImage(productId: string): Promise<ActionResult> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()
        if (!restaurantId) return { success: false, error: 'Auth required' }

        const { error } = await supabase.from('products').update({ image_url: null }).eq('id', productId).eq('restaurant_id', restaurantId)
        if (error) throw error

        revalidatePath('/dashboard/menu')
        return { success: true, data: undefined }
    } catch (error) {
        return { success: false, error: 'Error deleting image' }
    }
}

// ============================================================================
// MULTI-MENU OPERATIONS (FASE 1)
// ============================================================================

/**
 * Create a category in multiple menus at once
 * Used for sharing categories across menus (e.g., "Bebidas" in lunch and dinner)
 */
export async function createCategoryInMultipleMenus(
    menuIds: string[],
    categoryData: {
        name: string | { es: string; en?: string }
        description?: string | { es?: string; en?: string }
        is_visible?: boolean
    }
): Promise<ActionResult<Category[]>> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'No se encontró el restaurante' }
        }

        if (!menuIds || menuIds.length === 0) {
            return { success: false, error: 'Debe seleccionar al menos un menú' }
        }

        // Get restaurant's default language
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('default_language')
            .eq('id', restaurantId)
            .single()

        const defaultLang = restaurant?.default_language || 'es'

        // Convert string fields to JSONB format
        const nameJsonb = typeof categoryData.name === 'string'
            ? { [defaultLang]: categoryData.name }
            : categoryData.name

        const descriptionJsonb = categoryData.description
            ? (typeof categoryData.description === 'string'
                ? { [defaultLang]: categoryData.description }
                : categoryData.description)
            : null

        // Create category in each menu
        const createdCategories: Category[] = []

        for (const menuId of menuIds) {
            // Get max display_order for this menu
            const { data: maxOrder } = await supabase
                .from('menu_categories')
                .select('display_order')
                .eq('restaurant_id', restaurantId)
                .eq('menu_id', menuId)
                .order('display_order', { ascending: false })
                .limit(1)
                .single()

            const { data, error } = await supabase
                .from('menu_categories')
                .insert({
                    restaurant_id: restaurantId,
                    menu_id: menuId,
                    name: nameJsonb,
                    description: descriptionJsonb,
                    is_visible: categoryData.is_visible ?? true,
                    display_order: (maxOrder?.display_order ?? -1) + 1,
                })
                .select()
                .single()

            if (error) {
                console.error(`Error creating category in menu ${menuId}:`, error)
                // Continue with other menus even if one fails
                continue
            }

            if (data) {
                createdCategories.push(data as Category)
            }
        }

        if (createdCategories.length === 0) {
            return {
                success: false,
                error: 'No se pudo crear la categoría en ningún menú'
            }
        }

        revalidatePath('/dashboard/menu')
        return {
            success: true,
            data: createdCategories
        }
    } catch (error) {
        console.error('Error creating category in multiple menus:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al crear la categoría'
        }
    }
}
