'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// =====================================================
// PRODUCT EXTRAS - Server Actions
// =====================================================

export interface ProductExtra {
    id?: string
    product_id: string
    group_id?: string | null
    name: { es: string; en?: string }
    description?: { es?: string; en?: string }
    price: number
    type: 'addon' | 'modifier' | 'cooking_point' | 'option'
    is_available?: boolean
    display_order?: number
}

export interface ProductExtraGroup {
    id?: string
    product_id: string
    name: { es: string; en?: string }
    description?: { es?: string; en?: string }
    min_selections?: number
    max_selections?: number
    is_required?: boolean
    display_order?: number
}

// =====================================================
// EXTRAS - CRUD Operations
// =====================================================

/**
 * Get all extras for a product
 */
export async function getProductExtras(productId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('product_extras')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true })

    if (error) {
        console.error('Error fetching product extras:', error)
        return []
    }

    return data
}

/**
 * Create a new extra for a product
 */
export async function createProductExtra(extra: ProductExtra) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('product_extras')
        .insert({
            product_id: extra.product_id,
            group_id: extra.group_id || null,
            name: extra.name,
            description: extra.description || null,
            price: extra.price,
            type: extra.type,
            is_available: extra.is_available ?? true,
            display_order: extra.display_order ?? 0,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating product extra:', error)
        throw new Error('Failed to create product extra')
    }

    revalidatePath('/dashboard/menu')
    return data
}

/**
 * Update an existing extra
 */
export async function updateProductExtra(extraId: string, updates: Partial<ProductExtra>) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('product_extras')
        .update(updates)
        .eq('id', extraId)
        .select()
        .single()

    if (error) {
        console.error('Error updating product extra:', error)
        throw new Error('Failed to update product extra')
    }

    revalidatePath('/dashboard/menu')
    return data
}

/**
 * Delete an extra
 */
export async function deleteProductExtra(extraId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('product_extras')
        .delete()
        .eq('id', extraId)

    if (error) {
        console.error('Error deleting product extra:', error)
        throw new Error('Failed to delete product extra')
    }

    revalidatePath('/dashboard/menu')
}

// =====================================================
// EXTRA GROUPS - CRUD Operations
// =====================================================

/**
 * Get all extra groups for a product
 */
export async function getProductExtraGroups(productId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('product_extra_groups')
        .select(`
            *,
            extras:product_extras(*)
        `)
        .eq('product_id', productId)
        .order('display_order', { ascending: true })

    if (error) {
        console.error('Error fetching product extra groups:', error)
        return []
    }

    return data
}

/**
 * Create a new extra group
 */
export async function createProductExtraGroup(group: ProductExtraGroup) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('product_extra_groups')
        .insert({
            product_id: group.product_id,
            name: group.name,
            description: group.description || null,
            min_selections: group.min_selections ?? 0,
            max_selections: group.max_selections ?? 1,
            is_required: group.is_required ?? false,
            display_order: group.display_order ?? 0,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating product extra group:', error)
        throw new Error('Failed to create product extra group')
    }

    revalidatePath('/dashboard/menu')
    return data
}

/**
 * Update an existing extra group
 */
export async function updateProductExtraGroup(groupId: string, updates: Partial<ProductExtraGroup>) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('product_extra_groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single()

    if (error) {
        console.error('Error updating product extra group:', error)
        throw new Error('Failed to update product extra group')
    }

    revalidatePath('/dashboard/menu')
    return data
}

/**
 * Delete an extra group (and all its extras)
 */
export async function deleteProductExtraGroup(groupId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('product_extra_groups')
        .delete()
        .eq('id', groupId)

    if (error) {
        console.error('Error deleting product extra group:', error)
        throw new Error('Failed to delete product extra group')
    }

    revalidatePath('/dashboard/menu')
}

// =====================================================
// BULK OPERATIONS
// =====================================================

/**
 * Create multiple extras at once
 */
export async function createMultipleExtras(extras: ProductExtra[]) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('product_extras')
        .insert(extras.map(extra => ({
            product_id: extra.product_id,
            group_id: extra.group_id || null,
            name: extra.name,
            description: extra.description || null,
            price: extra.price,
            type: extra.type,
            is_available: extra.is_available ?? true,
            display_order: extra.display_order ?? 0,
        })))
        .select()

    if (error) {
        console.error('Error creating multiple extras:', error)
        throw new Error('Failed to create multiple extras')
    }

    revalidatePath('/dashboard/menu')
    return data
}

/**
 * Get complete extras structure for a product (groups + standalone extras)
 */
export async function getProductExtrasComplete(productId: string) {
    const supabase = await createClient()

    // Get groups with their extras
    const { data: groups, error: groupsError } = await supabase
        .from('product_extra_groups')
        .select(`
            *,
            extras:product_extras(*)
        `)
        .eq('product_id', productId)
        .order('display_order', { ascending: true })

    if (groupsError) {
        console.error('Error fetching extra groups:', groupsError)
    }

    // Get standalone extras (not in any group)
    const { data: standaloneExtras, error: extrasError } = await supabase
        .from('product_extras')
        .select('*')
        .eq('product_id', productId)
        .is('group_id', null)
        .order('display_order', { ascending: true })

    if (extrasError) {
        console.error('Error fetching standalone extras:', extrasError)
    }

    return {
        groups: groups || [],
        standaloneExtras: standaloneExtras || [],
    }
}
