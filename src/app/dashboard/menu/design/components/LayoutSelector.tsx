'use client'

import type { RestaurantDesignConfig } from '@/types/design'

export function LayoutSelector({
    config,
    onChange
}: {
    config: RestaurantDesignConfig
    onChange: (updates: Partial<RestaurantDesignConfig>) => void
}) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Tipo de Layout</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Elige cómo se verán los productos
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'grid', name: 'Grid', icon: '⊞', desc: 'Cuadrícula' },
                        { id: 'list', name: 'Lista', icon: '☰', desc: 'Vertical' },
                        { id: 'tabs', name: 'Tabs', icon: '⊟', desc: 'Pestañas' },
                        { id: 'masonry', name: 'Masonry', icon: '⊡', desc: 'Pinterest' },
                        { id: 'photo-grid', name: 'Fotos', icon: '📸', desc: 'Estilo editorial' },
                        { id: 'horizontal-cards', name: 'Horizontal', icon: '↔️', desc: 'Tarjetas anchas' }
                    ].map(layout => (
                        <button
                            key={layout.id}
                            onClick={() => onChange({ layout_type: layout.id as RestaurantDesignConfig['layout_type'] })}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${config.layout_type === layout.id
                                ? 'border-green-500 bg-green-50 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                        >
                            <div className="text-2xl mb-2">{layout.icon}</div>
                            <div className="font-semibold text-sm text-slate-900">{layout.name}</div>
                            <div className="text-xs text-slate-600">{layout.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {config.layout_type === 'grid' && (
                <div>
                    <h4 className="font-semibold text-sm text-slate-900 mb-3">Columnas</h4>
                    <div className="flex gap-2">
                        {([1, 2, 3] as const).map(cols => (
                            <button
                                key={cols}
                                onClick={() => onChange({ grid_columns: cols })}
                                className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${config.grid_columns === cols
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                                    }`}
                            >
                                {cols} col
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3">Estilo de Tarjetas</h4>
                <div className="space-y-2">
                    {([
                        { id: 'flat' as const, name: 'Plano', desc: 'Sin sombra' },
                        { id: 'elevated' as const, name: 'Elevado', desc: 'Con sombra' },
                        { id: 'outlined' as const, name: 'Contorneado', desc: 'Solo borde' }
                    ]).map(style => (
                        <label
                            key={style.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${config.card_style === style.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                        >
                            <input
                                type="radio"
                                name="card_style"
                                value={style.id}
                                checked={config.card_style === style.id}
                                onChange={() => onChange({ card_style: style.id })}
                                className="w-5 h-5 text-green-500"
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-sm text-slate-900">{style.name}</div>
                                <div className="text-xs text-slate-600">{style.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3">Espaciado</h4>
                <div className="flex gap-2">
                    {([
                        { id: 'compact' as const, name: 'Compacto' },
                        { id: 'normal' as const, name: 'Normal' },
                        { id: 'relaxed' as const, name: 'Relajado' }
                    ]).map(spacing => (
                        <button
                            key={spacing.id}
                            onClick={() => onChange({ spacing: spacing.id })}
                            className={`flex-1 py-3 rounded-lg border-2 transition-all text-sm font-medium ${config.spacing === spacing.id
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                                }`}
                        >
                            {spacing.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3">Bordes Redondeados</h4>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="0"
                        max="24"
                        step="4"
                        value={config.border_radius}
                        onChange={(e) => onChange({ border_radius: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <span className="text-sm font-mono bg-slate-100 px-3 py-2 rounded-lg min-w-[60px] text-center">
                        {config.border_radius}px
                    </span>
                </div>
            </div>
        </div>
    )
}
