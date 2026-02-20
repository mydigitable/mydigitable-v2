import { z } from 'zod'

// ============================================
// Validaciones Zod - Sistema de Productos Pro
// ============================================

export const ProductVariantSchema = z.object({
    name: z.string().min(1, 'Nombre requerido').max(50, 'Máximo 50 caracteres'),
    price_modifier: z.number(),
    attributes: z.record(z.unknown()).optional().default({}),
    display_order: z.number().default(0),
    is_available: z.boolean().default(true),
})

export const PriceRuleSchema = z.object({
    condition_type: z.enum(['location', 'time', 'day', 'customer_type']),
    condition_value: z.record(z.unknown()),
    price_modifier_type: z.enum(['fixed', 'percentage']),
    price_modifier_value: z.number(),
    priority: z.number().default(0),
    is_active: z.boolean().default(true),
})

export const CreateProductProSchema = z.object({
    name: z.string().min(2, 'Nombre mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
    description: z.string().max(500, 'Máximo 500 caracteres').optional(),
    category_id: z.string().uuid('ID de categoría inválido'),
    price: z.number().min(0.10, 'Precio mínimo €0.10').max(9999, 'Precio máximo €9999'),
    image_url: z.string().url('URL inválida').optional().or(z.literal('')),
    dietary_tags: z.array(z.string()).default([]),
    allergens: z.array(z.string()).default([]),
    labels: z.array(z.string()).default([]),

    // Tiempo
    prep_time_minutes: z.number().min(0).max(240).optional(),
    show_prep_time: z.boolean().default(false),

    // IA
    use_ai_description: z.boolean().default(false),
    use_ai_image: z.boolean().default(false),

    // Relaciones
    variants: z.array(ProductVariantSchema).optional(),
    price_rules: z.array(PriceRuleSchema).optional(),
})

export type CreateProductProInput = z.infer<typeof CreateProductProSchema>
