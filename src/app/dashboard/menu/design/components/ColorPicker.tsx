'use client'

import { useState } from 'react'
import type { RestaurantDesignConfig } from '@/types/design'

const COLOR_FIELDS = [
    { key: 'primary', label: 'Color Principal', desc: 'Botones y enlaces' },
    { key: 'background', label: 'Fondo', desc: 'Color de fondo general' },
    { key: 'surface', label: 'Superficie', desc: 'Tarjetas y paneles' },
    { key: 'border', label: 'Bordes', desc: 'Líneas divisorias' },
    { key: 'text', label: 'Texto Principal', desc: 'Títulos y contenido' },
    { key: 'accent', label: 'Acento', desc: 'Destacados y badges' }
] as const

export function ColorPicker({
    config,
    onChange
}: {
    config: RestaurantDesignConfig
    onChange: (updates: Partial<RestaurantDesignConfig>) => void
}) {
    const [, setEditingColor] = useState<string | null>(null)

    // Get current color (custom override or theme default)
    const getCurrentColor = (key: string) => {
        const customColors = config.custom_colors || {}
        return (customColors as Record<string, string>)[key] ||
            (config.selected_theme?.colors as Record<string, string>)?.[key] ||
            '#000000'
    }

    const handleColorChange = (key: string, value: string) => {
        onChange({
            custom_colors: {
                ...config.custom_colors,
                [key]: value
            }
        })
    }

    const resetToTheme = () => {
        onChange({ custom_colors: {} })
    }

    const hasCustomColors = Object.keys(config.custom_colors || {}).length > 0

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-slate-900">Colores del Tema</h3>
                    {hasCustomColors && (
                        <button
                            onClick={resetToTheme}
                            className="text-xs text-slate-600 hover:text-slate-900 underline"
                        >
                            Restaurar tema original
                        </button>
                    )}
                </div>
                <p className="text-sm text-slate-600 mb-4">
                    Personaliza los colores de {config.selected_theme?.name || 'tu tema'}
                </p>
            </div>

            <div className="space-y-3">
                {COLOR_FIELDS.map(field => {
                    const currentColor = getCurrentColor(field.key)

                    return (
                        <div key={field.key} className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg border-2 border-slate-300 cursor-pointer relative overflow-hidden shadow-sm flex-shrink-0"
                                    onClick={() => setEditingColor(field.key)}
                                >
                                    <div
                                        className="w-full h-full"
                                        style={{ backgroundColor: currentColor }}
                                    />
                                    <input
                                        type="color"
                                        value={currentColor}
                                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-slate-900">
                                        {field.label}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {field.desc}
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={currentColor}
                                    onChange={(e) => {
                                        const v = e.target.value
                                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) handleColorChange(field.key, v)
                                    }}
                                    className="w-24 px-2 py-1.5 text-xs font-mono border border-slate-300 rounded text-center focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Color Preview Palette */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Vista previa de paleta</p>
                <div className="flex gap-2">
                    {COLOR_FIELDS.map(field => (
                        <div key={field.key} className="flex-1 text-center">
                            <div
                                className="w-full aspect-square rounded-lg border border-slate-200 mb-1"
                                style={{ backgroundColor: getCurrentColor(field.key) }}
                            />
                            <span className="text-[9px] text-slate-500">{field.label.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                    <span className="text-amber-500 text-lg">⚠️</span>
                    <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">Importante</p>
                        <p className="text-xs text-amber-700">
                            Los cambios de color se aplicarán inmediatamente en el preview.
                            Asegúrate de que haya buen contraste entre texto y fondo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
