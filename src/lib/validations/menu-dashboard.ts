// ============================================================================
// MENU DASHBOARD V7 - ZOD SCHEMAS
// ============================================================================
// Validaciones para formularios de menús, categorías y productos
// ============================================================================

import { z } from 'zod'

// ============================================================================
// MENU SCHEMAS
// ============================================================================

export const MenuSchema = z.object({
    name: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede superar 50 caracteres'),
    type: z.string()
        .optional()
        .nullable(),
    is_active: z.boolean().default(true),
    schedule_type: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    schedule: z.any().optional().nullable(),
})

export const CreateMenuSchema = MenuSchema

export const UpdateMenuSchema = MenuSchema.partial()

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const CategorySchema = z.object({
    menu_id: z.string().uuid('ID de menú inválido'),
    name: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede superar 50 caracteres'),
    description: z.string()
        .max(200, 'La descripción no puede superar 200 caracteres')
        .optional()
        .nullable(),
    is_visible: z.boolean().default(true),
})

export const CreateCategorySchema = CategorySchema

export const UpdateCategorySchema = CategorySchema.partial().omit({ menu_id: true })

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

const AllergenEnum = z.enum([
    'gluten',
    'dairy',
    'eggs',
    'fish',
    'shellfish',
    'nuts',
    'peanuts',
    'soy',
    'celery',
    'mustard',
    'sesame',
    'sulfites',
    'lupin',
    'mollusks',
])

const ProductLabelEnum = z.enum([
    'vegan',
    'vegetarian',
    'gluten_free',
    'lactose_free',
    'spicy',
    'new',
    'recommended',
    'popular',
])

const ProductExtraSchema = z.object({
    name: z.string()
        .min(1, 'El nombre del extra es obligatorio')
        .max(50, 'El nombre no puede superar 50 caracteres'),
    price: z.number()
        .min(0.10, 'El precio mínimo es €0.10')
        .max(99.99, 'El precio máximo es €99.99'),
})

const ProductOptionSchema = z.object({
    name: z.string()
        .min(1, 'El nombre de la opción es obligatorio')
        .max(50, 'El nombre no puede superar 50 caracteres'),
    values: z.array(z.string().min(1, 'El valor no puede estar vacío'))
        .min(2, 'Debe haber al menos 2 valores')
        .max(8, 'No puede haber más de 8 valores'),
})

export const ProductSchema = z.object({
    category_id: z.string().uuid('ID de categoría inválido'),
    name: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(80, 'El nombre no puede superar 80 caracteres'),
    description: z.string()
        .max(300, 'La descripción no puede superar 300 caracteres')
        .optional()
        .nullable(),
    price: z.number()
        .min(0.10, 'El precio mínimo es €0.10')
        .max(9999.99, 'El precio máximo es €9999.99'),
    image_url: z.string().optional().nullable(),  // Accept any string, Supabase URLs are valid
    allergens: z.array(z.string()).max(14, 'Máximo 14 alérgenos').default([]),
    labels: z.array(z.string()).max(8, 'Máximo 8 etiquetas').default([]),
    extras: z.array(ProductExtraSchema).max(10, 'Máximo 10 extras').default([]),
    options: z.array(ProductOptionSchema).max(5, 'Máximo 5 opciones').default([]),
    is_available: z.boolean().default(true),
})

export const CreateProductSchema = ProductSchema

export const UpdateProductSchema = ProductSchema.partial().omit({ category_id: true })

// ============================================================================
// REORDER SCHEMAS
// ============================================================================

export const ReorderSchema = z.object({
    orderedIds: z.array(z.string().uuid()).min(1, 'Debe haber al menos 1 elemento'),
})

// ============================================================================
// THEME SCHEMAS
// ============================================================================

export const UpdateThemeSchema = z.object({
    themeId: z.string().min(1, 'ID de tema inválido'),
    overrides: z.object({
        primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional(),
    }).optional(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MenuInput = z.infer<typeof MenuSchema>
export type CreateMenuInput = z.infer<typeof CreateMenuSchema>
export type UpdateMenuInput = z.infer<typeof UpdateMenuSchema>

export type CategoryInput = z.infer<typeof CategorySchema>
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>

export type ProductInput = z.infer<typeof ProductSchema>
export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

export type ReorderInput = z.infer<typeof ReorderSchema>
export type UpdateThemeInput = z.infer<typeof UpdateThemeSchema>
