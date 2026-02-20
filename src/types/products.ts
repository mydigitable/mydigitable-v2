// ============================================
// Types para el sistema de productos profesional
// MyDigitable V5 - Feb 2026
// ============================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Product {
    id: string
    restaurant_id: string
    category_id: string
    name: string | Json
    description: string | Json | null
    price: number
    image_url?: string | null

    // IA
    ai_generated_description: boolean
    ai_generated_image_url?: string | null
    custom_image_url?: string | null

    // Disponibilidad
    is_available: boolean
    stock_quantity?: number | null
    available_hours?: {
        start: string
        end: string
    } | null

    // Metadata
    dietary_tags: string[]
    allergens: string[]
    labels: string[]

    // Tiempo de preparación
    prep_time_minutes?: number | null
    show_prep_time: boolean

    // Analytics
    times_ordered: number
    rating_avg?: number | null
    last_ordered_at?: string | null

    // Relations (cuando se incluyen)
    variants?: ProductVariant[]
    modifier_groups?: ProductExtraGroup[]
    price_rules?: PriceRule[]
    recommendations?: ProductRecommendation[]

    display_order: number
    created_at: string
    updated_at: string
}

export interface ProductVariant {
    id: string
    product_id: string
    name: string
    price_modifier: number
    attributes: Record<string, unknown>
    display_order: number
    is_available: boolean
    created_at?: string
    updated_at?: string
}

// Reutiliza las tablas existentes product_extra_groups / product_extras
export interface ProductExtraGroup {
    id: string
    product_id: string
    name: Json
    description?: Json | null
    min_selections: number
    max_selections: number
    is_required: boolean
    display_order: number
    extras?: ProductExtra[]
    created_at?: string
    updated_at?: string
}

export interface ProductExtra {
    id: string
    product_id: string
    group_id?: string | null
    name: Json
    description?: Json | null
    price: number
    type: 'addon' | 'modifier' | 'cooking_point' | 'option'
    is_available: boolean
    display_order: number
    created_at?: string
    updated_at?: string
}

export interface PriceRule {
    id: string
    product_id: string
    restaurant_id: string
    condition_type: 'location' | 'time' | 'day' | 'customer_type'
    condition_value: Record<string, unknown>
    price_modifier_type: 'fixed' | 'percentage'
    price_modifier_value: number
    priority: number
    is_active: boolean
    created_at?: string
    updated_at?: string
}

export interface ProductRecommendation {
    id: string
    product_id: string
    recommended_product_id: string
    type: 'similar' | 'combo' | 'upsell' | 'cross-sell'
    reason?: string | null
    display_order: number
    recommended_product?: Product
    created_at?: string
}

// Input types
export interface CreateProductInput {
    name: string
    description?: string
    category_id: string
    price: number
    image_url?: string
    dietary_tags?: string[]
    allergens?: string[]
    labels?: string[]
    prep_time_minutes?: number
    show_prep_time?: boolean
    use_ai_description?: boolean
    use_ai_image?: boolean
    variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]
    price_rules?: Omit<PriceRule, 'id' | 'product_id' | 'restaurant_id' | 'created_at' | 'updated_at'>[]
}

// AI generation response
export interface AIProductSuggestion {
    descripcion: string
    precio: number
    alergenos: string[]
    etiquetas: string[]
    prep_time_minutes?: number
    suggested_price_min?: number
    suggested_price_max?: number
}
