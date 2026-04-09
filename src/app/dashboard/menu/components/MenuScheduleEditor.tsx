'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'

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

interface MenuScheduleEditorProps {
    schedule: WeekSchedule
    onChange: (schedule: WeekSchedule) => void
}

const DAYS = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
] as const

export function MenuScheduleEditor({ schedule, onChange }: MenuScheduleEditorProps) {
    function updateDay(dayKey: string, updates: Partial<DaySchedule>) {
        onChange({
            ...schedule,
            [dayKey]: {
                ...schedule[dayKey as keyof WeekSchedule],
                ...updates,
            },
        })
    }

    function setAllDays(enabled: boolean) {
        const newSchedule = { ...schedule }
        DAYS.forEach(({ key }) => {
            newSchedule[key as keyof WeekSchedule] = {
                ...newSchedule[key as keyof WeekSchedule],
                enabled,
            }
        })
        onChange(newSchedule)
    }

    function copyToAll(dayKey: string) {
        const sourceDay = schedule[dayKey as keyof WeekSchedule]
        const newSchedule = { ...schedule }
        DAYS.forEach(({ key }) => {
            newSchedule[key as keyof WeekSchedule] = { ...sourceDay }
        })
        onChange(newSchedule)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                    <Clock className="inline w-4 h-4 mr-2" />
                    Horario del Menú
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setAllDays(true)}
                        className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                    >
                        Abrir todos
                    </button>
                    <button
                        type="button"
                        onClick={() => setAllDays(false)}
                        className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                    >
                        Cerrar todos
                    </button>
                </div>
            </div>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                {DAYS.map(({ key, label }) => {
                    const daySchedule = schedule[key as keyof WeekSchedule]
                    return (
                        <div key={key} className="p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                {/* Enable/Disable Toggle */}
                                <input
                                    type="checkbox"
                                    checked={daySchedule.enabled}
                                    onChange={(e) => updateDay(key, { enabled: e.target.checked })}
                                    className="w-4 h-4 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                                />

                                {/* Day Label */}
                                <span className={`text-sm font-medium w-24 ${daySchedule.enabled ? 'text-slate-900' : 'text-slate-400'
                                    }`}>
                                    {label}
                                </span>

                                {/* Time Inputs */}
                                {daySchedule.enabled ? (
                                    <>
                                        <input
                                            type="time"
                                            value={daySchedule.start}
                                            onChange={(e) => updateDay(key, { start: e.target.value })}
                                            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input
                                            type="time"
                                            value={daySchedule.end}
                                            onChange={(e) => updateDay(key, { end: e.target.value })}
                                            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => copyToAll(key)}
                                            className="ml-auto text-xs px-2 py-1 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                            title="Copiar a todos los días"
                                        >
                                            Copiar a todos
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-sm text-slate-400 italic">Cerrado</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <p className="text-xs text-slate-500">
                💡 Tip: Configura el horario de un día y usa "Copiar a todos" para aplicarlo a toda la semana
            </p>
        </div>
    )
}
