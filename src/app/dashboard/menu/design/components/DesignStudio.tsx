'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { updateDesignConfig, publishDesign, updateCategoryLayout, toggleProductFeatured } from '@/app/actions/design'
import { MenuMobilePreview } from '@/components/shared/MenuMobilePreview'
import type { RestaurantDesignConfig, MenuTheme } from '@/types/design'
import { Palette, Layers, Layout, Settings, LayoutGrid, List, Star, Eye, EyeOff, Image as ImageIcon, AlignJustify } from 'lucide-react'
import { selectTheme } from '@/app/actions/design'

// ============================================
// Helpers
// ============================================
function extractName(name: unknown): string {
    if (!name) return ''
    if (typeof name === 'string') return name
    if (typeof name === 'object' && name !== null) {
        const n = name as Record<string, string>
        return n.es || n.en || Object.values(n)[0] || ''
    }
    return ''
}

const THEME_EMOJIS: Record<string, string> = {
    'modern-minimal': '🌿',
    'classic-bistro': '🍷',
    'craft-bold': '🔥',
    'nordic-clean': '❄️',
    'warm-rustic': '🏡',
}

// ============================================
// Props
// ============================================
interface DesignStudioProps {
    restaurant: { id: string; name?: string; business_name?: string; slug?: string }
    designConfig: RestaurantDesignConfig | null
    themes: MenuTheme[]
    menus: Array<{
        id?: string
        name?: unknown
        categories?: Array<{
            id?: string
            name?: unknown
            name_es?: string
            layout_type?: string
            grid_columns?: number
            show_images?: boolean
            show_prices?: boolean
            show_descriptions?: boolean
            products?: Array<{
                id?: string
                name?: unknown
                name_es?: string
                description?: unknown
                description_es?: string
                price?: number
                image_url?: string
                is_featured?: boolean
                featured_badge?: string
                is_available?: boolean
            }>
        }>
    }>
}

