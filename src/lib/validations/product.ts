import { z } from "zod"

// Allergen types
export const ALLERGENS = [
    'gluten',
    'crustaceos',
    'huevos',
    'pescado',
    'cacahuetes',
    'soja',
    'lacteos',
    'frutos_secos',
    'apio',
    'mostaza',
    'sesamo',
    'so2',
    'altramuces',
    'moluscos'
] as const

// Label types
export const LABELS = [
    'vegano',
    'vegetariano',
    'sin_gluten',
    'picante',
    'recomendado',
    'nuevo'
] as const

// Product validation schema
export const ProductSchema = z.object({
    name: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(80, 'El nombre no puede superar 80 caracteres'),
    description: z.string()
        .max(300, 'La descripción no puede superar 300 caracteres')
        .optional()
        .nullable(),
    price: z.number()
        .min(0.10, 'El precio mínimo es €0.10')
        .max(9999, 'El precio máximo es €9999'),
    category_id: z.string().uuid('Categoría inválida'),
    image_url: z.string().url().optional().nullable(),
    allergens: z.array(z.enum(ALLERGENS)).default([]),
    labels: z.array(z.enum(LABELS)).default([]),
    extras: z.array(z.object({
        name: z.string().min(1).max(50),
        price: z.number().min(0.10).max(99.99)
    })).max(10, 'Máximo 10 extras').default([]),
    options: z.array(z.object({
        name: z.string().min(1).max(50),
        values: z.array(z.string().min(1).max(50))
            .min(2, 'Mínimo 2 valores')
            .max(8, 'Máximo 8 valores')
    })).max(5, 'Máximo 5 opciones').default([]),
    is_available: z.boolean().default(true),
    is_visible: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof ProductSchema>

// Allergen metadata
export const ALLERGEN_INFO = {
    gluten: { emoji: '🌾', label: 'Gluten' },
    crustaceos: { emoji: '🦐', label: 'Crustáceos' },
    huevos: { emoji: '🥚', label: 'Huevos' },
    pescado: { emoji: '🐟', label: 'Pescado' },
    cacahuetes: { emoji: '🥜', label: 'Cacahuetes' },
    soja: { emoji: '🫘', label: 'Soja' },
    lacteos: { emoji: '🥛', label: 'Lácteos' },
    frutos_secos: { emoji: '🌰', label: 'Fr.Secos' },
    apio: { emoji: '🌿', label: 'Apio' },
    mostaza: { emoji: '🌶️', label: 'Mostaza' },
    sesamo: { emoji: '◉', label: 'Sésamo' },
    so2: { emoji: '🫘', label: 'SO₂/Sulf.' },
    altramuces: { emoji: '🫘', label: 'Altramuz' },
    moluscos: { emoji: '🦑', label: 'Moluscos' },
} as const

// Label metadata
export const LABEL_INFO = {
    vegano: { emoji: '🌱', label: 'Vegano' },
    vegetariano: { emoji: '🥦', label: 'Vegetariano' },
    sin_gluten: { emoji: '🌾', label: 'Sin Gluten' },
    picante: { emoji: '🔥', label: 'Picante' },
    recomendado: { emoji: '⭐', label: 'Recomendado' },
    nuevo: { emoji: '🆕', label: 'Novedad' },
} as const
