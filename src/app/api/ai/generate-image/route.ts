import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================
// AI Image Generation for Products
// Strategy:
//   1. Try Gemini image generation (if available)
//   2. Search TheMealDB for real food images
//   3. Use Foodish API as food-specific fallback
//   → Download and upload to Supabase for permanent URL
// ============================================

export async function POST(request: Request) {
    try {
        // ✅ Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
        }

        const { productName, description } = await request.json()

        if (!productName?.trim()) {
            return NextResponse.json({ success: false, error: 'Nombre del producto requerido' })
        }

        // Strategy 1: Try Gemini image generation
        const geminiResult = await tryGeminiImageGeneration(productName, description)
        if (geminiResult) {
            // Upload base64 to Supabase
            const uploaded = await uploadBase64ToSupabase(geminiResult)
            return NextResponse.json({
                success: true,
                imageUrl: uploaded || geminiResult,
                source: 'gemini'
            })
        }

        // Strategy 2: Search TheMealDB (free, food-specific)
        const mealDbResult = await tryMealDBSearch(productName)
        if (mealDbResult) {
            const uploaded = await downloadAndUpload(mealDbResult)
            return NextResponse.json({
                success: true,
                imageUrl: uploaded || mealDbResult,
                source: 'mealdb'
            })
        }

        // Strategy 3: Foodish random food (always works)
        const foodishResult = await tryFoodishAPI(productName)
        if (foodishResult) {
            const uploaded = await downloadAndUpload(foodishResult)
            return NextResponse.json({
                success: true,
                imageUrl: uploaded || foodishResult,
                source: 'foodish'
            })
        }

        // Absolute fallback: Foodish random
        try {
            const res = await fetch('https://foodish-api.com/api/', { signal: AbortSignal.timeout(5000) })
            const data = await res.json()
            if (data.image) {
                const uploaded = await downloadAndUpload(data.image)
                return NextResponse.json({
                    success: true,
                    imageUrl: uploaded || data.image,
                    source: 'foodish_random'
                })
            }
        } catch { /* ignore */ }

        return NextResponse.json({
            success: false,
            error: 'No se pudo generar imagen. Intenta subir una foto manualmente.'
        })

    } catch (error) {
        console.error('[AI Image] Error:', error)
        return NextResponse.json({
            success: false,
            error: 'Error al generar imagen. Intenta de nuevo.'
        }, { status: 500 })
    }
}

// ============================================
// Strategy 1: Gemini Image Generation
// ============================================
async function tryGeminiImageGeneration(productName: string, description?: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) return null

    const prompt = `Generate a professional food photography image of "${productName}"${description ? ` (${description})` : ''}. Beautifully plated, restaurant setting, soft warm lighting, overhead angle, appetizing. No text or watermarks.`

    const models = [
        'gemini-2.0-flash-exp-image-generation',
        'gemini-2.0-flash-preview-image-generation',
    ]

    for (const model of models) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseModalities: ['IMAGE'] },
                    }),
                    signal: AbortSignal.timeout(45000)
                }
            )
            if (!response.ok) continue

            const result = await response.json()
            const parts = result.candidates?.[0]?.content?.parts || []
            for (const part of parts) {
                if (part.inlineData?.data) {
                    const mime = part.inlineData.mimeType || 'image/png'
                    return `data:${mime};base64,${part.inlineData.data}`
                }
            }
        } catch { continue }
    }
    return null
}

