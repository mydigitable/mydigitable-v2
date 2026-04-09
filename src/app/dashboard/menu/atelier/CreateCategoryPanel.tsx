'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
    menuId: string
    restaurantId: string
    onClose: () => void
    onSuccess: () => void
}

export function CreateCategoryPanel({ menuId, restaurantId, onClose, onSuccess }: Props) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [visible, setVisible] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    async function handleSubmit() {
        if (!name.trim()) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase.from('menu_categories').insert({
                menu_id: menuId,
                restaurant_id: restaurantId,
                name: name.trim(),
                description: description.trim() || null,
                visible,
                display_order: 999,
            })

            if (error) throw error
            onSuccess()
        } catch (error) {
            console.error('Error creating category:', error)
            alert('Error al crear la categoría')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className="atelier-overlay" onClick={onClose} />
            <div className="atelier-slide-panel">
                {/* Header */}
                <div className="p-6" style={{ borderBottom: '1px solid var(--atelier-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="atelier-serif text-2xl font-bold" style={{ color: 'var(--atelier-ink)' }}>
                            Nueva categoría
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            style={{ color: 'var(--atelier-ink2)' }}
                        >
                            ✕
                        </button>
                    </div>
                    <p className="atelier-sans text-sm" style={{ color: 'var(--atelier-ink2)' }}>
                        Organiza tu menú en categorías
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            Nombre <span style={{ color: 'var(--atelier-red)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Entrantes"
                            className="atelier-input"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descripción de la categoría"
                            className="atelier-input resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--atelier-surface)' }}>
                        <div
                            className={`atelier-toggle ${visible ? 'active' : ''}`}
                            onClick={() => setVisible(!visible)}
                        >
                            <div className="atelier-toggle-knob" />
                        </div>
                        <div>
                            <p className="atelier-sans text-sm font-semibold" style={{ color: 'var(--atelier-ink)' }}>
                                Visible para los clientes
                            </p>
                            <p className="atelier-sans text-xs" style={{ color: 'var(--atelier-ink2)' }}>
                                Mostrar esta categoría en el menú público
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
                        disabled={!name.trim() || isSubmitting}
                        className="atelier-btn-primary atelier-sans text-sm flex-1"
                        style={{ opacity: !name.trim() || isSubmitting ? 0.5 : 1 }}
                    >
                        {isSubmitting ? 'Creando...' : 'Crear categoría'}
                    </button>
                </div>
            </div>
        </>
    )
}
