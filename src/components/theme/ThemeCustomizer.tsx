'use client'

import { THEMES, getThemeById } from '@/lib/theme/themes'
import type { ThemeOverrides } from '@/lib/theme/types'

interface Props {
    themeId: string
    overrides: ThemeOverrides
    onChange: (overrides: ThemeOverrides) => void
}

const PRESET_COLORS = [
    '#16A34A', // green
    '#2563EB', // blue
    '#DC2626', // red
    '#D97706', // amber
    '#7C3AED', // violet
    '#0891B2', // cyan
    '#BE185D', // pink
    '#1E293B', // slate
]

const FONT_OPTIONS: Record<string, string> = {
    system: 'Sistema',
    'dm-sans': 'DM Sans (Moderno)',
    poppins: 'Poppins (Amigable)',
    playfair: 'Playfair (Elegante)',
    crimson: 'Crimson (Clásico)',
    quicksand: 'Quicksand (Redondeado)',
}

const SIZE_OPTIONS: { value: 'sm' | 'md' | 'lg'; label: string }[] = [
    { value: 'sm', label: 'Pequeño (14px)' },
    { value: 'md', label: 'Normal (16px)' },
    { value: 'lg', label: 'Grande (18px)' },
]

export function ThemeCustomizer({ themeId, overrides, onChange }: Props) {
    const theme = getThemeById(themeId)
    const { customization } = theme

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm">Personalización</h3>

            {/* Color primario */}
            {customization.allowPrimaryColor && (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                        Color principal
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => onChange({ ...overrides, primaryColor: color })}
                                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                                style={{
                                    background: color,
                                    borderColor: overrides.primaryColor === color ? '#000' : 'transparent',
                                    boxShadow: overrides.primaryColor === color ? `0 0 0 1px ${color}` : 'none',
                                }}
                            />
                        ))}
                        {/* Custom color picker */}
                        <label className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 overflow-hidden relative">
                            <span className="text-xs text-gray-400">+</span>
                            <input
                                type="color"
                                className="absolute opacity-0 w-8 h-8 cursor-pointer"
                                value={overrides.primaryColor ?? '#16A34A'}
                                onChange={(e) => onChange({ ...overrides, primaryColor: e.target.value })}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Fuente */}
            {customization.allowFont && (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                        Tipografía
                    </label>
                    <select
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
                        value={overrides.fontFamily ?? ''}
                        onChange={(e) => onChange({ ...overrides, fontFamily: e.target.value || undefined })}
                    >
                        <option value="">Por defecto del tema</option>
                        {customization.availableFonts.map(fontId => (
                            <option key={fontId} value={fontId}>
                                {FONT_OPTIONS[fontId] ?? fontId}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Tamaño */}
            {customization.allowFontSize && (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                        Tamaño de texto
                    </label>
                    <div className="flex gap-2">
                        {SIZE_OPTIONS.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => onChange({ ...overrides, fontSize: value })}
                                className="flex-1 py-2 text-xs rounded-lg border transition-all"
                                style={{
                                    borderColor: overrides.fontSize === value ? '#000' : '#E5E7EB',
                                    background: overrides.fontSize === value ? '#000' : '#fff',
                                    color: overrides.fontSize === value ? '#fff' : '#374151',
                                    fontWeight: overrides.fontSize === value ? 600 : 400,
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
