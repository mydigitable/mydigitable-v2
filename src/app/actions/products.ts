'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// ACTUAL DB SCHEMA for products table:
// name        → JSONB   {"es": "Pizza Margarita"}
// description → JSONB   {"es": "Tomate y mozzarella"}
// price       → NUMERIC
// image_url   → TEXT
// category_id → UUID
// is_available → BOOLEAN
// is_visible   → BOOLEAN  (NOT is_featured!)
// allergens   → ARRAY
// dietary_tags → ARRAY
// extras      → JSONB
// options     → JSONB
// labels      → JSONB
// sort_order  → INTEGER
// display_order → INTEGER
// prep_time_minutes → INTEGER
// show_prep_time → BOOLEAN
// ai_generated_description → BOOLEAN
// ============================================

export async function createProductPro(data: {
    name: string
    description?: string | null
    category_id: string
    price: number
    image_url?: string | null
    allergens?: string[] | null
    dietary_tags?: string[]
    labels?: string[]
    prep_time_minutes?: number | null
    show_prep_time?: boolean
    ai_generated_description?: boolean
    extras?: Array<{
        grupo: string
        max_selecciones: number
        opciones: Array<{ nombre: string; precio: number }>
    }> | null
    options?: {
        modifiers: Array<{
            nombre: string
            tipo: 'radio' | 'checkbox'
            obligatorio: boolean
            opciones: string[]
        }>
    } | null
}) {
    try {
        const supabase = await createClient()

        // 1. Get user + restaurant
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'No autenticado' }
        }

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (!restaurant) {
            return { success: false, error: 'Restaurante no encontrado' }
        }

        const restaurantId = restaurant.id

        // 2. Get max display_order for this category
        const { data: maxOrder } = await supabase
            .from('products')
            .select('display_order')
            .eq('restaurant_id', restaurantId)
            .eq('category_id', data.category_id)
            .order('display_order', { ascending: false })
            .limit(1)
            .single()

        // 3. Build product data matching ACTUAL DB schema
        // name and description are JSONB columns: {"es": "value"}
        const productData: Record<string, unknown> = {
            restaurant_id: restaurantId,
            category_id: data.category_id,
            name: { es: data.name },
            price: data.price,
            image_url: data.image_url || null,
            is_available: true,
            is_visible: true,
            display_order: (maxOrder?.display_order ?? -1) + 1,
        }

        // Add description as JSONB if provided
        if (data.description) {
            productData.description = { es: data.description }
        }

        // Add optional fields
        if (data.allergens?.length) productData.allergens = data.allergens
        if (data.dietary_tags?.length) productData.dietary_tags = data.dietary_tags
        if (data.labels?.length) productData.labels = data.labels
        if (data.ai_generated_description) productData.ai_generated_description = true
        if (data.prep_time_minutes) productData.prep_time_minutes = data.prep_time_minutes
        if (data.show_prep_time) productData.show_prep_time = true
        if (data.extras?.length) productData.extras = data.extras
        if (data.options) productData.options = data.options

        // 4. Insert product
        const { data: result, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()

        if (error) {
            console.error('Product creation error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/menu')
        revalidatePath('/dashboard/menu/products')
        return { success: true, data: result }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al crear producto'
        console.error('Create product pro error:', errorMessage)
        return { success: false, error: errorMessage }
    }
}

// ============================================
// Server Action: Update Product
// ============================================
export async function updateProductPro(
    productId: string,
    data: {
        name: string
        description?: string | null
        category_id: string
        price: number
        image_url?: string | null
        allergens?: string[] | null
        dietary_tags?: string[]
        prep_time_minutes?: number | null
        show_prep_time?: boolean
        extras?: Array<{
            grupo: string
            max_selecciones: number
            opciones: Array<{ nombre: string; precio: number }>
        }> | null
        options?: {
            modifiers: Array<{
                nombre: string
                tipo: 'radio' | 'checkbox'
                obligatorio: boolean
                opciones: string[]
            }>
        } | null
        recommended_products?: string[] | null
    }
) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'No autenticado' }

        // Build update data
        const updateData: Record<string, unknown> = {
            category_id: data.category_id,
            name: { es: data.name },
            price: data.price,
            image_url: data.image_url || null,
            updated_at: new Date().toISOString(),
        }

        updateData.description = data.description ? { es: data.description } : null
        if (data.allergens?.length) updateData.allergens = data.allergens
        else updateData.allergens = null
        if (data.dietary_tags?.length) updateData.dietary_tags = data.dietary_tags
        else updateData.dietary_tags = null
        if (data.prep_time_minutes) updateData.prep_time_minutes = data.prep_time_minutes
        else updateData.prep_time_minutes = null
        updateData.show_prep_time = data.show_prep_time ?? false
        if (data.extras?.length) updateData.extras = data.extras
        else updateData.extras = null
        if (data.options) updateData.options = data.options
        else updateData.options = null
        if (data.recommended_products?.length) {
            updateData.metadata = { recommended_products: data.recommended_products }
        }

        const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId)

        if (error) {
            console.error('Product update error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/menu')
        revalidatePath('/dashboard/menu/products')
        return { success: true }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al actualizar producto'
        console.error('Update product pro error:', errorMessage)
        return { success: false, error: errorMessage }
    }
}

// ============================================
// Server Action: Calcular Precio Final
// ============================================
export async function calculateFinalPrice(
    productId: string,
    context: {
        location?: string
        time?: string
        day?: string
        variantId?: string
    }
) {
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('products')
        .select('price')
        .eq('id', productId)
        .single()

    if (!product) return null

    let finalPrice = product.price

    if (context.variantId) {
        const { data: variant } = await supabase
            .from('product_variants')
            .select('price_modifier')
            .eq('id', context.variantId)
            .single()

        if (variant) {
            finalPrice += variant.price_modifier
        }
    }

    const { data: rules } = await supabase
        .from('price_rules')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('priority', { ascending: false })

    if (rules) {
        for (const rule of rules) {
            let applies = false

            switch (rule.condition_type) {
                case 'location':
                    applies = rule.condition_value?.location === context.location
                    break
                case 'time':
                    if (context.time && rule.condition_value?.time_start && rule.condition_value?.time_end) {
                        applies = context.time >= rule.condition_value.time_start &&
                            context.time <= rule.condition_value.time_end
                    }
                    break
                case 'day':
                    if (context.day && rule.condition_value?.days) {
                        applies = (rule.condition_value.days as string[]).includes(context.day)
                    }
                    break
            }

            if (applies) {
                if (rule.price_modifier_type === 'fixed') {
                    finalPrice += rule.price_modifier_value
                } else {
                    finalPrice *= (1 + rule.price_modifier_value / 100)
                }
            }
        }
    }

    return finalPrice
}
