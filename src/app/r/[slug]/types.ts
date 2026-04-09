// Shared types for the public menu page

// ============================================================================
// Design Theme (from DB: menu_themes + restaurant_design_config)
// ============================================================================

export interface DesignTheme {
    colors: {
        primary: string;
        accent: string;
        background: string;
        surface: string;
        border: string;
        text: string;
        text_secondary: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    config: {
        show_search: boolean;
        show_categories: boolean;
        show_images: boolean;
        show_prices: boolean;
        show_descriptions: boolean;
        show_badges: boolean;
        show_allergens: boolean;
        show_logo: boolean;
    };
}

// Legacy Tailwind-based theme (kept for backward compat if no DB theme)
export interface Theme {
    background: string;
    cardBg: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryText: string;
    accent: string;
    border: string;
    [key: string]: string;
}

// ============================================================================
// Product Extras
// ============================================================================

export interface ProductExtraGroup {
    id: string;
    name: string;
    description: string | null;
    min_selections: number;
    max_selections: number;
    is_required: boolean;
    display_order: number;
    extras: ProductExtra[];
}

export interface ProductExtra {
    id: string;
    name: string;
    description: string | null;
    price: number;
    type: 'addon' | 'modifier' | 'cooking_point' | 'option';
    is_available: boolean;
    group_id: string | null;
    display_order: number;
}

// ============================================================================
// Core Entities
// ============================================================================

export interface Product {
    id: string;
    name: string | Record<string, string>;
    description: string | Record<string, string> | null;
    price: number;
    image_url: string | null;
    allergens: string[];
    dietary_tags: string[] | null;
    category_id: string;
    extras?: ProductExtra[];
    extra_groups?: ProductExtraGroup[];
}

export interface Category {
    id: string;
    name: string | Record<string, string>;
    icon: string | null;
    sort_order: number;
}

export interface DailyMenuCourse {
    id: string;
    name: string;
    required: boolean;
    options: DailyMenuOption[];
}

export interface DailyMenuOption {
    id: string;
    name: string;
    extra_price?: number;
}

export interface DailyMenu {
    id: string;
    name: string;
    description: string | null;
    price: number;
    original_price: number | null;
    courses: DailyMenuCourse[];
    includes_drink: boolean;
    includes_bread: boolean;
    includes_dessert: boolean;
    includes_coffee: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
    selectedModifiers?: CartModifier[];
    selectedExtras?: { extraId: string; name: string; price: number }[];
}

export interface CartModifier {
    id: string;
    name: string;
    price: number;
}

export interface DietaryPreferences {
    isVegetarian: boolean;
    isVegan: boolean;
    isCeliac: boolean;
    allergies: string[];
    allergyNotes: string;
    otherNotes: string;
}

export interface Restaurant {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    cover_image_url: string | null;
    theme_id: string | null;
    description: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
}

// ============================================================================
// Fallback Tailwind themes (used when no DB theme is configured)
// ============================================================================

export const themes: Record<string, Theme> = {
    classic: {
        background: 'bg-gray-50',
        cardBg: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        primary: 'bg-emerald-500',
        primaryText: 'text-emerald-500',
        accent: 'bg-emerald-50',
        border: 'border-gray-100',
    },
    midnight: {
        background: 'bg-slate-950',
        cardBg: 'bg-slate-900',
        text: 'text-white',
        textSecondary: 'text-slate-400',
        primary: 'bg-amber-500',
        primaryText: 'text-amber-500',
        accent: 'bg-amber-500/10',
        border: 'border-slate-800',
    },
    neon: {
        background: 'bg-zinc-950',
        cardBg: 'bg-zinc-900',
        text: 'text-white',
        textSecondary: 'text-zinc-400',
        primary: 'bg-pink-500',
        primaryText: 'text-pink-500',
        accent: 'bg-pink-500/10',
        border: 'border-zinc-800',
    },
    ocean: {
        background: 'bg-teal-50',
        cardBg: 'bg-white',
        text: 'text-teal-900',
        textSecondary: 'text-teal-600',
        primary: 'bg-cyan-500',
        primaryText: 'text-cyan-600',
        accent: 'bg-cyan-50',
        border: 'border-teal-100',
    },
    minimal: {
        background: 'bg-white',
        cardBg: 'bg-gray-50',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        primary: 'bg-black',
        primaryText: 'text-black',
        accent: 'bg-gray-100',
        border: 'border-gray-200',
    },
};

export const allergensList = [
    { id: 'gluten', name: 'Gluten', emoji: '🌾' },
    { id: 'lactose', name: 'Lácteos', emoji: '🥛' },
    { id: 'eggs', name: 'Huevos', emoji: '🥚' },
    { id: 'fish', name: 'Pescado', emoji: '🐟' },
    { id: 'shellfish', name: 'Mariscos', emoji: '🦐' },
    { id: 'nuts', name: 'Frutos secos', emoji: '🥜' },
    { id: 'peanuts', name: 'Cacahuetes', emoji: '🥜' },
    { id: 'soy', name: 'Soja', emoji: '🫘' },
    { id: 'sesame', name: 'Sésamo', emoji: '🌰' },
    { id: 'celery', name: 'Apio', emoji: '🥬' },
    { id: 'mustard', name: 'Mostaza', emoji: '🟡' },
    { id: 'sulfites', name: 'Sulfitos', emoji: '🍷' },
];
