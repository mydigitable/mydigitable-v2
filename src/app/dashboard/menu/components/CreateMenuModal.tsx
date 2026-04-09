'use client'

import { useState } from 'react'
import { createMenu } from '@/app/actions/menu'
import { MenuScheduleEditor } from './MenuScheduleEditor'

export function CreateMenuModal({ restaurantId, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        type: 'general',
        is_active: true,
        schedule: {
            monday: { enabled: true, start: '09:00', end: '23:00' },
            tuesday: { enabled: true, start: '09:00', end: '23:00' },
            wednesday: { enabled: true, start: '09:00', end: '23:00' },
            thursday: { enabled: true, start: '09:00', end: '23:00' },
            friday: { enabled: true, start: '09:00', end: '23:00' },
            saturday: { enabled: true, start: '09:00', end: '23:00' },
            sunday: { enabled: true, start: '09:00', end: '23:00' },
        }
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name: formData.name,
            type: formData.type,
            is_active: formData.is_active,
            schedule: formData.schedule,
        }

        try {
            const result = await createMenu(payload)

            if (result.success) {
                onSuccess()
            } else {
                alert('Error: ' + result.error)
            }
        } catch (err) {
            alert('Error: ' + (err instanceof Error ? err.message : String(err)))
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Crear Nuevo Menú</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                            Nombre del menú *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Ej: Menú del día, Carta de vinos..."
                        />
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                            Tipo de menú
                        </label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        >
                            <option value="general">General</option>
                            <option value="breakfast">Desayuno</option>
                            <option value="lunch">Almuerzo</option>
                            <option value="dinner">Cena</option>
                            <option value="drinks">Bebidas</option>
                            <option value="desserts">Postres</option>
                        </select>
                    </div>

                    {/* Horario */}
                    <MenuScheduleEditor
                        schedule={formData.schedule}
                        onChange={(schedule) => setFormData({ ...formData, schedule })}
                    />

                    {/* Estado */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Activar menú inmediatamente
                        </label>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                        >
                            {loading ? 'Creando...' : 'Crear menú'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
