import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        // ✅ Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
        }

        const { nombre } = await req.json();

        if (!nombre || nombre.trim().length === 0) {
            return NextResponse.json(
                { error: "El nombre del producto es requerido" },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Eres un experto en gastronomía española. Dado el nombre de un plato, genera una descripción apetitosa (15-25 palabras), un precio realista para un restaurante medio-alto español, los alérgenos presentes, y etiquetas dietéticas aplicables. Responde SOLO con JSON válido en este formato exacto: {\"descripcion\":\"...\",\"precio\":12.50,\"alergenos\":[\"gluten\",\"lacteos\"],\"etiquetas\":[\"vegan\"]}. Alérgenos posibles: gluten, lacteos, huevos, pescado, marisco, frutos_secos, soja, apio, mostaza, sesamo, sulfitos, altramuces, moluscos. Etiquetas posibles: vegan, vegetarian, gluten_free, lactose_free, spicy, organic."
                },
                {
                    role: "user",
                    content: `Nombre del plato: ${nombre}`
                }
            ],
            temperature: 0.7,
            max_tokens: 300,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Respuesta vacía de la IA");
        }

        const data = JSON.parse(content);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error en AI product endpoint:", error);
        return NextResponse.json(
            { error: "Error al procesar la solicitud de IA", details: error.message },
            { status: 500 }
        );
    }
}
