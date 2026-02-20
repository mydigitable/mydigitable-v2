'use client'

import { useState } from 'react'
import { Palette, Layout, Settings, LayoutGrid, List, Star, Eye, Image as ImageIcon, Layers } from 'lucide-react'
import { selectTheme } from '@/app/actions/design'
import type { RestaurantDesignConfig, MenuTheme } from '@/types/design'

// ============================================
// Theme emoji mapping
// ============================================
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
interface SidebarProps {
    config: RestaurantDesignConfig
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
                is_featured?: boolean
                featured_badge?: string
            }>
        }>
    }>
    selectedCategory: string | null
    selectedProduct: string | null
    onSelectCategory: (id: string | null) => void
    onSelectProduct: (id: string | null) => void
    onChange: (config: RestaurantDesignConfig) => void
}

function extractName(name: unknown): string {
    if (!name) return ''
    if (typeof name === 'string') return name
    if (typeof name === 'object' && name !== null) {
        const n = name as Record<string, string>
        return n.es || n.en || Object.values(n)[0] || ''
    }
    return ''
}

// ============================================
// Main Sidebar
// ============================================
export function Sidebar({
    config,
    themes,
    menus,
    selectedCategory,
    selectedProduct,
    onSelectCategory,
    onSelectProduct,
    onChange
}: SidebarProps) {
    const [activeSection, setActiveSection] = useState<'themes' | 'layout' | 'categories' | 'colors' | 'general'>('themes')

    const sections = [
        { id: 'themes' as const, icon: Palette, label: 'Temas', activeClass: 'text-purple-600 bg-purple-50' },
        { id: 'layout' as const, icon: Layers, label: 'Layout', activeClass: 'text-indigo-600 bg-indigo-50' },
        { id: 'categories' as const, icon: Layout, label: 'Categorías', activeClass: 'text-blue-600 bg-blue-50' },
        { id: 'colors' as const, icon: Palette, label: 'Colores', activeClass: 'text-pink-600 bg-pink-50' },
        { id: 'general' as const, icon: Settings, label: 'General', activeClass: 'text-slate-600 bg-slate-50' }
    ]

    return (
        <div className="w-[340px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
            {/* Navigation Pills */}
            <div className="p-3 flex gap-1 flex-wrap flex-shrink-0">
                {sections.map(section => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id

                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-medium ${isActive
                                ? section.activeClass + ' shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {section.label}
                        </button>
                    )
                })}
            </div>

            <div className="h-px bg-slate-200" />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeSection === 'themes' && (
                    <ThemesSection themes={themes} config={config} onChange={onChange} />
                )}

                {activeSection === 'layout' && (
                    <LayoutSection config={config} onChange={onChange} />
                )}

                {activeSection === 'categories' && (
                    <CategoriesSection
                        menus={menus}
                        config={config}
                        selectedCategory={selectedCategory}
                        selectedProduct={selectedProduct}
                        onSelectCategory={onSelectCategory}
                        onSelectProduct={onSelectProduct}
                        onChange={onChange}
                    />
                )}

                {activeSection === 'colors' && (
                    <ColorsSection config={config} onChange={onChange} />
                )}

                {activeSection === 'general' && (
                    <GeneralSection config={config} onChange={onChange} />
                )}
            </div>
        </div>
    )
}

