'use client'

import { Loader2 } from 'lucide-react'
import { selectTheme } from '@/app/actions/design'

export function StepDesign({ designConfig, themes, onDesignUpdate, onPublish, publishing }: {
    designConfig: any
    themes: any[]
    onDesignUpdate: (config: any) => void
    onPublish: () => void
    publishing: boolean
}) {
    async function handleSelectTheme(themeId: string) {
        // Optimistic update
        const selectedTheme = themes.find((t: any) => t.id === themeId)
        onDesignUpdate({
            ...designConfig,
            theme_id: themeId,
            selected_theme: selectedTheme,
        })

        // Server action
        try {
            await selectTheme(themeId)
        } catch (err) {
            console.error('Error selecting theme:', err)
        }
    }

    function handleToggle(field: string) {
        onDesignUpdate({
            ...designConfig,
            [field]: !designConfig?.[field],
        })
    }

    function handleColorChange(color: string) {
        onDesignUpdate({
            ...designConfig,
            primary_color: color,
        })
    }

    const toggleFields = [
        { key: 'show_images', label: 'Mostrar imágenes', description: 'Fotos de productos en el menú' },
        { key: 'show_descriptions', label: 'Mostrar descripciones', description: 'Texto descriptivo de cada producto' },
        { key: 'show_search', label: 'Buscador', description: 'Permitir buscar productos' },
        { key: 'show_filters', label: 'Filtros', description: 'Filtrar por alérgenos y etiquetas' },
        { key: 'show_allergens', label: 'Alérgenos', description: 'Iconos de alérgenos por producto' },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Diseño</h2>
                <p className="text-sm text-slate-500">Personalizá la apariencia de tu menú digital</p>
            </div>

            {/* Themes */}
            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Tema</h3>
                <div className="grid grid-cols-2 gap-3">
                    {themes.map((theme: any) => {
                        const isSelected = designConfig?.theme_id === theme.id
                        return (
                            <button
                                key={theme.id}
                                onClick={() => handleSelectTheme(theme.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <div
                                    className="w-full h-16 rounded-lg mb-3"
                                    style={{
                                        background: theme.preview_gradient || theme.background_color || '#f1f5f9',
                                    }}
                                />
                                <p className="text-sm font-bold text-slate-900">{theme.name}</p>
                                {theme.description && (
                                    <p className="text-xs text-slate-500 mt-0.5">{theme.description}</p>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Primary Color */}
            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Color primario</h3>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        {['#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'].map(color => (
                            <button
                                key={color}
                                onClick={() => handleColorChange(color)}
                                className={`w-8 h-8 rounded-full transition-all ${designConfig?.primary_color === color
                                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                                        : 'hover:scale-110'
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <input
                        type="color"
                        value={designConfig?.primary_color || '#22c55e'}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                    />
                </div>
            </div>

            {/* Toggle Options */}
            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Opciones de visualización</h3>
                <div className="space-y-2">
                    {toggleFields.map(({ key, label, description }) => (
                        <div
                            key={key}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                            <div>
                                <p className="text-sm font-medium text-slate-900">{label}</p>
                                <p className="text-xs text-slate-500">{description}</p>
                            </div>
                            <button
                                onClick={() => handleToggle(key)}
                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${designConfig?.[key] ? 'bg-primary' : 'bg-slate-200'
                                    }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${designConfig?.[key] ? 'translate-x-5' : 'translate-x-0.5'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Publish */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold text-green-900 mb-1">¿Todo listo?</h3>
                <p className="text-sm text-green-700 mb-4">
                    Los clientes verán los cambios inmediatamente al publicar.
                </p>
                <button
                    onClick={onPublish}
                    disabled={publishing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                >
                    {publishing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Publicando...
                        </>
                    ) : (
                        '🚀 Publicar Cambios'
                    )}
                </button>
            </div>
        </div>
    )
}
