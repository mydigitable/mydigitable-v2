import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: NextRequest) {
    try {
        // ✅ Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
        }

        const { productName } = await request.json()

        if (!productName) {
            return NextResponse.json({
                success: false,
                error: 'Nombre de producto requerido'
            }, { status: 400 })
        }

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: `Eres un experto en gastronomía. Genera UNA descripción apetitosa y profesional para este plato de restaurante:

Nombre del plato: ${productName}

Requisitos:
- Máximo 120 caracteres
- Debe ser apetitosa y hacer que el cliente quiera pedirlo
- Menciona los ingredientes principales
- Usa un tono profesional pero cercano

Responde SOLO con la descripción, sin comillas, sin formato adicional, solo el texto.`
            }]
        })

        const content = message.content[0]
        if (content.type !== 'text') {
            throw new Error('Respuesta inesperada de IA')
        }

        const description = content.text.trim()

        return NextResponse.json({
            success: true,
            description
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.error('AI Generation Error:', errorMessage)
        return NextResponse.json({
            success: false,
            error: errorMessage || 'Error al generar descripción'
        }, { status: 500 })
    }
}