// ============================================
// Themes Section
// ============================================
function ThemesSection({ themes, config, onChange }: { themes: MenuTheme[]; config: RestaurantDesignConfig; onChange: (c: RestaurantDesignConfig) => void }) {
    const [selectingId, setSelectingId] = useState<string | null>(null)

    async function handleSelect(themeId: string) {
        setSelectingId(themeId)
        const result = await selectTheme(themeId)
        if (result.success) {
            const theme = themes.find(t => t.id === themeId)
            if (theme) {
                onChange({
                    ...config,
                    selected_theme_id: themeId,
                    selected_theme: theme,
                    custom_colors: {},
                    layout_type: theme.layout_type as RestaurantDesignConfig['layout_type'],
                })
            }
        }
        setSelectingId(null)
    }

    return (
        <div className="space-y-3">
            {themes.map(theme => {
                const isSelected = config.selected_theme_id === theme.id
                const isSelecting = selectingId === theme.id
                const emoji = THEME_EMOJIS[theme.slug] || '🎨'

                return (
                    <button
                        key={theme.id}
                        onClick={() => handleSelect(theme.id)}
                        disabled={isSelecting}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                            } ${isSelecting ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">{emoji}</div>
                            <div
                                className="w-12 h-12 rounded-lg shadow-sm"
                                style={{ backgroundColor: theme.colors.primary }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                    {theme.name}
                                    {isSelected && <span className="text-green-600">✓</span>}
                                    {isSelecting && <span className="text-xs text-slate-500 animate-pulse">Cargando...</span>}
                                </div>
                                <div className="text-xs text-slate-600 line-clamp-2">{theme.description}</div>
                            </div>
                        </div>

                        {/* Color Palette Preview */}
                        <div className="flex gap-1.5">
                            {Object.values(theme.colors).slice(0, 5).map((color, i) => (
                                <div
                                    key={i}
                                    className="flex-1 h-2 rounded-full"
                                    style={{ backgroundColor: color as string }}
                                />
                            ))}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {theme.best_for?.map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{tag}</span>
                            ))}
                        </div>
                    </button>
                )
            })}

            {themes.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p className="text-4xl mb-3">🎨</p>
                    <p className="font-medium mb-1">No hay temas</p>
                    <p className="text-sm">Ejecuta la migración de temas primero.</p>
                </div>
            )}
        </div>
    )
}

