'use client'

import { useState, useEffect } from 'react'
import { LayoutGrid, List, Star, Eye, Image as ImageIcon } from 'lucide-react'
import type { RestaurantDesignConfig } from '@/types/design'

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

// ============================================
// Props
// ============================================
interface DetailPanelProps {
    selectedCategory: string | null
    selectedProduct: string | null
    config: RestaurantDesignConfig
    menus: Array<{
        categories?: Array<{
            id?: string
            name?: unknown
            layout_type?: string
            grid_columns?: number
            show_images?: boolean
            show_prices?: boolean
            show_descriptions?: boolean
            products?: Array<{
                id?: string
                name?: unknown
                is_featured?: boolean
                featured_badge?: string
            }>
        }>
    }>
    onChange: (config: RestaurantDesignConfig) => void
}

// ============================================
// Main Component
// ============================================
export function DetailPanel({
    selectedCategory,
    selectedProduct,
    config,
    menus,
    onChange
}: DetailPanelProps) {
    if (!selectedCategory && !selectedProduct) {
        return (
            <div className="w-[320px] bg-white border-l border-slate-200 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">👈</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Selecciona un elemento</p>
                    <p className="text-xs text-slate-500">
                        Haz click en una categoría en el sidebar o un producto en el preview para editar sus opciones
                    </p>
                </div>
            </div>
        )
    }

    if (selectedCategory) {
        return <CategoryDetailPanel categoryId={selectedCategory} menus={menus} config={config} onChange={onChange} />
    }

    if (selectedProduct) {
        return <ProductDetailPanel productId={selectedProduct} menus={menus} config={config} onChange={onChange} />
    }

    return null
}

// ============================================
// Category Detail Panel
// ============================================
function CategoryDetailPanel({ categoryId, menus, config, onChange }: {
    categoryId: string
    menus: DetailPanelProps['menus']
    config: RestaurantDesignConfig
    onChange: (config: RestaurantDesignConfig) => void
}) {
    // Find the category from menus
    const category = menus
        .flatMap(m => m.categories || [])
        .find(c => c.id === categoryId)

    const catName = category ? (extractName(category.name) || 'Categoría') : 'Categoría'
    const productCount = category?.products?.length || 0

    // Local state for category-level overrides
    const [catLayout, setCatLayout] = useState(category?.layout_type || config.layout_type || 'grid')
    const [catCols, setCatCols] = useState(category?.grid_columns || config.grid_columns || 2)
    const [catShowImages, setCatShowImages] = useState(category?.show_images !== undefined ? category.show_images : config.show_images)
    const [catShowPrices, setCatShowPrices] = useState(category?.show_prices !== undefined ? category.show_prices : config.show_prices)
    const [catShowDescs, setCatShowDescs] = useState(category?.show_descriptions !== undefined ? category.show_descriptions : config.show_descriptions)

    // Reset when category changes
    useEffect(() => {
        setCatLayout(category?.layout_type || config.layout_type || 'grid')
        setCatCols(category?.grid_columns || config.grid_columns || 2)
        setCatShowImages(category?.show_images !== undefined ? category.show_images : config.show_images)
        setCatShowPrices(category?.show_prices !== undefined ? category.show_prices : config.show_prices)
        setCatShowDescs(category?.show_descriptions !== undefined ? category.show_descriptions : config.show_descriptions)
    }, [categoryId, category, config])

    return (
        <div className="w-[320px] bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-200 flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Configurar Categoría</h2>
                <p className="text-sm text-slate-600">{catName}</p>
                <p className="text-xs text-slate-400 mt-1">{productCount} productos</p>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* Layout Type */}
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                        Tipo de Layout
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setCatLayout('grid')}
                            className={`p-4 rounded-xl border-2 transition-all ${catLayout === 'grid'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <LayoutGrid className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                            <div className="text-xs font-medium text-center">Grid</div>
                        </button>

                        <button
                            onClick={() => setCatLayout('list')}
                            className={`p-4 rounded-xl border-2 transition-all ${catLayout === 'list'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <List className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                            <div className="text-xs font-medium text-center">Lista</div>
                        </button>
                    </div>
                </div>

                {/* Grid Columns */}
                {catLayout === 'grid' && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">
                            Columnas
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(cols => (
                                <button
                                    key={cols}
                                    onClick={() => setCatCols(cols)}
                                    className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${catCols === cols
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    {cols}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Options */}
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                        Opciones de Categoría
                    </label>

                    <div className="space-y-2">
                        {[
                            { checked: catShowImages, set: setCatShowImages, label: 'Mostrar imágenes', icon: ImageIcon },
                            { checked: catShowPrices, set: setCatShowPrices, label: 'Mostrar precios', icon: Eye },
                            { checked: catShowDescs, set: setCatShowDescs, label: 'Mostrar descripciones', icon: Eye },
                        ].map((option, i) => {
                            const Icon = option.icon
                            return (
                                <label
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-slate-600" />
                                        <span className="text-sm font-medium text-slate-900">{option.label}</span>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={option.checked}
                                            onChange={(e) => option.set(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 cursor-pointer" />
                                    </div>
                                </label>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs text-amber-800">
                        💡 <strong>Próximamente:</strong> Los cambios por categoría se guardarán directamente en la base de datos. Por ahora usa las opciones globales del sidebar.
                    </p>
                </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex-shrink-0">
                <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                    Guardar cambios
                </button>
            </div>
        </div>
    )
}

// ============================================
// Product Detail Panel
// ============================================
function ProductDetailPanel({ productId, menus, config, onChange }: {
    productId: string
    menus: DetailPanelProps['menus']
    config: RestaurantDesignConfig
    onChange: (config: RestaurantDesignConfig) => void
}) {
    // Find the product from menus
    const product = menus
        .flatMap(m => m.categories || [])
        .flatMap(c => c.products || [])
        .find(p => p.id === productId)

    const pName = product ? (extractName(product.name) || 'Producto') : 'Producto'
    const [isFeatured, setIsFeatured] = useState(product?.is_featured || false)
    const [badge, setBadge] = useState(product?.featured_badge || 'Popular')

    // Reset when product changes
    useEffect(() => {
        setIsFeatured(product?.is_featured || false)
        setBadge(product?.featured_badge || 'Popular')
    }, [productId, product])

    return (
        <div className="w-[320px] bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-200 flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Configurar Producto</h2>
                <p className="text-sm text-slate-600">{pName}</p>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* Featured toggle */}
                <div>
                    <label className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Star className={`w-5 h-5 ${isFeatured ? 'text-amber-600' : 'text-amber-400'}`} fill={isFeatured ? 'currentColor' : 'none'} />
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-slate-900">Producto Destacado</div>
                                <div className="text-xs text-slate-600">Aparecerá en la sección destacados</div>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 cursor-pointer" />
                        </div>
                    </label>
                </div>

                {/* Badge selection */}
                {isFeatured && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Badge Destacado
                        </label>
                        <select
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                        >
                            <option value="Popular">🔥 Popular</option>
                            <option value="Nuevo">✨ Nuevo</option>
                            <option value="Recomendado">👨‍🍳 Recomendado</option>
                            <option value="Del Chef">⭐ Del Chef</option>
                        </select>

                        {/* Badge preview */}
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Preview:</span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-accent, #F59E0B)' }}>
                                {badge}
                            </span>
                        </div>
                    </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs text-amber-800">
                        💡 <strong>Próximamente:</strong> Los cambios de producto se guardarán directamente en la base de datos con la API de productos destacados.
                    </p>
                </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex-shrink-0">
                <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                    Guardar cambios
                </button>
            </div>
        </div>
    )
}
