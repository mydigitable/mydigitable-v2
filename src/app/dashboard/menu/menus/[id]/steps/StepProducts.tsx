'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Edit3, Eye, EyeOff, Star, Loader2, Trash2 } from 'lucide-react'
import { extractName } from '@/lib/utils'
import {
    toggleProductAvailable,
    toggleProductVisible,
    deleteProduct as deleteProductAction,
} from '@/app/actions/menu'

export function StepProducts({ menu, categories, onCategoriesUpdate }: {
    menu: any
    categories: any[]
    onCategoriesUpdate: (cats: any[]) => void
}) {
    const [expandedCats, setExpandedCats] = useState<Set<string>>(
        new Set(categories.map((c: any) => c.id))
    )
    const [savingId, setSavingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const sortedCategories = [...categories].sort((a, b) =>
        (a.sort_order || a.display_order || 0) - (b.sort_order || b.display_order || 0)
    )

    function toggleCategory(catId: string) {
        const next = new Set(expandedCats)
        if (next.has(catId)) next.delete(catId)
        else next.add(catId)
        setExpandedCats(next)
    }

    async function handleToggleAvailable(productId: string, catId: string) {
        setSavingId(productId)
        const result = await toggleProductAvailable(productId)
        if (result.success) {
            onCategoriesUpdate(categories.map(c =>
                c.id === catId
                    ? {
                        ...c,
                        products: c.products.map((p: any) =>
                            p.id === productId ? { ...p, is_available: !p.is_available } : p
                        ),
                    }
                    : c
            ))
        }
        setSavingId(null)
    }

    async function handleToggleVisible(productId: string, catId: string) {
        setSavingId(productId)
        const result = await toggleProductVisible(productId)
        if (result.success) {
            onCategoriesUpdate(categories.map(c =>
                c.id === catId
                    ? {
                        ...c,
                        products: c.products.map((p: any) =>
                            p.id === productId ? { ...p, is_visible: !p.is_visible } : p
                        ),
                    }
                    : c
            ))
        }
        setSavingId(null)
    }

    async function handleDelete(productId: string, catId: string) {
        setSavingId(productId)
        const result = await deleteProductAction(productId)
        if (result.success) {
            onCategoriesUpdate(categories.map(c =>
                c.id === catId
                    ? { ...c, products: c.products.filter((p: any) => p.id !== productId) }
                    : c
            ))
        }
        setDeleteConfirm(null)
        setSavingId(null)
    }

    const totalProducts = categories.reduce((sum, c) => sum + (c.products?.length || 0), 0)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Productos</h2>
                <p className="text-sm text-slate-500">
                    {totalProducts} producto{totalProducts !== 1 ? 's' : ''} en <strong>{menu.name}</strong>
                </p>
            </div>

            {sortedCategories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🍽️</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Primero creá categorías</p>
                    <p className="text-xs text-slate-400 mt-1">Volvé al paso anterior para añadir categorías</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedCategories.map((cat) => {
                        const catName = extractName(cat.name)
                        const products = cat.products || []
                        const isExpanded = expandedCats.has(cat.id)

                        return (
                            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(cat.id)}
                                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                                >
                                    {isExpanded
                                        ? <ChevronDown className="w-4 h-4 text-slate-400" />
                                        : <ChevronRight className="w-4 h-4 text-slate-400" />
                                    }
                                    <span className="text-sm font-bold text-slate-900 flex-1 text-left">{catName}</span>
                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {products.length}
                                    </span>
                                </button>

                                {/* Products */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100">
                                        {products.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <p className="text-sm text-slate-400">Sin productos en esta categoría</p>
                                                <button className="mt-2 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 mx-auto">
                                                    <Plus className="w-3 h-3" />
                                                    Añadir producto
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {products.map((product: any) => (
                                                    <div
                                                        key={product.id}
                                                        className={`group flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-all ${!product.is_available ? 'opacity-50' : ''
                                                            }`}
                                                    >
                                                        {/* Image */}
                                                        {product.image_url ? (
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                                                <img
                                                                    src={product.image_url}
                                                                    alt={extractName(product.name)}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-lg">🍽️</span>
                                                            </div>
                                                        )}

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-semibold text-slate-900 truncate">
                                                                    {extractName(product.name)}
                                                                </h4>
                                                                {product.is_featured && (
                                                                    <Star className="w-3 h-3 text-amber-500 flex-shrink-0" fill="currentColor" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500">
                                                                €{product.price?.toFixed(2)}
                                                                {product.description && ` · ${extractName(product.description).substring(0, 40)}`}
                                                            </p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleToggleAvailable(product.id, cat.id)}
                                                                className={`p-1.5 rounded-lg transition-colors ${product.is_available
                                                                        ? 'hover:bg-green-50 text-green-500'
                                                                        : 'hover:bg-slate-100 text-slate-300'
                                                                    }`}
                                                                title={product.is_available ? 'Marcar agotado' : 'Marcar disponible'}
                                                            >
                                                                {product.is_available
                                                                    ? <Eye className="w-4 h-4" />
                                                                    : <EyeOff className="w-4 h-4" />
                                                                }
                                                            </button>

                                                            {deleteConfirm === product.id ? (
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => handleDelete(product.id, cat.id)}
                                                                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg">
                                                                        <span className="text-xs text-red-600 font-bold">Sí</span>
                                                                    </button>
                                                                    <button onClick={() => setDeleteConfirm(null)}
                                                                        className="p-1.5 hover:bg-slate-100 rounded-lg">
                                                                        <span className="text-xs text-slate-400">No</span>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setDeleteConfirm(product.id)}
                                                                    className="p-1.5 hover:bg-red-50 rounded-lg"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {savingId === product.id && (
                                                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Add product button */}
                                                <button className="w-full flex items-center justify-center gap-2 p-3 text-sm text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors">
                                                    <Plus className="w-4 h-4" />
                                                    Añadir producto a {catName}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
