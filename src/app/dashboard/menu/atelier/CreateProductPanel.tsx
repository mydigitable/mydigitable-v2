'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ALLERGENS, DIETARY_LABELS } from '@/lib/constants/menu'

type Props = {
    categoryId: string
    restaurantId: string
    onClose: () => void
    onSuccess: () => void
}

type AIState = 'idle' | 'thinking' | 'done'

export function CreateProductPanel({ categoryId, restaurantId, onClose, onSuccess }: Props) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [allergens, setAllergens] = useState<string[]>([])
    const [labels, setLabels] = useState<string[]>([])
    const [available, setAvailable] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [aiState, setAiState] = useState<AIState>('idle')
    const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set())
    const debounceTimer = useRef<NodeJS.Timeout>()
    const supabase = createClient()

    useEffect(() => {
        if (name.trim().length > 2) {
            // Clear previous timer
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }

            // Set new timer for 900ms
            debounceTimer.current = setTimeout(() => {
                triggerAI()
            }, 900)
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
    }, [name])

    async function triggerAI() {
        if (!name.trim() || description.trim().length > 0) return

        setAiState('thinking')
        try {
            const response = await fetch('/api/ai/product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: name }),
            })

            if (!response.ok) throw new Error('AI request failed')

            const data = await response.json()
            const newFilledFields = new Set<string>()

            // Fill description with typewriter effect
            if (data.descripcion && !description) {
                typewriterEffect(data.descripcion)
                newFilledFields.add('description')
            }

            // Fill price
            if (data.precio && !price) {
                setPrice(data.precio.toString())
                newFilledFields.add('price')
            }

            // Fill allergens
            if (data.alergenos && allergens.length === 0) {
                setAllergens(data.alergenos)
                newFilledFields.add('allergens')
            }

            // Fill labels
            if (data.etiquetas && labels.length === 0) {
                setLabels(data.etiquetas)
                newFilledFields.add('labels')
            }

            setAiFilledFields(newFilledFields)
            setAiState('done')

            // Reset AI state after 3 seconds
            setTimeout(() => {
                setAiState('idle')
                setAiFilledFields(new Set())
            }, 3000)
        } catch (error) {
            console.error('AI error:', error)
            setAiState('idle')
        }
    }

    function typewriterEffect(text: string) {
        let index = 0
        const interval = setInterval(() => {
            if (index < text.length) {
                setDescription((prev) => prev + text[index])
                index++
            } else {
                clearInterval(interval)
            }
        }, 18)
    }

    function toggleAllergen(id: string) {
        setAllergens((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
        )
    }

    function toggleLabel(id: string) {
        setLabels((prev) =>
            prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
        )
    }

    async function handleSubmit() {
        if (!name.trim() || !price) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase.from('products').insert({
                category_id: categoryId,
                restaurant_id: restaurantId,
                name: name.trim(),
                description: description.trim() || null,
                price: parseFloat(price),
                allergens,
                labels,
                is_available: available,
                display_order: 999,
            })

            if (error) throw error
            onSuccess()
        } catch (error) {
            console.error('Error creating product:', error)
            alert('Error al crear el producto')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getAIStateMessage = () => {
        switch (aiState) {
            case 'thinking':
                return 'ChatGPT está analizando...'
            case 'done':
                return 'Campos completados por IA'
            default:
                return ''
        }
    }

    return (
        <>
            <div className="atelier-overlay" onClick={onClose} />
            <div className="atelier-slide-panel">
                {/* Header */}
                <div className="p-6" style={{ borderBottom: '1px solid var(--atelier-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <h2 className="atelier-serif text-2xl font-bold" style={{ color: 'var(--atelier-ink)' }}>
                                Nuevo producto
                            </h2>
                            {aiState !== 'idle' && (
                                <div className="flex items-center gap-2">
                                    {aiState === 'thinking' && <div className="atelier-ai-pulse" />}
                                    <span className="atelier-sans text-xs font-medium" style={{ color: 'var(--atelier-gold)' }}>
                                        {getAIStateMessage()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            style={{ color: 'var(--atelier-ink2)' }}
                        >
                            ✕
                        </button>
                    </div>
                    <p className="atelier-sans text-sm" style={{ color: 'var(--atelier-ink2)' }}>
                        Escribe el nombre y ChatGPT completará el resto
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image upload placeholder */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            Imagen
                        </label>
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ borderColor: 'var(--atelier-border)' }}
                        >
                            <div className="text-4xl mb-2">📸</div>
                            <p className="atelier-sans text-sm" style={{ color: 'var(--atelier-ink3)' }}>
                                Arrastra una imagen o haz click
                            </p>
                            <p className="atelier-sans text-xs mt-1" style={{ color: 'var(--atelier-ink3)' }}>
                                (Próximamente)
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            Nombre del plato <span style={{ color: 'var(--atelier-red)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Risotto de setas"
                            className="atelier-input"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            Descripción
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción del plato..."
                            className={`atelier-input resize-none ${aiFilledFields.has('description') ? 'atelier-ai-border' : ''}`}
                            rows={3}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            Precio (€) <span style={{ color: 'var(--atelier-red)' }}>*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            className={`atelier-input ${aiFilledFields.has('price') ? 'atelier-ai-border' : ''}`}
                        />
                    </div>

                    {/* Allergens */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-3" style={{ color: 'var(--atelier-ink)' }}>
                            Alérgenos
                        </label>
                        <div className={`flex flex-wrap gap-2 ${aiFilledFields.has('allergens') ? 'p-3 rounded-lg atelier-ai-border' : ''}`}>
                            {ALLERGENS.map((allergen) => (
                                <button
                                    key={allergen.id}
                                    onClick={() => toggleAllergen(allergen.id)}
                                    className="atelier-sans px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1"
                                    style={{
                                        background: allergens.includes(allergen.id) ? allergen.color + '20' : 'var(--atelier-surface)',
                                        color: allergens.includes(allergen.id) ? allergen.color : 'var(--atelier-ink2)',
                                        border: `1px solid ${allergens.includes(allergen.id) ? allergen.color : 'var(--atelier-border)'}`,
                                    }}
                                >
                                    <span>{allergen.emoji}</span>
                                    <span>{allergen.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Labels */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-3" style={{ color: 'var(--atelier-ink)' }}>
                            Etiquetas
                        </label>
                        <div className={`flex flex-wrap gap-2 ${aiFilledFields.has('labels') ? 'p-3 rounded-lg atelier-ai-border' : ''}`}>
                            {DIETARY_LABELS.map((label) => (
                                <button
                                    key={label.id}
                                    onClick={() => toggleLabel(label.id)}
                                    className="atelier-sans px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1"
                                    style={{
                                        background: labels.includes(label.id) ? label.bg : 'var(--atelier-surface)',
                                        color: labels.includes(label.id) ? label.color : 'var(--atelier-ink2)',
                                        border: `1px solid ${labels.includes(label.id) ? label.color : 'var(--atelier-border)'}`,
                                    }}
                                >
                                    <span>{label.emoji}</span>
                                    <span>{label.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--atelier-surface)' }}>
                        <div
                            className={`atelier-toggle ${available ? 'active' : ''}`}
                            onClick={() => setAvailable(!available)}
                        >
                            <div className="atelier-toggle-knob" />
                        </div>
                        <div>
                            <p className="atelier-sans text-sm font-semibold" style={{ color: 'var(--atelier-ink)' }}>
                                Disponible
                            </p>
                            <p className="atelier-sans text-xs" style={{ color: 'var(--atelier-ink2)' }}>
                                El producto está en stock
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 flex gap-3" style={{ borderTop: '1px solid var(--atelier-border)' }}>
                    <button onClick={onClose} className="atelier-btn-ghost atelier-sans text-sm flex-1">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || !price || isSubmitting}
                        className="atelier-btn-primary atelier-sans text-sm flex-1"
                        style={{ opacity: !name.trim() || !price || isSubmitting ? 0.5 : 1 }}
                    >
                        {isSubmitting ? 'Añadiendo...' : 'Añadir al menú'}
                    </button>
                </div>
            </div>
        </>
    )
}