// ============================================
// Main Component
// ============================================
export function DesignStudio({ restaurant, designConfig, themes, menus: initialMenus }: DesignStudioProps) {
    const initialConfig: RestaurantDesignConfig = designConfig || {
        id: '',
        restaurant_id: restaurant.id,
        layout_type: 'grid',
        grid_columns: 2,
        card_style: 'elevated',
        spacing: 'normal',
        border_radius: 12,
        show_search: true,
        show_categories: true,
        show_images: true,
        show_prices: true,
        show_descriptions: true,
        show_badges: true,
        show_prep_time: false,
        show_allergens: true,
        show_logo: true,
        show_powered_by: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    } as RestaurantDesignConfig

    const [config, setConfig] = useState<RestaurantDesignConfig>(initialConfig)
    const [menus, setMenus] = useState(initialMenus)
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const configRef = useRef(JSON.stringify(initialConfig))
    const hasChanges = JSON.stringify(config) !== configRef.current

    // Auto-save debounced
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const doSave = useCallback(async (silent: boolean) => {
        if (!designConfig?.id) return
        setSaving(true)
        try {
            // Strip non-DB fields before sending
            const { selected_theme, ...saveData } = config as unknown as Record<string, unknown>
            const result = await updateDesignConfig(saveData)
            if (result.success) {
                setLastSaved(new Date())
                configRef.current = JSON.stringify(config)
            } else if (!silent) {
                alert('❌ Error al guardar: ' + result.error)
            }
        } catch {
            if (!silent) alert('❌ Error de conexión')
        }
        setSaving(false)
    }, [config, designConfig?.id])

    useEffect(() => {
        if (!hasChanges || !designConfig?.id) return
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = setTimeout(() => doSave(true), 1500)
        return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
    }, [config, hasChanges, doSave, designConfig?.id])

    // Update config helper (triggers re-render → preview updates immediately)
    const updateConfig = useCallback((partial: Partial<RestaurantDesignConfig>) => {
        setConfig(prev => ({ ...prev, ...partial }))
    }, [])

    async function handlePublish() {
        if (!confirm('¿Publicar cambios? Los clientes verán el nuevo diseño.')) return
        setPublishing(true)
        if (designConfig?.id) await updateDesignConfig(config as unknown as Record<string, unknown>)
        const result = await publishDesign()
        if (result.success) alert('🚀 ¡Diseño publicado!')
        else alert('❌ Error: ' + result.error)
        setPublishing(false)
    }

    // Toggle featured on a product (update local state + save to DB)
    async function handleToggleFeatured(productId: string, currentVal: boolean) {
        // Update local state for instant preview
        setMenus(prev => prev.map(menu => ({
            ...menu,
            categories: menu.categories?.map(cat => ({
                ...cat,
                products: cat.products?.map(p =>
                    p.id === productId ? { ...p, is_featured: !currentVal } : p
                )
            }))
        })))

        // Persist to DB
        await toggleProductFeatured(productId, !currentVal)
    }

    // Update category layout (local + DB)
    async function handleCategoryLayoutUpdate(catId: string, updates: Record<string, unknown>) {
        setMenus(prev => prev.map(menu => ({
            ...menu,
            categories: menu.categories?.map(cat =>
                cat.id === catId ? { ...cat, ...updates } : cat
            )
        })))

        await updateCategoryLayout(catId, updates)
    }

    const restaurantDisplayName = restaurant.business_name || extractName(restaurant.name) || 'Mi Restaurante'

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <span className="text-white text-xl">🎨</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Design Studio</h1>
                            <p className="text-xs text-slate-500">{restaurantDisplayName}</p>
                        </div>
                    </div>

                    {saving && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            Guardando...
                        </div>
                    )}
                    {lastSaved && !saving && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                            ✓ Guardado {lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                    {hasChanges && !saving && !lastSaved && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            Cambios sin guardar
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => doSave(false)}
                        disabled={saving || !hasChanges}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 font-medium text-sm transition-colors"
                    >
                        💾 Guardar
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 font-semibold text-sm transition-all shadow-lg shadow-green-500/30"
                    >
                        {publishing ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Publicando...
                            </span>
                        ) : '🚀 Publicar'}
                    </button>
                </div>
            </div>

            {/* 3-Column Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL */}
                <LeftPanel config={config} themes={themes} updateConfig={updateConfig} />

                {/* CENTER: Phone Preview */}
                <div className="flex-1 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent" />
                    <div className="relative z-10">
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                            <div className="bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg whitespace-nowrap">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Vista previa en vivo
                            </div>
                        </div>
                        <MenuMobilePreview
                            restaurant={restaurant}
                            menus={menus}
                            designConfig={config as unknown as Record<string, unknown>}
                        />
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <RightPanel
                    config={config}
                    menus={menus}
                    updateConfig={updateConfig}
                    onToggleFeatured={handleToggleFeatured}
                    onCategoryLayoutUpdate={handleCategoryLayoutUpdate}
                />
            </div>
        </div>
    )
}


