'use client'

import { useState } from 'react'

export function DesignPanel({ designConfig, themes, onChange }: any) {
    const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'options'>('themes')

    if (!designConfig) {
        return (
            <div className="w-[340px] bg-white border-l border-slate-200 flex items-center justify-center p-8 flex-shrink-0">
                <div className="text-center">
                    <p className="text-sm text-slate-500">No hay configuración de diseño</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-[340px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span>🎨</span>
                    Diseño del Menú
                </h2>
                <p className="text-sm text-slate-600">
                    Personaliza el aspecto visual
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                {[
                    { id: 'themes', label: 'Temas' },
                    { id: 'colors', label: 'Colores' },
                    { id: 'options', label: 'Opciones' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
              flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2
              ${activeTab === tab.id
                                ? 'text-green-600 border-green-500 bg-green-50'
                                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                            }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'themes' && (
                    <div className="space-y-3">
                        {themes.map((theme: any) => {
                            const themeColors = theme.colors || {}
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => onChange({ ...designConfig, selected_theme_id: theme.id })}
                                    className={`
                    w-full p-4 rounded-xl border-2 transition-all text-left
                    ${designConfig.selected_theme_id === theme.id
                                            ? 'border-green-500 bg-green-50 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div
                                            className="w-12 h-12 rounded-lg shadow-sm"
                                            style={{ backgroundColor: themeColors.primary || '#16A34A' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                                {theme.name}
                                                {designConfig.selected_theme_id === theme.id && (
                                                    <span className="text-green-600">✓</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-600">{theme.description}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5">
                                        {Object.values(themeColors).slice(0, 5).map((color: any, i: number) => (
                                            <div
                                                key={i}
                                                className="flex-1 h-2 rounded-full"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </button>
                            )
                        })}

                        {themes.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-500">No hay temas disponibles</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'colors' && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 mb-4">
                            Personaliza los colores del tema seleccionado
                        </p>
                        {[
                            { key: 'primary', label: 'Color primario' },
                            { key: 'background', label: 'Fondo' },
                            { key: 'surface', label: 'Superficie' },
                            { key: 'text', label: 'Texto' },
                            { key: 'text_secondary', label: 'Texto secundario' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                <input
                                    type="color"
                                    value={designConfig.custom_colors?.[item.key] || '#000000'}
                                    onChange={(e) =>
                                        onChange({
                                            ...designConfig,
                                            custom_colors: {
                                                ...designConfig.custom_colors,
                                                [item.key]: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'options' && (
                    <div className="space-y-3">
                        {[
                            { key: 'show_search', label: 'Barra de búsqueda', icon: '🔍' },
                            { key: 'show_categories', label: 'Filtros de categorías', icon: '📂' },
                            { key: 'show_images', label: 'Imágenes de productos', icon: '🖼️' },
                            { key: 'show_prices', label: 'Precios', icon: '💰' },
                        ].map((option) => (
                            <label
                                key={option.key}
                                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-all bg-white"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{option.icon}</span>
                                    <span className="text-sm font-medium text-slate-900">{option.label}</span>
                                </div>

                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={designConfig[option.key] ?? true}
                                        onChange={(e) => onChange({ ...designConfig, [option.key]: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
