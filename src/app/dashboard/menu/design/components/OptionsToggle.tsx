'use client'

import type { RestaurantDesignConfig } from '@/types/design'

const OPTIONS: { key: keyof RestaurantDesignConfig; label: string; icon: string }[] = [
    { key: 'show_search', label: 'Barra de búsqueda', icon: '🔍' },
    { key: 'show_categories', label: 'Filtros de categorías', icon: '📂' },
    { key: 'show_images', label: 'Imágenes de productos', icon: '🖼️' },
    { key: 'show_prices', label: 'Precios', icon: '💰' },
    { key: 'show_descriptions', label: 'Descripciones', icon: '📝' },
    { key: 'show_badges', label: 'Badges (Nuevo, Popular)', icon: '⭐' },
    { key: 'show_prep_time', label: 'Tiempo de preparación', icon: '⏱️' },
    { key: 'show_allergens', label: 'Alérgenos', icon: '⚠️' },
    { key: 'show_logo', label: 'Logo del restaurante', icon: '🏪' },
    { key: 'show_powered_by', label: 'Crédito MyDigitable', icon: '🔗' },
]

export function OptionsToggle({
    config,
    onChange
}: {
    config: RestaurantDesignConfig
    onChange: (updates: Partial<RestaurantDesignConfig>) => void
}) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">Elementos Visibles</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Elige qué mostrar en tu menú digital
                </p>
            </div>

            <div className="space-y-2">
                {OPTIONS.map(option => (
                    <label
                        key={option.key}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <span className="text-sm font-medium text-slate-900">
                                {option.label}
                            </span>
                        </div>

                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={!!(config[option.key])}
                                onChange={(e) => onChange({ [option.key]: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
                        </div>
                    </label>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                    <span className="text-blue-500 text-lg">💡</span>
                    <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">Tip</p>
                        <p className="text-xs text-blue-700">
                            Desactiva elementos para un menú más limpio y minimalista.
                            Los cambios se reflejan en tiempo real en el preview.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
