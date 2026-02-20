// ============================================================================
// AI ACTIONS - Server actions for AI features
// ============================================================================

'use server'

import { createClient } from '@/lib/supabase/server'
import { generateText, generateJSON, generateImage } from '@/lib/ai/openai-client'
import { revalidatePath } from 'next/cache'

// ============================================================================
// HELPER: Get Restaurant AI Settings
// ============================================================================

async function getRestaurantId(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    return restaurant?.id || null
}

async function getAISettings() {
    const supabase = await createClient()
    const restaurantId = await getRestaurantId()

    if (!restaurantId) {
        return { enabled: false, features: {}, apiKey: null }
    }

    const { data } = await supabase
        .from('restaurants')
        .select('ai_settings')
        .eq('id', restaurantId)
        .single()

    const settings = data?.ai_settings || {}
    return {
        enabled: settings.enabled || false,
        features: settings.features || {},
        apiKey: settings.openai_api_key || null,
    }
}

// ============================================================================
// AUTO-DESCRIPTIONS
// ============================================================================

export async function generateProductDescription(
    productName: string,
    categoryName?: string
): Promise<{ success: boolean; description?: string; error?: string }> {
    try {
        const settings = await getAISettings()

        if (!settings.enabled || !settings.features.auto_descriptions) {
            return { success: false, error: 'AI descriptions not enabled' }
        }

        const prompt = `Genera una descripción corta y atractiva (máximo 120 caracteres) para un plato de restaurante llamado "${productName}"${categoryName ? ` en la categoría "${categoryName}"` : ''}. 
        
La descripción debe:
- Ser apetitosa y profesional
- Mencionar ingredientes principales si son evidentes del nombre
- Usar lenguaje que invite a pedir el plato
- Estar en español
- NO incluir el nombre del plato en la descripción

Responde SOLO con la descripción, sin comillas ni formato adicional.`

        const description = await generateText(prompt, {
            maxTokens: 100,
            temperature: 0.8,
        })

        // Track usage
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()
        if (restaurantId) {
            await supabase.rpc('increment_ai_usage', {
                restaurant_id: restaurantId,
                usage_type: 'descriptions_count',
            })
        }

        return { success: true, description: description.trim() }
    } catch (error) {
        console.error('Error generating description:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error generating description',
        }
    }
}

// ============================================================================
// ALLERGEN DETECTION
// ============================================================================

export async function detectAllergens(
    productName: string,
    description?: string
): Promise<{ success: boolean; allergens?: string[]; error?: string }> {
    try {
        const settings = await getAISettings()

        if (!settings.enabled || !settings.features.allergen_detection) {
            return { success: false, error: 'AI allergen detection not enabled' }
        }

        const prompt = `Analiza este plato y devuelve un objeto JSON con los alérgenos detectados:

Plato: "${productName}"
${description ? `Descripción: "${description}"` : ''}

Alérgenos posibles: gluten, dairy, eggs, fish, shellfish, nuts, peanuts, soy, celery, mustard, sesame, sulfites, lupin, mollusks

Responde SOLO con JSON en este formato:
{
  "allergens": ["allergen1", "allergen2"]
}

Si no detectas alérgenos, devuelve un array vacío.`

        const result = await generateJSON<{ allergens: string[] }>(prompt, {
            maxTokens: 200,
        })

        return { success: true, allergens: result.allergens || [] }
    } catch (error) {
        console.error('Error detecting allergens:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error detecting allergens',
        }
    }
}

// ============================================================================
// EXTRA SUGGESTIONS
// ============================================================================

export async function suggestExtras(
    productName: string,
    categoryName?: string
): Promise<{
    success: boolean
    extras?: Array<{ name: string; price: number; type: string }>
    error?: string
}> {
    try {
        const settings = await getAISettings()

        if (!settings.enabled || !settings.features.extra_suggestions) {
            return { success: false, error: 'AI extra suggestions not enabled' }
        }

        const prompt = `Para un plato "${productName}"${categoryName ? ` de categoría "${categoryName}"` : ''}, sugiere 3-5 extras relevantes.

Responde SOLO con JSON en este formato:
{
  "extras": [
    {"name": "Bacon extra", "price": 2.00, "type": "addon"},
    {"name": "Sin cebolla", "price": 0, "type": "modifier"}
  ]
}

Tipos válidos: "addon" (ingrediente extra con precio), "modifier" (modificación sin precio)
Precios en euros, razonables para España.`

        const result = await generateJSON<{
            extras: Array<{ name: string; price: number; type: string }>
        }>(prompt, {
            maxTokens: 400,
        })

        return { success: true, extras: result.extras || [] }
    } catch (error) {
        console.error('Error suggesting extras:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error suggesting extras',
        }
    }
}

// ============================================================================
// IMAGE GENERATION
// ============================================================================

export async function generateProductImage(
    productName: string,
    description?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
        const settings = await getAISettings()

        if (!settings.enabled || !settings.features.image_generation) {
            return { success: false, error: 'AI image generation not enabled' }
        }

        const prompt = `Professional food photography of ${productName}. ${description || ''}
High quality, appetizing, restaurant menu style, natural lighting, white background, top-down view, garnished beautifully.`

        const imageUrl = await generateImage(prompt, {
            size: '1024x1024',
            quality: 'standard',
        })

        // Track usage
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()
        if (restaurantId) {
            await supabase.rpc('increment_ai_usage', {
                restaurant_id: restaurantId,
                usage_type: 'images_count',
            })
        }

        return { success: true, imageUrl }
    } catch (error) {
        console.error('Error generating image:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error generating image',
        }
    }
}

// ============================================================================
// AI SETTINGS MANAGEMENT
// ============================================================================

export async function updateAISettings(settings: {
    enabled?: boolean
    features?: Record<string, boolean>
    openai_api_key?: string
}): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const restaurantId = await getRestaurantId()

        if (!restaurantId) {
            return { success: false, error: 'Restaurant not found' }
        }

        // Get current settings
        const { data: current } = await supabase
            .from('restaurants')
            .select('ai_settings')
            .eq('id', restaurantId)
            .single()

        const currentSettings = current?.ai_settings || {}

        // Merge with new settings
        const newSettings = {
            ...currentSettings,
            enabled: settings.enabled ?? currentSettings.enabled,
            features: {
                ...currentSettings.features,
                ...settings.features,
            },
            openai_api_key: settings.openai_api_key ?? currentSettings.openai_api_key,
        }

        const { error } = await supabase
            .from('restaurants')
            .update({ ai_settings: newSettings })
            .eq('id', restaurantId)

        if (error) throw error

        revalidatePath('/dashboard/settings/ai')
        return { success: true }
    } catch (error) {
        console.error('Error updating AI settings:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error updating settings',
        }
    }
}

export async function getAISettingsForUI(): Promise<{
    success: boolean
    settings?: any
    error?: string
}> {
    try {
        const settings = await getAISettings()
        return { success: true, settings }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error loading settings',
        }
    }
}
