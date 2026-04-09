import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ================================================
// Generación de descripciones CORTAS para productos
// Gemini (si disponible) → Plantilla inteligente
// ================================================

// Plantillas cortas por tipo de comida (2-3 ingredientes)
const FOOD_DESCRIPTIONS: Record<string, string[]> = {
    // Pizzas
    pizza: [
        'Tomate, mozzarella y albahaca fresca',
        'Base de tomate con mozzarella fundida',
        'Masa artesanal con tomate y queso',
    ],
    margarita: ['Tomate San Marzano, mozzarella y albahaca'],
    muzzarella: ['Tomate, mozzarella fundida y orégano'],
    napolitana: ['Tomate, anchoas, aceitunas y alcaparras'],
    carbonara: ['Nata, bacon crujiente y parmesano'],
    cuatro: ['Mozzarella, gorgonzola, parmesano y emmental'],
    hawaiana: ['Tomate, mozzarella, jamón y piña'],
    pepperoni: ['Tomate, mozzarella y pepperoni picante'],
    bbq: ['Base BBQ, pollo, bacon y cebolla'],
    vegetal: ['Pimientos, champiñones, cebolla y aceitunas'],

    // Hamburguesas
    hamburguesa: ['Carne de ternera, lechuga y tomate'],
    burger: ['Carne a la parrilla con queso y bacon'],
    smash: ['Doble carne smash con queso cheddar'],
    classic: ['Carne, queso, lechuga, tomate y cebolla'],

    // Ensaladas
    ensalada: ['Mix de hojas verdes, tomate y vinagreta'],
    cesar: ['Lechuga romana, pollo, parmesano y croutons'],
    griega: ['Tomate, pepino, cebolla y queso feta'],
    caprese: ['Tomate, mozzarella fresca y albahaca'],

    // Pasta
    pasta: ['Pasta al dente con salsa casera'],
    espagueti: ['Espaguetis con salsa de tomate casera'],
    lasaña: ['Capas de pasta, carne, bechamel y queso'],
    ravioli: ['Raviolis rellenos con salsa de tu elección'],
    penne: ['Penne con salsa de tomate y albahaca'],
    risotto: ['Arroz cremoso con parmesano'],

    // Carnes
    carne: ['Carne a la parrilla con guarnición'],
    pollo: ['Pollo jugoso con especias y guarnición'],
    ternera: ['Ternera tierna con salsa de la casa'],
    cerdo: ['Lomo de cerdo con guarnición de temporada'],
    costillas: ['Costillas glaseadas con salsa BBQ'],
    entrecot: ['Entrecot a la parrilla al punto'],
    solomillo: ['Solomillo de ternera con reducción'],
    chuleta: ['Chuleta jugosa a la brasa'],

    // Pescados
    pescado: ['Pescado fresco del día con guarnición'],
    salmon: ['Salmón a la plancha con verduras'],
    merluza: ['Merluza al horno con patatas'],
    atun: ['Atún rojo con sésamo y soja'],
    gambas: ['Gambas al ajillo con pan crujiente'],
    pulpo: ['Pulpo a la gallega con pimentón'],
    calamares: ['Calamares fritos con limón'],

    // Tapas
    tapa: ['Tapa casera para compartir'],
    patatas: ['Patatas con salsa brava casera'],
    croquetas: ['Croquetas caseras de jamón ibérico'],
    tortilla: ['Tortilla española con cebolla'],
    jamon: ['Jamón ibérico cortado a cuchillo'],
    queso: ['Selección de quesos artesanales'],
    aceitunas: ['Aceitunas aliñadas de la casa'],
    pan: ['Pan artesanal con tomate y aceite'],

    // Postres
    postre: ['Postre casero del día'],
    tarta: ['Tarta casera con nata montada'],
    helado: ['Helado artesanal, elige tu sabor'],
    flan: ['Flan casero con caramelo'],
    brownie: ['Brownie de chocolate con helado'],
    tiramisu: ['Tiramisú con mascarpone y café'],
    cheesecake: ['Tarta de queso cremosa'],

    // Bebidas
    bebida: ['Bebida refrescante'],
    cafe: ['Café de tueste natural'],
    cerveza: ['Cerveza fría de grifo'],
    vino: ['Copa de vino seleccionado'],
    zumo: ['Zumo natural recién exprimido'],
    agua: ['Agua mineral natural'],
    refresco: ['Refresco bien frío'],
    cocktail: ['Cóctel preparado al momento'],
    sangria: ['Sangría casera con frutas'],

    // Desayunos
    tostada: ['Tostada con tomate y aceite de oliva'],
    croissant: ['Croissant de mantequilla recién horneado'],
    huevos: ['Huevos al gusto con pan artesanal'],

    // Arroces
    paella: ['Arroz, mariscos y azafrán'],
    arroz: ['Arroz caldoso con ingredientes frescos'],
}

async function tryGemini(productName: string, category: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) return null

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Describe este plato en máximo 50 caracteres: ${productName}${category ? ` (${category})` : ''}

IMPORTANTE:
- Solo menciona 2-3 ingredientes principales
- Sin adornos ni adjetivos excesivos  
- Español natural
- Muy corto y directo

Ejemplos:
"Pizza Napolitana" → "Tomate, mozzarella y albahaca"
"Hamburguesa BBQ" → "Carne, bacon y salsa BBQ"
"Ensalada César" → "Lechuga, pollo y parmesano"

Responde SOLO con la descripción:`
                    }]
                }],
                generationConfig: { maxOutputTokens: 30, temperature: 0.5 }
            })
        })

        if (response.ok) {
            const data = await response.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            if (text && text.length < 80) return text.replace(/^["']|["']$/g, '')
        }
        return null
    } catch {
        return null
    }
}

function getTemplateDescription(productName: string, category: string): string {
    const name = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const cat = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // Try exact product name keywords first, then category
    for (const [keyword, descriptions] of Object.entries(FOOD_DESCRIPTIONS)) {
        if (name.includes(keyword)) {
            return descriptions[Math.floor(Math.random() * descriptions.length)]
        }
    }
    for (const [keyword, descriptions] of Object.entries(FOOD_DESCRIPTIONS)) {
        if (cat.includes(keyword)) {
            return descriptions[Math.floor(Math.random() * descriptions.length)]
        }
    }

    // Generic fallback - just the product name with a simple description
    return `${productName} de la casa`
}

export async function POST(request: NextRequest) {
    try {
        // ✅ Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
        }

        const { productName, category } = await request.json()

        if (!productName) {
            return NextResponse.json({ success: false, error: 'Nombre requerido' }, { status: 400 })
        }

        // Try Gemini first (fast, single attempt, no retries)
        const aiDescription = await tryGemini(productName, category || '')

        if (aiDescription) {
            return NextResponse.json({
                success: true,
                description: aiDescription,
                source: 'gemini'
            })
        }

        // Instant fallback: template description
        const description = getTemplateDescription(productName, category || '')

        return NextResponse.json({
            success: true,
            description,
            source: 'template'
        })

    } catch (error: unknown) {
        console.error('Description error:', error)
        return NextResponse.json({
            success: false,
            error: 'Error al generar descripción'
        }, { status: 500 })
    }
}
