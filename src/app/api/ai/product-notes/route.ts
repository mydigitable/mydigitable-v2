import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        // ✅ Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
        }

        const { nombre, descripcion } = await request.json()

        if (!nombre) {
            return NextResponse.json(
                { error: 'El nombre del producto es requerido' },
                { status: 400 }
            )
        }

        const prompt = `Eres un chef ejecutivo experto. Para el plato "${nombre}"${descripcion ? ` (${descripcion})` : ''}, genera una nota interna breve (máx 80 palabras) para el staff del restaurante que incluya:
- Temperatura o punto de servicio ideal
- Maridaje recomendado (vino, bebida)
- Un tip de presentación o emplatado
- Si aplica, instrucción especial para cocina (alergias cruzadas, tiempo de preparación)

Tono: profesional pero directo. Es para uso interno. Responde solo el texto de la nota, sin títulos ni formato.`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Eres un chef ejecutivo experto que ayuda a restaurantes a crear notas internas para su staff.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 200,
        })

        const notas = completion.choices[0]?.message?.content?.trim() || ''

        return NextResponse.json({ notas })
    } catch (error) {
        console.error('Error en /api/ai/product-notes:', error)
        return NextResponse.json(
            { error: 'Error al generar las notas' },
            { status: 500 }
        )
    }
}