// ============================================
// LEFT PANEL: Themes + Colors
// ============================================
function LeftPanel({ config, themes, updateConfig }: {
    config: RestaurantDesignConfig
    themes: MenuTheme[]
    updateConfig: (p: Partial<RestaurantDesignConfig>) => void
}) {
    const [section, setSection] = useState<'themes' | 'colors'>('themes')

    return (
        <div className="w-[300px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
            <div className="p-3 flex gap-1 flex-shrink-0 border-b border-slate-100">
                <button
                    onClick={() => setSection('themes')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${section === 'themes' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Palette className="w-4 h-4" /> Temas
                </button>
                <button
                    onClick={() => setSection('colors')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${section === 'colors' ? 'bg-pink-50 text-pink-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Palette className="w-4 h-4" /> Colores
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {section === 'themes' && <ThemesSection themes={themes} config={config} updateConfig={updateConfig} />}
                {section === 'colors' && <ColorsSection config={config} updateConfig={updateConfig} />}
            </div>
        </div>
    )
}


// ============================================
// RIGHT PANEL: Layout + Categories + General
// ============================================
function RightPanel({ config, menus, updateConfig, onToggleFeatured, onCategoryLayoutUpdate }: {
    config: RestaurantDesignConfig
    menus: DesignStudioProps['menus']
    updateConfig: (p: Partial<RestaurantDesignConfig>) => void
    onToggleFeatured: (productId: string, currentVal: boolean) => void
    onCategoryLayoutUpdate: (catId: string, updates: Record<string, unknown>) => void
}) {
    const [section, setSection] = useState<'layout' | 'categories' | 'general'>('layout')

    return (
        <div className="w-[300px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
            <div className="p-3 flex gap-1 flex-shrink-0 border-b border-slate-100">
                <button
                    onClick={() => setSection('layout')}
                    className={`flex-1 flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${section === 'layout' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Layers className="w-4 h-4" /> Layout
                </button>
                <button
                    onClick={() => setSection('categories')}
                    className={`flex-1 flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${section === 'categories' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Layout className="w-4 h-4" /> Categorías
                </button>
                <button
                    onClick={() => setSection('general')}
                    className={`flex-1 flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${section === 'general' ? 'bg-slate-100 text-slate-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Settings className="w-4 h-4" /> General
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {section === 'layout' && <LayoutSection config={config} updateConfig={updateConfig} />}
                {section === 'categories' && (
                    <CategoriesSection
                        menus={menus}
                        config={config}
                        onToggleFeatured={onToggleFeatured}
                        onCategoryLayoutUpdate={onCategoryLayoutUpdate}
                    />
                )}
                {section === 'general' && <GeneralSection config={config} updateConfig={updateConfig} />}
            </div>
        </div>
    )
}


// ============================================
// THEMES SECTION
// ============================================
function ThemesSection({ themes, config, updateConfig }: {
    themes: MenuTheme[]
    config: RestaurantDesignConfig
    updateConfig: (p: Partial<RestaurantDesignConfig>) => void
}) {
    const [selectingId, setSelectingId] = useState<string | null>(null)

    async function handleSelect(themeId: string) {
        setSelectingId(themeId)
        const result = await selectTheme(themeId)
        if (result.success) {
            const theme = themes.find(t => t.id === themeId)
            if (theme) {
                updateConfig({
                    selected_theme_id: themeId,
                    selected_theme: theme,
                    custom_colors: {},
                    layout_type: (theme.layout_type || 'grid') as RestaurantDesignConfig['layout_type'],
                })
            }
        }
        setSelectingId(null)
    }

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Elige un tema</p>
            {themes.map(theme => {
                const isSelected = config.selected_theme_id === theme.id
                const isSelecting = selectingId === theme.id
                const emoji = THEME_EMOJIS[theme.slug] || '🎨'
                return (
                    <button
                        key={theme.id}
                        onClick={() => handleSelect(theme.id)}
                        disabled={isSelecting}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                            } ${isSelecting ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">{emoji}</span>
                            <div className="w-10 h-10 rounded-lg shadow-sm" style={{ backgroundColor: theme.colors.primary }} />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                    {theme.name}
                                    {isSelected && <span className="text-green-600">✓</span>}
                                </div>
                                <div className="text-[10px] text-slate-600 line-clamp-1">{theme.description}</div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {Object.values(theme.colors).slice(0, 5).map((color, i) => (
                                <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: color as string }} />
                            ))}
                        </div>
                    </button>
                )
            })}
            {themes.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p className="text-4xl mb-3">🎨</p>
                    <p className="text-sm">No hay temas. Ejecuta la migración.</p>
                </div>
            )}
        </div>
    )
}


// ============================================
// COLORS SECTION
// ============================================
function ColorsSection({ config, updateConfig }: {
    config: RestaurantDesignConfig
    updateConfig: (p: Partial<RestaurantDesignConfig>) => void
}) {
    const themeColors = (config.selected_theme?.colors || {}) as Record<string, string>
    const customColors = (config.custom_colors || {}) as Record<string, string>

    const colors = [
        { key: 'primary', label: 'Principal', desc: 'Botones y CTA' },
        { key: 'accent', label: 'Acento', desc: 'Destacados' },
        { key: 'background', label: 'Fondo', desc: 'Color de fondo' },
        { key: 'surface', label: 'Superficie', desc: 'Tarjetas' },
        { key: 'border', label: 'Bordes', desc: 'Separadores' },
        { key: 'text', label: 'Texto', desc: 'Color principal' },
        { key: 'text_secondary', label: 'Texto 2º', desc: 'Color secundario' },
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Personalizar Colores</p>
                {Object.keys(customColors).length > 0 && (
                    <button onClick={() => updateConfig({ custom_colors: {} })} className="text-xs text-red-500 hover:text-red-700">
                        Resetear
                    </button>
                )}
            </div>
            {colors.map(color => (
                <div key={color.key} className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-slate-900">{color.label}</div>
                        <div className="text-xs text-slate-500">{color.desc}</div>
                    </div>
                    <input
                        type="color"
                        value={customColors[color.key] || themeColors[color.key] || '#000000'}
                        onChange={(e) => updateConfig({ custom_colors: { ...customColors, [color.key]: e.target.value } })}
                        className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
                    />
                </div>
            ))}
        </div>
    )
}


// ============================================
// LAYOUT SECTION — all functional!
// ============================================
function LayoutSection({ config, updateConfig }: {
    config: RestaurantDesignConfig
    updateConfig: (p: Partial<RestaurantDesignConfig>) => void
}) {
    return (
        <div className="space-y-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Configuración de Layout</p>

            {/* Layout Type */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Tipo de Vista</label>
                <div className="grid grid-cols-2 gap-2">
                    {([
                        { id: 'grid', label: 'Grid', icon: <LayoutGrid className="w-6 h-6" /> },
                        { id: 'list', label: 'Lista', icon: <List className="w-6 h-6" /> },
                        { id: 'photo-grid', label: 'Fotos', icon: <ImageIcon className="w-6 h-6" /> },
                        { id: 'horizontal', label: 'Horizontal', icon: <AlignJustify className="w-6 h-6" /> },
                    ] as const).map(layout => (
                        <button
                            key={layout.id}
                            onClick={() => updateConfig({ layout_type: layout.id as RestaurantDesignConfig['layout_type'] })}
                            className={`p-3 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-1.5 ${config.layout_type === layout.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                        >
                            {layout.icon}
                            <span className="text-[10px] font-semibold">{layout.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Columns — only visible for grid/photo-grid */}
            {(config.layout_type === 'grid' || config.layout_type === 'photo-grid' || !config.layout_type) && (
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Columnas</label>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(cols => (
                            <button
                                key={cols}
                                onClick={() => updateConfig({ grid_columns: cols as 1 | 2 | 3 })}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${config.grid_columns === cols ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                {cols}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Card Style */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Estilo de Tarjeta</label>
                <div className="space-y-2">
                    {([
                        { id: 'flat', name: 'Plano', desc: 'Sin sombra' },
                        { id: 'elevated', name: 'Elevado', desc: 'Con sombra' },
                        { id: 'outlined', name: 'Contorno', desc: 'Solo borde' },
                    ] as const).map(style => (
                        <button
                            key={style.id}
                            onClick={() => updateConfig({ card_style: style.id as RestaurantDesignConfig['card_style'] })}
                            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${config.card_style === style.id ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="font-semibold text-sm text-slate-900">{style.name}</div>
                            <div className="text-xs text-slate-600">{style.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Spacing */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Espaciado: <span className="text-green-600">{(config as unknown as Record<string, unknown>).spacing_value != null ? `${(config as unknown as Record<string, unknown>).spacing_value}px` : config.spacing === 'compact' ? '6px' : config.spacing === 'relaxed' ? '16px' : '10px'}</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={((config as unknown as Record<string, unknown>).spacing_value as number) ?? (config.spacing === 'compact' ? 6 : config.spacing === 'relaxed' ? 16 : 10)}
                    onChange={(e) => updateConfig({ spacing_value: parseInt(e.target.value) } as Partial<RestaurantDesignConfig>)}
                    className="w-full accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0px</span><span>10px</span><span>20px</span>
                </div>
            </div>

            {/* Border Radius */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Bordes: <span className="text-green-600">{config.border_radius ?? 12}px</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="24"
                    value={config.border_radius ?? 12}
                    onChange={(e) => updateConfig({ border_radius: parseInt(e.target.value) })}
                    className="w-full accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0px</span><span>12px</span><span>24px</span>
                </div>
            </div>
        </div>
    )
}


// ============================================
// CATEGORIES SECTION — per-category layout + featured toggles
// ============================================
function CategoriesSection({ menus, config, onToggleFeatured, onCategoryLayoutUpdate }: {
    menus: DesignStudioProps['menus']
    config: RestaurantDesignConfig
    onToggleFeatured: (productId: string, currentVal: boolean) => void
    onCategoryLayoutUpdate: (catId: string, updates: Record<string, unknown>) => void
}) {
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null)

    // Category detail view
    if (selectedCatId) {
        const category = menus.flatMap(m => m.categories || []).find(c => c.id === selectedCatId)
        if (!category) { setSelectedCatId(null); return null }

        const catName = extractName(category.name) || category.name_es || 'Categoría'
        const products = category.products || []
        const catLayout = category.layout_type || config.layout_type || 'grid'
        const catCols = category.grid_columns || config.grid_columns || 2

        return (
            <div className="space-y-4">
                <button onClick={() => setSelectedCatId(null)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium">
                    ← Volver
                </button>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-sm text-slate-900">{catName}</h3>
                    <p className="text-xs text-slate-500">{products.length} productos</p>
                </div>

                {/* Per-category layout */}
                <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-2">Layout para esta categoría</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'grid', label: 'Grid', Icon: LayoutGrid },
                            { id: 'list', label: 'Lista', Icon: List },
                            { id: 'photo-grid', label: 'Fotos', Icon: ImageIcon },
                            { id: 'horizontal', label: 'Scroll', Icon: Layers },
                        ].map(({ id, label, Icon }) => (
                            <button
                                key={id}
                                onClick={() => onCategoryLayoutUpdate(selectedCatId, { layout_type: id })}
                                className={`p-2.5 rounded-lg border-2 text-center flex flex-col items-center gap-1 ${catLayout === id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                            >
                                <Icon className="w-4 h-4 text-slate-700" />
                                <span className="text-[9px] font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Per-category columns */}
                {catLayout === 'grid' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-900 mb-2">Columnas</label>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(cols => (
                                <button
                                    key={cols}
                                    onClick={() => onCategoryLayoutUpdate(selectedCatId, { grid_columns: cols })}
                                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold ${catCols === cols ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                                >
                                    {cols}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Per-category visibility toggles */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-900 mb-1">Mostrar / Ocultar</label>
                    {[
                        { key: 'show_images', label: 'Imágenes', icon: ImageIcon, val: category.show_images !== false },
                        { key: 'show_prices', label: 'Precios', icon: Eye, val: category.show_prices !== false },
                        { key: 'show_descriptions', label: 'Descripciones', icon: AlignJustify, val: category.show_descriptions !== false },
                    ].map(opt => {
                        const Icon = opt.icon
                        return (
                            <label key={opt.key} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-slate-500" />
                                    <span className="text-xs font-medium text-slate-900">{opt.label}</span>
                                </div>
                                <ToggleSwitch
                                    checked={opt.val}
                                    color="blue"
                                    onChange={(v) => onCategoryLayoutUpdate(selectedCatId, { [opt.key]: v })}
                                />
                            </label>
                        )
                    })}
                </div>

                {/* Products list with featured toggle */}
                {products.length > 0 && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-900 mb-2">
                            <Star className="w-3.5 h-3.5 inline text-amber-500 mr-1" />
                            Productos Destacados
                        </label>
                        <div className="space-y-1 max-h-52 overflow-y-auto">
                            {products.map(p => {
                                const pName = extractName(p.name) || p.name_es || 'Producto'
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${p.is_featured ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50 border border-transparent'}`}
                                    >
                                        <span className="flex items-center gap-1.5 text-slate-700 min-w-0 truncate">
                                            {p.is_featured && <Star className="w-3 h-3 text-amber-500 flex-shrink-0" fill="currentColor" />}
                                            {pName}
                                        </span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-slate-400">€{p.price}</span>
                                            <ToggleSwitch
                                                checked={!!p.is_featured}
                                                color="amber"
                                                onChange={() => onToggleFeatured(p.id!, !!p.is_featured)}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Default: category list
    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Editar por categoría</p>
            {menus.map(menu => (
                <div key={menu.id || 'menu'} className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase px-2 py-1">
                        {extractName(menu.name) || 'Menú'}
                    </div>
                    {menu.categories?.map(cat => {
                        const featuredCount = cat.products?.filter(p => p.is_featured).length || 0
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCatId(cat.id || null)}
                                className="w-full px-3 py-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between text-slate-700 hover:bg-slate-100"
                            >
                                <span className="font-medium">{extractName(cat.name) || cat.name_es || 'Categoría'}</span>
                                <span className="flex items-center gap-2 text-[10px]">
                                    {featuredCount > 0 && (
                                        <span className="text-amber-500 flex items-center gap-0.5">
                                            <Star className="w-3 h-3" fill="currentColor" />{featuredCount}
                                        </span>
                                    )}
                                    <span className="text-slate-400">{cat.products?.length || 0} →</span>
                                </span>
                            </button>
                        )
                    })}
                </div>
            ))}
            {menus.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <p className="text-3xl mb-2">📂</p>
                    <p className="text-xs">No hay menús</p>
                </div>
            )}
        </div>
    )
}


// ============================================
// GENERAL SECTION — logo, subtitle, toggles
// ============================================
function GeneralSection({ config, updateConfig }: {
    config: RestaurantDesignConfig
    updateConfig: (p: Partial<RestaurantDesignConfig>) => void
}) {
    const logoUrl = (config as unknown as Record<string, unknown>).logo_url as string || ''
    const subtitle = (config as unknown as Record<string, unknown>).header_subtitle as string || ''
    const showHeader = (config as unknown as Record<string, unknown>).show_header !== false

    const headerToggles: Array<{ key: string; label: string; icon: string }> = [
        { key: 'show_header', label: 'Header completo', icon: '📱' },
        { key: 'show_logo', label: 'Logo', icon: '🖼️' },
        { key: 'show_search', label: 'Búsqueda', icon: '🔍' },
        { key: 'show_categories', label: 'Filtros de categoría', icon: '📂' },
    ]

    const contentToggles: Array<{ key: string; label: string; icon: string }> = [
        { key: 'show_images', label: 'Imágenes de producto', icon: '📸' },
        { key: 'show_prices', label: 'Precios', icon: '💰' },
        { key: 'show_descriptions', label: 'Descripciones', icon: '📝' },
        { key: 'show_badges', label: 'Badges destacados', icon: '🏷️' },
        { key: 'show_allergens', label: 'Alérgenos', icon: '⚠️' },
    ]

    const brandToggles: Array<{ key: string; label: string; icon: string }> = [
        { key: 'show_powered_by', label: 'Powered by MyDigitable', icon: '⚡' },
    ]

    const renderToggleGroup = (title: string, toggles: Array<{ key: string; label: string; icon: string }>) => (
        <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
            <div className="space-y-1">
                {toggles.map(opt => (
                    <label
                        key={opt.key}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-all bg-white"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{opt.icon}</span>
                            <span className="text-xs font-medium text-slate-900">{opt.label}</span>
                        </div>
                        <ToggleSwitch
                            checked={!!(config as unknown as Record<string, unknown>)[opt.key] !== false && (config as unknown as Record<string, unknown>)[opt.key] !== undefined ? !!(config as unknown as Record<string, unknown>)[opt.key] : true}
                            color="green"
                            onChange={(v) => updateConfig({ [opt.key]: v } as Partial<RestaurantDesignConfig>)}
                        />
                    </label>
                ))}
            </div>
        </div>
    )

    return (
        <div className="space-y-5">
            {/* BRANDING — Logo + Subtitle */}
            <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Branding</p>

                {/* Logo URL */}
                <div className="mb-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Logo del restaurante</label>
                    <div className="flex gap-2 items-start">
                        {/* Preview */}
                        <div className="w-14 h-14 flex-shrink-0 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            ) : (
                                <span className="text-2xl">🖼️</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="https://... URL de tu logo"
                                value={logoUrl}
                                onChange={(e) => updateConfig({ logo_url: e.target.value } as Partial<RestaurantDesignConfig>)}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">URL de imagen (PNG, JPG o SVG)</p>
                        </div>
                    </div>
                </div>

                {/* Subtitle */}
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Subtítulo del menú</label>
                    <input
                        type="text"
                        placeholder="Ej: Cocina mediterránea, Est. 2020..."
                        value={subtitle}
                        onChange={(e) => updateConfig({ header_subtitle: e.target.value } as Partial<RestaurantDesignConfig>)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Aparece debajo del nombre en el header</p>
                </div>
            </div>

            {/* HEADER TOGGLES */}
            {renderToggleGroup('Header', headerToggles)}

            {/* CONTENT TOGGLES */}
            {renderToggleGroup('Contenido', contentToggles)}

            {/* BRAND TOGGLES */}
            {renderToggleGroup('Marca', brandToggles)}
        </div>
    )
}


// ============================================
// Reusable Toggle Switch
// ============================================
function ToggleSwitch({ checked, color, onChange }: {
    checked: boolean
    color: 'green' | 'blue' | 'amber'
    onChange: (v: boolean) => void
}) {
    const bgColor = checked
        ? color === 'green' ? 'bg-green-500'
            : color === 'blue' ? 'bg-blue-500'
                : 'bg-amber-500'
        : 'bg-slate-200'

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${bgColor}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white border border-slate-300 shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
        </button>
    )
}
