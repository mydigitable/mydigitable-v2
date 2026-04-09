export interface MenuTheme {
    id: string
    name: string
    slug: string
    description: string
    colors: {
        primary: string
        accent?: string
        background: string
        surface: string
        border: string
        text: string
        text_secondary?: string
    }
    fonts: {
        heading: string
        body: string
    }
    // Structural design properties that make each theme unique
    header_style: 'simple' | 'hero' | 'industrial' | 'editorial' | 'ornamental'
    category_style: 'pills' | 'tabs' | 'tags' | 'underline' | 'italic-tags'
    card_shape: 'rounded' | 'sharp' | 'square' | 'borderless' | 'soft'
    featured_style: 'none' | 'banner' | 'dark-banner' | 'hero-image' | 'ribbon'
    layout_type: 'grid' | 'list' | 'tabs' | 'photo-grid' | 'horizontal-cards'
    best_for: string[]
    is_premium: boolean
    display_order: number
    created_at: string
    updated_at: string
}

export interface RestaurantDesignConfig {
    id: string
    restaurant_id: string
    selected_theme_id?: string
    selected_theme?: MenuTheme

    // Colores personalizados
    custom_colors?: {
        primary?: string
        accent?: string
        background?: string
        surface?: string
        border?: string
        text?: string
        text_secondary?: string
    }

    // Layout
    layout_type: 'grid' | 'list' | 'tabs' | 'masonry' | 'photo-grid' | 'horizontal-cards' | 'horizontal'
    grid_columns: 1 | 2 | 3
    card_style: 'flat' | 'elevated' | 'outlined'
    spacing: 'compact' | 'normal' | 'relaxed'
    spacing_value?: number
    border_radius: number

    // Tipografía
    custom_fonts?: {
        heading?: string
        body?: string
    }

    // Opciones
    show_search: boolean
    show_categories: boolean
    show_images: boolean
    show_prices: boolean
    show_descriptions: boolean
    show_badges: boolean
    show_prep_time: boolean
    show_allergens: boolean
    show_logo: boolean

    // Branding
    logo_url?: string
    header_subtitle?: string
    show_header: boolean
    show_powered_by: boolean

    // Metadata
    last_published_at?: string
    created_at: string
    updated_at: string
}

export interface MenuCategory {
    id: string
    menu_id: string
    name: string | Record<string, string>
    slug?: string
    description?: string | Record<string, string>
    display_order: number
    is_active: boolean

    // Per-category design overrides (Phase 1)
    layout_type?: 'grid' | 'list'
    grid_columns?: 1 | 2 | 3
    card_style?: 'flat' | 'elevated' | 'outlined'
    show_images?: boolean
    show_prices?: boolean
    show_descriptions?: boolean

    // Relations
    products?: Product[]

    created_at: string
    updated_at: string
}

export interface Product {
    id: string
    category_id: string
    name: string | Record<string, string>
    description?: string | Record<string, string>
    price: number
    image_url?: string
    display_order: number
    is_active: boolean

    // Featured products (Phase 1)
    is_featured: boolean
    featured_order: number
    featured_badge?: 'Popular' | 'Nuevo' | 'Recomendado' | 'Del Chef'

    // Additional
    allergens?: string[]
    prep_time?: number
    calories?: number

    created_at: string
    updated_at: string
}
