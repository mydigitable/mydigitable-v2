'use client'

import { useState } from 'react'
import { updateRestaurantSettings } from '@/app/actions/restaurants'

interface Props {
    restaurant: {
        id: string
        show_prep_times_globally?: boolean
        default_prep_time?: number
    }
}

export function PrepTimeSettings({ restaurant }: Props) {
    const [settings, setSettings] = useState({
        show_prep_times_globally: restaurant.show_prep_times_globally ?? false,
        default_prep_time: restaurant.default_prep_time ?? 15
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSave() {
        setSaving(true)
        setSaved(false)
        const result = await updateRestaurantSettings(restaurant.id, settings)
        if (result.success) {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } else {
            alert('Error: ' + result.error)
        }
        setSaving(false)
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    ⏱️ Tiempos de Preparación
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                    Configura cómo se muestran los tiempos estimados de preparación a tus clientes
                </p>
            </div>

            <div className="p-6 space-y-5">
                {/* Toggle global */}
                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/50 transition-all">
                    <input
                        type="checkbox"
                        checked={settings.show_prep_times_globally}
                        onChange={e => setSettings(prev => ({
                            ...prev,
                            show_prep_times_globally: e.target.checked
                        }))}
                        className="mt-0.5 w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div>
                        <div className="font-semibold text-slate-800">Activar tiempos de preparación</div>
                        <div className="text-sm text-slate-600 mt-0.5">
                            Los clientes verán cuánto tiempo tarda aproximadamente cada plato
                        </div>
                    </div>
                </label>

                {/* Tiempo por defecto */}
                {settings.show_prep_times_globally && (
                    <div className="pl-4 border-l-2 border-green-300 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Tiempo por defecto
                            </label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="number"
                                    min="5"
                                    max="120"
                                    step="5"
                                    value={settings.default_prep_time}
                                    onChange={e => setSettings(prev => ({
                                        ...prev,
                                        default_prep_time: parseInt(e.target.value) || 15
                                    }))}
                                    className="w-24 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-center font-medium"
                                />
                                <span className="text-slate-600 text-sm">minutos</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Se usará para productos que no tengan un tiempo específico configurado
                            </p>
                        </div>

                        {/* Preview */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Vista previa del menú</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🍕</span>
                                        <span className="font-medium text-slate-800 text-sm">Pizza Margarita</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            ⏱️ {settings.default_prep_time} min
                                        </span>
                                        <span className="font-bold text-green-600 text-sm">€9.50</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🥗</span>
                                        <span className="font-medium text-slate-800 text-sm">Ensalada César</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            ⏱️ 10 min
                                        </span>
                                        <span className="font-bold text-green-600 text-sm">€7.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Save button */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${saved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25'
                        } disabled:opacity-50`}
                >
                    {saving ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Guardando...
                        </span>
                    ) : saved ? '✅ Guardado correctamente' : 'Guardar Configuración'}
                </button>
            </div>
        </div>
    )
}