// ============================================
// Strategy 2: TheMealDB Search (free, no key needed)
// ============================================
async function tryMealDBSearch(productName: string): Promise<string | null> {
    // Translate common Spanish food terms for better search
    const searchTerms = getSearchTerms(productName)

    for (const term of searchTerms) {
        try {
            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`,
                { signal: AbortSignal.timeout(5000) }
            )
            if (!response.ok) continue

            const data = await response.json()
            if (data.meals && data.meals.length > 0) {
                // Pick a random meal for variety
                const meal = data.meals[Math.floor(Math.random() * data.meals.length)]
                if (meal.strMealThumb) {
                    return meal.strMealThumb
                }
            }
        } catch { continue }
    }
    return null
}

// ============================================
// Strategy 3: Foodish API (food category images)
// ============================================
async function tryFoodishAPI(productName: string): Promise<string | null> {
    const name = productName.toLowerCase()

    // Map product names to Foodish categories
    const categoryMap: Record<string, string> = {
        'pizza': 'pizza',
        'hamburguesa': 'burger',
        'burger': 'burger',
        'pasta': 'pasta',
        'arroz': 'rice',
        'rice': 'rice',
        'paella': 'rice',
        'pollo': 'chicken',
        'chicken': 'chicken',
        'postre': 'dessert',
        'tarta': 'dessert',
        'pastel': 'dessert',
        'helado': 'dessert',
        'ensalada': 'salad',
        'salad': 'salad',
        'sushi': 'sushi',
        'salmón': 'salmon',
        'salmon': 'salmon',
    }

    // Find matching category
    let category: string | null = null
    for (const [keyword, cat] of Object.entries(categoryMap)) {
        if (name.includes(keyword)) {
            category = cat
            break
        }
    }

    const url = category
        ? `https://foodish-api.com/api/images/${category}`
        : 'https://foodish-api.com/api/'

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
        if (!response.ok) return null
        const data = await response.json()
        return data.image || null
    } catch {
        return null
    }
}

// ============================================
// Download remote image and upload to Supabase
// ============================================
async function downloadAndUpload(imageUrl: string): Promise<string | null> {
    try {
        // Download the image
        const response = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) })
        if (!response.ok) return null

        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Determine extension
        const contentType = response.headers.get('content-type') || 'image/jpeg'
        const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'

        // Upload to Supabase
        const supabase = await createClient()
        const fileName = `products/ai_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`

        const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, buffer, {
                contentType,
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            return null // Will use original URL as fallback
        }

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)

        return publicUrl
    } catch (err) {
        console.error('[AI Image] Download/upload error:', err)
        return null
    }
}

// ============================================
// Upload base64 data to Supabase
// ============================================
async function uploadBase64ToSupabase(dataUrl: string): Promise<string | null> {
    try {
        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
        if (!matches) return null

        const contentType = matches[1]
        const base64 = matches[2]
        const buffer = Buffer.from(base64, 'base64')
        const ext = contentType.includes('png') ? 'png' : 'jpg'

        const supabase = await createClient()
        const fileName = `products/ai_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`

        const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, buffer, {
                contentType,
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)

        return publicUrl
    } catch {
        return null
    }
}

// ============================================
// Get English search terms from Spanish product name
// ============================================
function getSearchTerms(productName: string): string[] {
    const name = productName.trim().toLowerCase()
    const terms: string[] = []

    const translations: Record<string, string[]> = {
        'patatas bravas': ['potato'],
        'croqueta': ['croquette', 'fried'],
        'tortilla': ['omelette', 'tortilla'],
        'paella': ['paella', 'rice seafood'],
        'gazpacho': ['gazpacho', 'tomato soup'],
        'churros': ['churros'],
        'ensalada': ['salad'],
        'hamburguesa': ['burger', 'hamburger'],
        'pizza': ['pizza'],
        'pasta': ['pasta', 'spaghetti'],
        'sopa': ['soup'],
        'pollo': ['chicken'],
        'carne': ['steak', 'beef'],
        'pescado': ['fish'],
        'marisco': ['seafood', 'shrimp'],
        'postre': ['dessert'],
        'tarta': ['cake'],
        'helado': ['ice cream'],
        'café': ['coffee'],
        'cerveza': ['beer'],
        'pan': ['bread'],
        'arroz': ['rice'],
        'huevos': ['eggs', 'omelette'],
        'bocadillo': ['sandwich'],
        'taco': ['taco'],
        'nachos': ['nachos'],
        'alitas': ['chicken wings'],
        'salmon': ['salmon'],
        'salmón': ['salmon'],
        'atún': ['tuna'],
        'pulpo': ['octopus'],
        'calamares': ['calamari', 'squid'],
        'gambas': ['shrimp', 'prawn'],
    }

    // Check for keyword matches
    for (const [es, en] of Object.entries(translations)) {
        if (name.includes(es)) {
            terms.push(...en)
        }
    }

    // Also try the raw name (works for international dishes)
    if (terms.length === 0) {
        terms.push(name)
    }

    return terms
}
