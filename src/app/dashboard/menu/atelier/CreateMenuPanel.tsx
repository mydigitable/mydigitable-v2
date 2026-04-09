'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
    restaurantId: string
    onClose: () => void
    onSuccess: () => void
}

const MENU_TYPES = [
    { id: 'general', label: 'General' },
    { id: 'breakfast', label: 'Desayunos' },
    { id: 'lunch', label: 'Almuerzos' },
    { id: 'dinner', label: 'Cenas' },
    { id: 'tasting', label: 'Degustación' },
    { id: 'wine', label: 'Carta de vinos' },
    { id: 'desserts', label: 'Postres' },
    { id: 'seasonal', label: 'Temporada' },
]

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function CreateMenuPanel({ restaurantId, onClose, onSuccess }: Props) {
    const [name, setName] = useState('')
    const [type, setType] = useState('general')
    const [activateNow, setActivateNow] = useState(true)
    const [schedule, setSchedule] = useState(
        DAYS.map(day => ({ day, enabled: true, open: '09:00', close: '23:00' }))
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    function handleDayToggle(index: number) {
        const newSchedule = [...schedule]
        newSchedule[index].enabled = !newSchedule[index].enabled
        setSchedule(newSchedule)
    }

    function handleTimeChange(index: number, field: 'open' | 'close', value: string) {
        const newSchedule = [...schedule]
        newSchedule[index][field] = value
        setSchedule(newSchedule)
    }

    function copyToAll(index: number) {
        const template = schedule[index]
        setSchedule(schedule.map(s => ({ ...s, open: template.open, close: template.close })))
    }

    async function handleSubmit() {
        if (!name.trim()) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase.from('menus').insert({
                restaurant_id: restaurantId,
                name: name.trim(),
                type,
                is_active: activateNow,
                schedule,
                display_order: 999,
            })

            if (error) throw error
            onSuccess()
        } catch (error) {
            console.error('Error creating menu:', error)
            alert('Error al crear la carta')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            {/* Overlay */}
            <div className="atelier-overlay" onClick={onClose} />

            {/* Panel */}
            <div className="atelier-slide-panel">
                {/* Header */}
                <div className="p-6" style={{ borderBottom: '1px solid var(--atelier-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="atelier-serif text-2xl font-bold" style={{ color: 'var(--atelier-ink)' }}>
                            Nueva carta
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
                        Configura los detalles de tu nueva carta de menú
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            Nombre de la carta
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Menú Principal"
                            className="atelier-input"
                            autoFocus
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-3" style={{ color: 'var(--atelier-ink)' }}>
                            Tipo de menú
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {MENU_TYPES.map(menuType => (
                                <button
                                    key={menuType.id}
                                    onClick={() => setType(menuType.id)}
                                    className="atelier-sans px-4 py-2 rounded-full text-sm font-medium transition-all"
                                    style={{
                                        background: type === menuType.id ? 'var(--atelier-accent)' : 'var(--atelier-surface)',
                                        color: type === menuType.id ? 'white' : 'var(--atelier-ink2)',
                                        border: `1px solid ${type === menuType.id ? 'var(--atelier-accent)' : 'var(--atelier-border)'}`,
                                    }}
                                >
                                    {menuType.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="atelier-sans block text-sm font-semibold mb-3" style={{ color: 'var(--atelier-ink)' }}>
                            Horario por día
                        </label>
                        <div className="space-y-3">
                            {schedule.map((day, index) => (
                                <div key={day.day} className="flex items-center gap-3">
                                    <div
                                        className={`atelier-toggle ${day.enabled ? 'active' : ''}`}
                                        onClick={() => handleDayToggle(index)}
                                    >
                                        <div className="atelier-toggle-knob" />
                                    </div>
                                    <span className="atelier-sans text-sm font-medium w-24" style={{ color: 'var(--atelier-ink)' }}>
                                        {day.day}
                                    </span>
                                    {day.enabled && (
                                        <>
                                            <input
                                                type="time"
                                                value={day.open}
                                                onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                                                className="atelier-input text-sm w-28"
                                            />
                                            <span style={{ color: 'var(--atelier-ink2)' }}>-</span>
                                            <input
                                                type="time"
                                                value={day.close}
                                                onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                                                className="atelier-input text-sm w-28"
                                            />
                                            <button
                                                onClick={() => copyToAll(index)}
                                                className="atelier-sans text-xs px-2 py-1 rounded hover:bg-gray-100"
                                                style={{ color: 'var(--atelier-accent)' }}
                                            >
                                                Copiar a todos
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activate Now */}
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--atelier-surface)' }}>
                        <div
                            className={`atelier-toggle ${activateNow ? 'active' : ''}`}
                            onClick={() => setActivateNow(!activateNow)}
                        >
                            <div className="atelier-toggle-knob" />
                        </div>
                        <div>
                            <p className="atelier-sans text-sm font-semibold" style={{ color: 'var(--atelier-ink)' }}>
                                Activar inmediatamente
                            </p>
                            <p className="atelier-sans text-xs" style={{ color: 'var(--atelier-ink2)' }}>
                                La carta estará visible para los clientes
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
                        {isSubmitting ? 'Creando...' : 'Crear carta'}
                    </button>
                </div>
            </div>
        </>
    )
}
