// =====================================================
// ALLERGENS - Constants and Utilities
// =====================================================

export const ALLERGENS = [
    { id: 'gluten', name: 'Gluten', emoji: '🌾', color: '#F59E0B' },
    { id: 'dairy', name: 'Lácteos', emoji: '🥛', color: '#3B82F6' },
    { id: 'eggs', name: 'Huevos', emoji: '🥚', color: '#FBBF24' },
    { id: 'fish', name: 'Pescado', emoji: '🐟', color: '#06B6D4' },
    { id: 'shellfish', name: 'Marisco', emoji: '🦐', color: '#F97316' },
    { id: 'nuts', name: 'Frutos secos', emoji: '🥜', color: '#92400E' },
    { id: 'peanuts', name: 'Cacahuetes', emoji: '🥜', color: '#78350F' },
    { id: 'soy', name: 'Soja', emoji: '🫘', color: '#65A30D' },
    { id: 'celery', name: 'Apio', emoji: '🥬', color: '#16A34A' },
    { id: 'mustard', name: 'Mostaza', emoji: '🌭', color: '#EAB308' },
    { id: 'sesame', name: 'Sésamo', emoji: '🌰', color: '#A16207' },
    { id: 'sulfites', name: 'Sulfitos', emoji: '🍷', color: '#DC2626' },
    { id: 'lupin', name: 'Altramuces', emoji: '🫘', color: '#7C3AED' },
    { id: 'mollusks', name: 'Moluscos', emoji: '🐚', color: '#0891B2' },
] as const

export type AllergenId = typeof ALLERGENS[number]['id']

export function getAllergenById(id: string) {
    return ALLERGENS.find(a => a.id === id)
}

export function getAllergenEmoji(id: string): string {
    return getAllergenById(id)?.emoji || '⚠️'
}

export function getAllergenColor(id: string): string {
    return getAllergenById(id)?.color || '#6B7280'
}

// =====================================================
// DIETARY LABELS - Constants
// =====================================================

export const DIETARY_LABELS = [
    { id: 'vegan', name: 'Vegano', emoji: '🌱', bg: '#F0FDF4', color: '#15803D' },
    { id: 'vegetarian', name: 'Vegetariano', emoji: '🥗', bg: '#F0FDF4', color: '#15803D' },
    { id: 'gluten_free', name: 'Sin gluten', emoji: '🌾', bg: '#FEF3C7', color: '#92400E' },
    { id: 'lactose_free', name: 'Sin lactosa', emoji: '🥛', bg: '#DBEAFE', color: '#1E40AF' },
    { id: 'spicy', name: 'Picante', emoji: '🔥', bg: '#FEE2E2', color: '#B91C1C' },
    { id: 'new', name: 'Nuevo', emoji: '🆕', bg: '#EFF6FF', color: '#1D4ED8' },
    { id: 'recommended', name: 'Recomendado', emoji: '⭐', bg: '#FFFBEB', color: '#92400E' },
    { id: 'popular', name: 'Popular', emoji: '🔥', bg: '#FEF2F2', color: '#DC2626' },
] as const

export type DietaryLabelId = typeof DIETARY_LABELS[number]['id']

export function getLabelById(id: string) {
    return DIETARY_LABELS.find(l => l.id === id)
}

// =====================================================
// COOKING POINTS - Predefined options
// =====================================================

export const COOKING_POINTS = [
    { id: 'rare', name: { es: 'Poco hecho', en: 'Rare' } },
    { id: 'medium_rare', name: { es: 'Medio poco hecho', en: 'Medium rare' } },
    { id: 'medium', name: { es: 'Al punto', en: 'Medium' } },
    { id: 'medium_well', name: { es: 'Medio bien hecho', en: 'Medium well' } },
    { id: 'well_done', name: { es: 'Bien hecho', en: 'Well done' } },
    { id: 'very_well_done', name: { es: 'Muy hecho', en: 'Very well done' } },
] as const

// =====================================================
// COMMON EXTRAS - Suggestions by category
// =====================================================

export const COMMON_EXTRAS_BY_CATEGORY: Record<string, Array<{ name: string; price: number }>> = {
    'hamburguesas': [
        { name: 'Bacon extra', price: 2.00 },
        { name: 'Queso extra', price: 1.50 },
        { name: 'Aguacate', price: 2.00 },
        { name: 'Huevo frito', price: 1.50 },
        { name: 'Cebolla caramelizada', price: 1.00 },
    ],
    'pizzas': [
        { name: 'Queso extra', price: 2.00 },
        { name: 'Champiñones', price: 1.50 },
        { name: 'Pepperoni', price: 2.00 },
        { name: 'Aceitunas', price: 1.00 },
        { name: 'Rúcula', price: 1.50 },
    ],
    'ensaladas': [
        { name: 'Pollo a la plancha', price: 3.50 },
        { name: 'Salmón', price: 4.50 },
        { name: 'Aguacate', price: 2.00 },
        { name: 'Queso de cabra', price: 2.50 },
        { name: 'Frutos secos', price: 1.50 },
    ],
    'pastas': [
        { name: 'Pollo', price: 3.00 },
        { name: 'Bacon', price: 2.50 },
        { name: 'Champiñones', price: 2.00 },
        { name: 'Parmesano extra', price: 1.50 },
        { name: 'Trufa', price: 5.00 },
    ],
}

export function getSuggestedExtras(categoryName: string): Array<{ name: string; price: number }> {
    const normalized = categoryName.toLowerCase()
    for (const [key, extras] of Object.entries(COMMON_EXTRAS_BY_CATEGORY)) {
        if (normalized.includes(key)) {
            return extras
        }
    }
    return []
}
