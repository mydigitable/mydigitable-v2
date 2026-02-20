'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuScheduleEditor } from './MenuScheduleEditor'
import { X } from 'lucide-react'

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

export function EditScheduleModal({ menuId, menuName, onClose, onSuccess }: Props) {
    const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE)
    const [isSaving, setIsSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadSchedule()
    }, [menuId])

    async function loadSchedule() {
        const { data } = await supabase
            .from('menus')
            .select('schedule')
            .eq('id', menuId)
            .single()

        if (data?.schedule && typeof data.schedule === 'object') {
            // Ensure all days exist with proper structure
            const loadedSchedule = { ...DEFAULT_SCHEDULE }
            const scheduleData = data.schedule as any // Type cast to bypass Supabase inference

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
        setLoading(false)
    }

    async function handleSave() {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('menus')
                .update({ schedule: schedule as any }) // Type cast to bypass Supabase inference
                .eq('id', menuId)

            if (error) throw error
            onSuccess()
        } catch (error) {
            console.error('Error saving schedule:', error)
            alert('Error al guardar el horario')
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
                            <h2 className="text-xl font-bold text-gray-900">Editar Horario</h2>
                            <p className="text-sm text-gray-600 mt-1">{menuName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Cargando horario...</p>
                            </div>
                        ) : (
                            <MenuScheduleEditor schedule={schedule} onChange={setSchedule} />
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
                            disabled={isSaving || loading}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar horario'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
