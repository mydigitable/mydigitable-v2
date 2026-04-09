// ============================================================================
// MENU DASHBOARD V7 - TYPES
// ============================================================================
// Types para el nuevo dashboard de menú con 3 pestañas progresivas
// ============================================================================

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface Menu {
    id: string
    restaurant_id: string
    name: string  // TEXT field (not JSONB)
    type: string | null
    theme_id: string
    schedule_type: string | null
    start_time: string | null
    end_time: string | null
    is_active: boolean
    display_order: number
    created_at: string
    updated_at: string
    // Note: emoji and description don't exist in database
}

export interface Category {
    id: string
    restaurant_id: string
    menu_id: string | null
    name: Record<string, string> | string  // JSONB multi-language
    description: Record<string, string> | string | null  // JSONB multi-language
    icon: string | null
    image_url: string | null
    active_schedule: string | null
    display_order: number
    sort_order: number
    is_visible: boolean
    created_at: string
    updated_at: string
    // Note: emoji doesn't exist in database, use icon instead
}

export interface Product {
    id: string
    category_id: string
    restaurant_id: string
    name: Record<string, string> | string  // JSONB multi-language
    description: Record<string, string> | string | null  // JSONB multi-language
    price: number  // Database column name
    terrace_price: number | null
    cost_price: number | null
    image_url: string | null
    allergens: string[]  // TEXT[] in database
    dietary_tags: string[]  // TEXT[] in database
    labels: any  // JSONB field in database
    extras: any  // JSONB field in database
    options: any  // JSONB field in database
    stock_quantity: number | null
    track_stock: boolean
    is_available: boolean
    is_visible: boolean
    is_featured: boolean
    imported_via_ai: boolean
    display_order: number
    sort_order: number
    created_at: string
    updated_at: string
}

// ============================================================================
// ALLERGENS & LABELS
// ============================================================================

export type Allergen =
    | 'gluten'
    | 'crustaceos'
    | 'huevos'
    | 'pescado'
    | 'cacahuetes'
    | 'soja'
    | 'lacteos'
    | 'frutos_secos'
    | 'apio'
    | 'mostaza'
    | 'sesamo'
    | 'so2'
    | 'altramuces'
    | 'moluscos'

export type ProductLabel =
    | 'vegano'
    | 'vegetariano'
    | 'sin_gluten'
    | 'picante'
    | 'recomendado'
    | 'nuevo'

export const ALLERGEN_LABELS: Record<Allergen, string> = {
    gluten: 'Gluten',
    crustaceos: 'Crustáceos',
    huevos: 'Huevos',
    pescado: 'Pescado',
    cacahuetes: 'Cacahuetes',
    soja: 'Soja',
    lacteos: 'Lácteos',
    frutos_secos: 'Frutos secos',
    apio: 'Apio',
    mostaza: 'Mostaza',
    sesamo: 'Sésamo',
    so2: 'SO₂',
    altramuces: 'Altramuces',
    moluscos: 'Moluscos',
}

export const LABEL_INFO: Record<ProductLabel, { emoji: string; label: string }> = {
    vegano: { emoji: '🌱', label: 'Vegano' },
    vegetariano: { emoji: '🥦', label: 'Vegetariano' },
    sin_gluten: { emoji: '🌾', label: 'Sin Gluten' },
    picante: { emoji: '🔥', label: 'Picante' },
    recomendado: { emoji: '🏆', label: 'Recomendado' },
    nuevo: { emoji: '🆕', label: 'Nuevo' },
}

// ============================================================================
// PRODUCT EXTRAS & OPTIONS
// ============================================================================

export interface ProductExtra {
    name: string
    price: number
}

export interface ProductOption {
    name: string
    values: string[]
}

// ============================================================================
// DASHBOARD STATE
// ============================================================================

export type TabId = 'menus' | 'categories' | 'products'

export type PanelType = 'menu' | 'category' | 'product' | null

export interface MenuDashboardState {
    // Navegación
    activeTab: TabId

    // Selecciones activas
    selectedMenuId: string | null
    selectedCategoryId: string | null

    // Paneles abiertos
    openPanel: PanelType
    editingItemId: string | null

    // Tema activo (para preview)
    previewThemeId: string

    // Data (cargada de Supabase)
    menus: Menu[]
    categories: Category[]
    products: Product[]

    // Loading states
    isLoading: boolean
    isSaving: boolean
}

// ============================================================================
// FORM INPUTS
// ============================================================================

export interface CreateMenuInput {
    name: string
    emoji?: string
    description?: string
    is_active?: boolean
}

export interface UpdateMenuInput {
    name?: string
    emoji?: string
    description?: string
    is_active?: boolean
}

export interface CreateCategoryInput {
    menu_id: string
    name: string
    emoji?: string
    description?: string
    is_visible?: boolean
}

export interface UpdateCategoryInput {
    name?: string
    emoji?: string
    description?: string
    is_visible?: boolean
}

export interface CreateProductInput {
    category_id: string
    name: string
    description?: string
    price: number
    image_url?: string
    allergens?: Allergen[]
    dietary_tags?: string[]
    labels?: ProductLabel[]
    extras?: ProductExtra[]
    options?: ProductOption[]
    is_available?: boolean
    is_visible?: boolean
}

export interface UpdateProductInput {
    name?: string
    description?: string
    price?: number
    image_url?: string
    allergens?: Allergen[]
    dietary_tags?: string[]
    labels?: ProductLabel[]
    extras?: ProductExtra[]
    options?: ProductOption[]
    is_available?: boolean
    is_visible?: boolean
}

// ============================================================================
// ACTION RESULTS
// ============================================================================

export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string; details?: any }

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

export interface Tab {
    id: TabId
    label: string
    count?: number
    disabled?: boolean
    disabledReason?: string
}

// ============================================================================
// EMOJI PRESETS
// ============================================================================

export const MENU_EMOJI_PRESETS = [
    '☀️', '🍽️', '🌙', '🍕', '☕', '🍺', '🥗', '🎉',
    '🍔', '🍜', '🍱', '🥘', '🍰', '🍷', '🥩', '🐟',
]

export const CATEGORY_EMOJI_PRESETS = [
    '🥐', '☕', '🥗', '🍕', '🍺', '🥤', '🍰', '🥩',
    '🐟', '🥚', '🌮', '🍜', '🍱', '🍝', '🥘', '🫕',
    '🧁', '🍫', '🍷', '🥑',
]

// ============================================================================
// DRAG & DROP
// ============================================================================

export interface DragItem {
    id: string
    type: 'menu' | 'category' | 'product'
    index: number
}

// ============================================================================
// PREVIEW
// ============================================================================

export interface PreviewData {
    menus: Menu[]
    categories: Category[]
    products: Product[]
    themeId: string
}
