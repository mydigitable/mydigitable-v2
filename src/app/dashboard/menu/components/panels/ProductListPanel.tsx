'use client'

import { Plus, Edit2, Star, Trash2 } from 'lucide-react'

export function ProductListPanel({ category, menu, designConfig, onUpdate }: any) {
    if (!category) return null

    const products = category.products || []

    return (
        <div className="w-[340px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-900">
                        {category.name}
                    </h2>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {products.length} productos
                    </span>
                </div>
                <p className="text-sm text-slate-600">
                    {menu?.name}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-slate-200 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold text-sm shadow-sm">
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-all font-semibold text-sm">
                    <span>📸</span>
                    Escanear con IA
                </button>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-4">
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🍽️</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            No hay productos en esta categoría
                        </p>
                        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                            Agregar el primero →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {products.map((product: any) => (
                            <div
                                key={product.id}
                                className="group p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
                            >
                                <div className="flex gap-3">
                                    {/* Image */}
                                    {product.image_url && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                                                {product.name}
                                            </h3>
                                            {product.is_featured && (
                                                <Star className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" />
                                            )}
                                        </div>

                                        {product.description && (
                                            <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                                {product.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-green-600">
                                                €{product.price}
                                            </span>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
                                                    title="Destacar"
                                                >
                                                    <Star className="w-3.5 h-3.5 text-amber-600" />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Config */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <button className="w-full text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center justify-center gap-2 py-2">
                    <span>⚙️</span>
                    Configurar categoría
                </button>
            </div>
        </div>
    )
}
