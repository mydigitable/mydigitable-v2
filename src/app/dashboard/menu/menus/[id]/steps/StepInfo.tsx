'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BookOpen, Coffee, Utensils, Wine, Moon, Sparkles,
} from 'lucide-react'

const menuTypes = [
    { value: 'general', label: 'General', Icon: BookOpen, color: 'text-slate-600', bg: 'bg-slate-100' },
    { value: 'breakfast', label: 'Desayunos', Icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
    { value: 'lunch', label: 'Comidas', Icon: Utensils, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: 'dinner', label: 'Cenas', Icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { value: 'drinks', label: 'Bebidas', Icon: Wine, color: 'text-rose-600', bg: 'bg-rose-50' },
    { value: 'special', label: 'Especial', Icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50' },
]

const weekDays = [
    { key: 'monday', label: 'Lunes', short: 'L' },
    { key: 'tuesday', label: 'Martes', short: 'M' },
    { key: 'wednesday', label: 'Miércoles', short: 'X' },
    { key: 'thursday', label: 'Jueves', short: 'J' },
    { key: 'friday', label: 'Viernes', short: 'V' },
    { key: 'saturday', label: 'Sábado', short: 'S' },
    { key: 'sunday', label: 'Domingo', short: 'D' },
]

interface ScheduleDayObj {
    start: string
    end: string
    enabled: boolean
}

export function StepInfo({ menu, onMenuChange }: { menu: any; onMenuChange: (m: any) => void }) {
    const scheduleType = menu.schedule_type || 'all_day'

    // Build schedule from menu data
    const buildSchedule = (): Record<string, ScheduleDayObj> => {
        const defaults: Record<string, ScheduleDayObj> = {}
        weekDays.forEach(d => {
            defaults[d.key] = { start: '09:00', end: '23:00', enabled: true }
        })
        if (!menu.schedule) return defaults
        if (!Array.isArray(menu.schedule)) return { ...defaults, ...menu.schedule }
        // Convert array format
        const mapped = { ...defaults }
        const dayMap: Record<string, string> = {
            Lunes: 'monday', Martes: 'tuesday', Miércoles: 'wednesday',
            Jueves: 'thursday', Viernes: 'friday', Sábado: 'saturday', Domingo: 'sunday',
        }
        menu.schedule.forEach((d: any) => {
            const key = dayMap[d.day] || d.day.toLowerCase()
            if (mapped[key]) mapped[key] = { start: d.open, end: d.close, enabled: d.enabled }
        })
        return mapped
    }

    const [schedule, setSchedule] = useState<Record<string, ScheduleDayObj>>(buildSchedule)

    const update = (field: string, value: any) => {
        const updated = { ...menu, [field]: value }
        onMenuChange(updated)
    }

    const toggleScheduleType = () => {
        const newType = scheduleType === 'all_day' ? 'scheduled' : 'all_day'
        onMenuChange({
            ...menu,
            schedule_type: newType,
            schedule: newType === 'scheduled' ? schedule : null,
        })
    }

    const updateDay = (dayKey: string, field: keyof ScheduleDayObj, value: string | boolean) => {
        const newSchedule = {
            ...schedule,
            [dayKey]: { ...schedule[dayKey], [field]: value },
        }
        setSchedule(newSchedule)
        onMenuChange({ ...menu, schedule: newSchedule })
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Información del menú</h2>
                <p className="text-sm text-slate-500">Configurá el nombre, tipo y horario de esta carta</p>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nombre de la carta *
                </label>
                <input
                    type="text"
                    value={menu.name || ''}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder='Ej: Desayunos, Carta Principal...'
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-900"
                />
            </div>

            {/* Type */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                    Tipo de carta
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {menuTypes.map((t) => {
                        const IconComp = t.Icon
                        return (
                            <button
                                key={t.value}
                                onClick={() => update('type', t.value)}
                                className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all text-center ${menu.type === t.value
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-lg ${t.bg} flex items-center justify-center`}>
                                    <IconComp size={18} className={t.color} />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{t.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                    <p className="font-bold text-slate-900 text-sm">Estado</p>
                    <p className="text-xs text-slate-500">
                        {menu.is_active ? 'Visible para los clientes' : 'Oculta para los clientes'}
                    </p>
                </div>
                <button
                    onClick={() => update('is_active', !menu.is_active)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${menu.is_active ? 'bg-green-500' : 'bg-slate-200'
                        }`}
                >
                    <motion.div
                        animate={{ x: menu.is_active ? 20 : 2 }}
                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                    />
                </button>
            </div>

            {/* Schedule Toggle */}
            <div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                        <p className="font-bold text-slate-900 text-sm">Horario personalizado</p>
                        <p className="text-xs text-slate-500">Configura cuándo se activa esta carta</p>
                    </div>
                    <button
                        onClick={toggleScheduleType}
                        className={`relative w-12 h-7 rounded-full transition-colors ${scheduleType === 'scheduled' ? 'bg-primary' : 'bg-slate-200'
                            }`}
                    >
                        <motion.div
                            animate={{ x: scheduleType === 'scheduled' ? 20 : 2 }}
                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                        />
                    </button>
                </div>

                {/* Schedule Days */}
                {scheduleType === 'scheduled' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-2"
                    >
                        {weekDays.map((day) => {
                            const dayData = schedule[day.key]
                            return (
                                <div
                                    key={day.key}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${dayData?.enabled
                                            ? 'border-slate-200 bg-white'
                                            : 'border-slate-100 bg-slate-50 opacity-60'
                                        }`}
                                >
                                    <button
                                        onClick={() => updateDay(day.key, 'enabled', !dayData?.enabled)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${dayData?.enabled
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 text-slate-400'
                                            }`}
                                    >
                                        {day.short}
                                    </button>
                                    <span className="text-sm font-medium text-slate-700 w-24">{day.label}</span>
                                    {dayData?.enabled && (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <input
                                                type="time"
                                                value={dayData.start}
                                                onChange={(e) => updateDay(day.key, 'start', e.target.value)}
                                                className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
                                            />
                                            <span className="text-slate-400 text-xs">—</span>
                                            <input
                                                type="time"
                                                value={dayData.end}
                                                onChange={(e) => updateDay(day.key, 'end', e.target.value)}
                                                className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
