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

    const { nombre, descripcion } = await req.json();

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
          content: `Eres un experto en gastronomía y gestión de restaurantes. Dado el nombre de un plato, genera las opciones de personalización que un cliente esperaría al pedirlo.

Responde SOLO con JSON válido con este formato exacto:
{
  "modificadores": [
    {
      "nombre": "Punto de la carne",
      "tipo": "radio",
      "obligatorio": true,
      "opciones": ["Poco hecha", "Al punto", "Muy hecha"]
    }
  ],
  "extras": [
    {
      "grupo": "Ingredientes extra",
      "max_selecciones": 5,
      "opciones": [
        {"nombre": "Extra queso", "precio": 1.50},
        {"nombre": "Bacon", "precio": 2.00}
      ]
    }
  ],
  "combos": [
    {
      "nombre": "Menú completo",
      "descripcion": "Con patatas fritas y bebida",
      "precio_extra": 4.50
    }
  ]
}

Reglas:
- modificadores: opciones SIN costo adicional que personalizan el plato (tipo: "radio" para elegir 1, "checkbox" para varias). Solo incluir si aplica al tipo de plato.
- extras: ingredientes o suplementos CON precio adicional. Precios realistas en euros para restaurante medio-alto español.
- combos: agrupaciones con precio especial (ej: menú con bebida, para compartir, etc). Solo si aplica.
- Si un plato es simple (ej: pan, agua) no pongas opciones innecesarias. Devuelve arrays vacíos.
- Máximo 3 grupos de modificadores, 2 grupos de extras, 2 combos.
- Los precios de extras deben ser realistas (0.50€ - 5.00€).`
        },
        {
          role: "user",
          content: `Plato: ${nombre}${descripcion ? ` — ${descripcion}` : ''}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Respuesta vacía de la IA");
    }

    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en AI product-options endpoint:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud de IA", details: error.message },
      { status: 500 }
    );
  }
}
