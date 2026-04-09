'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuScheduleEditor } from './MenuScheduleEditor'
import { X } from 'lucide-react'
import { t } from '@/lib/utils/translation'

interface DaySchedule {
    enabled: boolean
    start: string
    end: string
}

interface WeekSchedule {
    monday: DaySchedule
    tuesday: DaySchedule
    wednesday: DaySchedule
    thursday: DaySchedule
    friday: DaySchedule
    saturday: DaySchedule
    sunday: DaySchedule
}

type Props = {
    menuId: string
    menuName: string
    onClose: () => void
    onSuccess: () => void
}

const DEFAULT_SCHEDULE: WeekSchedule = {
    monday: { enabled: true, start: '12:00', end: '23:00' },
    tuesday: { enabled: true, start: '12:00', end: '23:00' },
    wednesday: { enabled: true, start: '12:00', end: '23:00' },
    thursday: { enabled: true, start: '12:00', end: '23:00' },
    friday: { enabled: true, start: '12:00', end: '23:00' },
    saturday: { enabled: true, start: '12:00', end: '23:00' },
    sunday: { enabled: true, start: '12:00', end: '23:00' },
}

export function EditMenuNameScheduleModal({ menuId, menuName, onClose, onSuccess }: Props) {
    const [name, setName] = useState(menuName)
    const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE)
    const [isSaving, setIsSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadMenu()
    }, [menuId])

    async function loadMenu() {
        const { data } = await supabase
            .from('menus')
            .select('name, schedule')
            .eq('id', menuId)
            .single()

        if (data) {
            setName(t(data.name))

            if (data.schedule && typeof data.schedule === 'object') {
                const loadedSchedule = { ...DEFAULT_SCHEDULE }
                const scheduleData = data.schedule as any

                Object.keys(DEFAULT_SCHEDULE).forEach((day) => {
                    if (scheduleData[day]) {
                        loadedSchedule[day as keyof WeekSchedule] = {
                            enabled: scheduleData[day].enabled ?? true,
                            start: scheduleData[day].start || '12:00',
                            end: scheduleData[day].end || '23:00',
                        }
                    }
                })
                setSchedule(loadedSchedule)
            }
        }
        setLoading(false)
    }

    async function handleSave() {
        if (!name.trim()) {
            alert('El nombre del menú es obligatorio')
            return
        }

        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('menus')
                .update({
                    name: name.trim(),
                    schedule: schedule as any
                })
                .eq('id', menuId)

            if (error) throw error
            onSuccess()
        } catch (error) {
            console.error('Error saving menu:', error)
            alert('Error al guardar el menú')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Editar Menú</h2>
                            <p className="text-sm text-gray-600 mt-1">Nombre y horarios</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Cargando...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Nombre del menú <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Ej: Carta de Verano"
                                    />
                                </div>

                                {/* Schedule Editor */}
                                <div>
                                    <MenuScheduleEditor schedule={schedule} onChange={setSchedule} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || loading || !name.trim()}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