// ============================================
// Layout Section (NEW - all layout controls)
// ============================================
function LayoutSection({ config, onChange }: { config: RestaurantDesignConfig; onChange: (c: RestaurantDesignConfig) => void }) {
    return (
        <div className="space-y-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Configuración de Layout</p>

            {/* Layout Type */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Tipo de Layout</label>
                <div className="grid grid-cols-2 gap-2">
                    {([
                        { id: 'grid', label: 'Grid', icon: '⊞', desc: 'Cuadrícula' },
                        { id: 'list', label: 'Lista', icon: '☰', desc: 'Vertical' },
                        { id: 'photo-grid', label: 'Fotos', icon: '📷', desc: 'Solo fotos' },
                        { id: 'horizontal-cards', label: 'Horizontal', icon: '↔️', desc: 'Scroll lateral' },
                    ] as const).map(layout => (
                        <button
                            key={layout.id}
                            onClick={() => onChange({ ...config, layout_type: layout.id })}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${config.layout_type === layout.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="text-xl mb-1">{layout.icon}</div>
                            <div className="text-xs font-semibold text-slate-900">{layout.label}</div>
                            <div className="text-[10px] text-slate-500">{layout.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Columns */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Columnas</label>
                <div className="flex gap-2">
                    {([1, 2, 3] as const).map(cols => (
                        <button
                            key={cols}
                            onClick={() => onChange({ ...config, grid_columns: cols })}
                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${config.grid_columns === cols
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            {cols}
                        </button>
                    ))}
                </div>
            </div>

            {/* Card Style */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Estilo de Tarjeta</label>
                <div className="grid grid-cols-3 gap-2">
                    {([
                        { id: 'flat', label: 'Plana', icon: '▬' },
                        { id: 'elevated', label: 'Elevada', icon: '▭' },
                        { id: 'outlined', label: 'Bordeada', icon: '▯' },
                    ] as const).map(style => (
                        <button
                            key={style.id}
                            onClick={() => onChange({ ...config, card_style: style.id })}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${config.card_style === style.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="text-lg mb-1">{style.icon}</div>
                            <div className="text-xs font-medium text-slate-700">{style.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Spacing */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Espaciado</label>
                <div className="grid grid-cols-3 gap-2">
                    {([
                        { id: 'compact', label: 'Compacto' },
                        { id: 'normal', label: 'Normal' },
                        { id: 'relaxed', label: 'Amplio' },
                    ] as const).map(sp => (
                        <button
                            key={sp.id}
                            onClick={() => onChange({ ...config, spacing: sp.id })}
                            className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${config.spacing === sp.id
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            {sp.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Border Radius */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Bordes redondeados: <span className="text-green-600">{config.border_radius}px</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="24"
                    value={config.border_radius}
                    onChange={(e) => onChange({ ...config, border_radius: parseInt(e.target.value) })}
                    className="w-full accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0px</span>
                    <span>12px</span>
                    <span>24px</span>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Categories Section (with product editing)
// ============================================
function CategoriesSection({ menus, config, selectedCategory, selectedProduct, onSelectCategory, onSelectProduct, onChange }: {
    menus: SidebarProps['menus']
    config: RestaurantDesignConfig
    selectedCategory: string | null
    selectedProduct: string | null
    onSelectCategory: (id: string | null) => void
    onSelectProduct: (id: string | null) => void
    onChange: (c: RestaurantDesignConfig) => void
}) {
    // If a product is selected, show product detail
    if (selectedProduct) {
        const product = menus
            .flatMap(m => m.categories || [])
            .flatMap(c => c.products || [])
            .find(p => p.id === selectedProduct)

        const pName = product ? (extractName(product.name) || product.name_es || 'Producto') : 'Producto'

        return (
            <div className="space-y-4">
                <button
                    onClick={() => onSelectProduct(null)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    ← Volver a categorías
                </button>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-sm text-slate-900 mb-1">{pName}</h3>
                    <p className="text-xs text-slate-500">Configuración del producto</p>
                </div>

                {/* Featured toggle */}
                <label className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Star className={`w-5 h-5 ${product?.is_featured ? 'text-amber-600' : 'text-amber-400'}`} fill={product?.is_featured ? 'currentColor' : 'none'} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-slate-900">Producto Destacado</div>
                            <div className="text-xs text-slate-500">Aparecerá en la sección destacados</div>
                        </div>
                    </div>

                    <div className="relative">
                        <input type="checkbox" defaultChecked={product?.is_featured} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 cursor-pointer" />
                    </div>
                </label>

                {/* Badge selector */}
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Badge</label>
                    <select
                        defaultValue={product?.featured_badge || 'Popular'}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 outline-none text-sm bg-white"
                    >
                        <option value="Popular">🔥 Popular</option>
                        <option value="Nuevo">✨ Nuevo</option>
                        <option value="Recomendado">👨‍🍳 Recomendado</option>
                        <option value="Del Chef">⭐ Del Chef</option>
                    </select>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs text-amber-800">💡 Los cambios de producto se guardarán con la API de productos destacados (próximamente).</p>
                </div>
            </div>
        )
    }

    // If a category is selected, show category detail
    if (selectedCategory) {
        const category = menus
            .flatMap(m => m.categories || [])
            .find(c => c.id === selectedCategory)

        const catName = category ? (extractName(category.name) || category.name_es || 'Categoría') : 'Categoría'
        const products = category?.products || []

        return (
            <div className="space-y-4">
                <button
                    onClick={() => onSelectCategory(null)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    ← Volver a categorías
                </button>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-sm text-slate-900 mb-1">{catName}</h3>
                    <p className="text-xs text-slate-500">{products.length} productos</p>
                </div>

                {/* Category layout */}
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">Layout de esta categoría</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button className={`p-4 rounded-xl border-2 transition-all ${(category?.layout_type || 'grid') === 'grid' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <LayoutGrid className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                            <div className="text-xs font-medium text-center">Grid</div>
                        </button>
                        <button className={`p-4 rounded-xl border-2 transition-all ${category?.layout_type === 'list' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <List className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                            <div className="text-xs font-medium text-center">Lista</div>
                        </button>
                    </div>
                </div>

                {/* Category visibility toggles */}
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">Opciones</label>
                    <div className="space-y-2">
                        {[
                            { checked: category?.show_images !== false, label: 'Mostrar imágenes', icon: ImageIcon },
                            { checked: category?.show_prices !== false, label: 'Mostrar precios', icon: Eye },
                            { checked: category?.show_descriptions !== false, label: 'Descripciones', icon: Eye },
                        ].map((option, i) => {
                            const Icon = option.icon
                            return (
                                <label key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-all">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-slate-600" />
                                        <span className="text-sm font-medium text-slate-900">{option.label}</span>
                                    </div>
                                    <div className="relative">
                                        <input type="checkbox" defaultChecked={option.checked} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 cursor-pointer" />
                                    </div>
                                </label>
                            )
                        })}
                    </div>
                </div>

                {/* Products list in this category */}
                {products.length > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">Productos</label>
                        <div className="space-y-1">
                            {products.map(p => {
                                const pName = extractName(p.name) || p.name_es || 'Producto'
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => onSelectProduct(p.id || null)}
                                        className="w-full px-3 py-2.5 rounded-lg text-left text-sm transition-all flex items-center justify-between text-slate-700 hover:bg-slate-100"
                                    >
                                        <span className="flex items-center gap-2">
                                            {p.is_featured && <Star className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />}
                                            {pName}
                                        </span>
                                        <span className="text-xs text-slate-400">→</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Default: show all categories
    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                Selecciona una categoría para editarla
            </p>

            {menus.map(menu => (
                <div key={menu.id || 'menu'} className="space-y-1">
                    <div className="text-xs font-semibold text-slate-700 px-2 py-1">
                        {extractName(menu.name) || 'Menú'}
                    </div>

                    {menu.categories?.map(category => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(selectedCategory === category.id ? null : (category.id || null))}
                            className={`w-full px-3 py-2.5 rounded-lg text-left text-sm transition-all flex items-center justify-between group ${selectedCategory === category.id
                                ? 'bg-blue-100 text-blue-900 font-medium'
                                : 'text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            <span>{extractName(category.name) || category.name_es || 'Categoría'}</span>
                            <span className="text-xs text-slate-400 group-hover:text-slate-600">
                                {category.products?.length || 0} productos
                            </span>
                        </button>
                    ))}
                </div>
            ))}

            {menus.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <p className="text-3xl mb-2">📂</p>
                    <p className="text-sm">No hay menús aún</p>
                </div>
            )}
        </div>
    )
}

// ============================================
// Colors Section
// ============================================
function ColorsSection({ config, onChange }: { config: RestaurantDesignConfig; onChange: (c: RestaurantDesignConfig) => void }) {
    const themeColors = (config.selected_theme?.colors || {}) as Record<string, string>
    const customColors = (config.custom_colors || {}) as Record<string, string>

    const colors = [
        { key: 'primary', label: 'Principal', desc: 'Botones y CTA' },
        { key: 'accent', label: 'Acento', desc: 'Destacados' },
        { key: 'background', label: 'Fondo', desc: 'Color de fondo' },
        { key: 'surface', label: 'Superficie', desc: 'Tarjetas' },
        { key: 'border', label: 'Bordes', desc: 'Líneas y separadores' },
        { key: 'text', label: 'Texto', desc: 'Color del texto' },
    ]

    function handleColorChange(key: string, value: string) {
        onChange({
            ...config,
            custom_colors: { ...customColors, [key]: value }
        })
    }

    function resetColors() {
        onChange({ ...config, custom_colors: {} })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Colores personalizados</p>
                {Object.keys(customColors).length > 0 && (
                    <button onClick={resetColors} className="text-xs text-red-500 hover:text-red-700">Resetear</button>
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
                        onChange={(e) => handleColorChange(color.key, e.target.value)}
                        className="w-12 h-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                    />
                </div>
            ))}
        </div>
    )
}

// ============================================
// General Section
// ============================================
function GeneralSection({ config, onChange }: { config: RestaurantDesignConfig; onChange: (c: RestaurantDesignConfig) => void }) {
    const options = [
        { key: 'show_search' as const, label: 'Barra de búsqueda', icon: '🔍' },
        { key: 'show_categories' as const, label: 'Filtros categorías', icon: '📂' },
        { key: 'show_images' as const, label: 'Imágenes', icon: '📸' },
        { key: 'show_prices' as const, label: 'Mostrar precios', icon: '💰' },
        { key: 'show_descriptions' as const, label: 'Descripciones', icon: '📝' },
        { key: 'show_badges' as const, label: 'Badges / etiquetas', icon: '🏷️' },
        { key: 'show_allergens' as const, label: 'Alérgenos', icon: '⚠️' },
        { key: 'show_logo' as const, label: 'Mostrar logo', icon: '🖼️' },
        { key: 'show_powered_by' as const, label: 'Powered by MyDigitable', icon: '⚡' },
    ]

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Opciones de visualización</p>

            {options.map(option => (
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
                            checked={!!config[option.key]}
                            onChange={(e) => onChange({ ...config, [option.key]: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 cursor-pointer" />
                    </div>
                </label>
            ))}
        </div>
    )
}
