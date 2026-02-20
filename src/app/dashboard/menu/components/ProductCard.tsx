'use client'

import { useState } from 'react'
import { getLocalizedText } from '@/lib/utils/i18n'
import { toggleProductAvailable, deleteProduct } from '@/app/actions/menu'
import { getAllergenEmoji, getLabelById } from '@/lib/constants/menu'

function getImageUrl(url: string | null) {
    if (!url) return '/placeholder-food.png'
    if (url.startsWith('http')) return url
    return `/uploads/${url}`
}

export function ProductCard({ product, view, onRefresh, onRefreshCounters, onEdit }: any) {
    const [isToggling, setIsToggling] = useState(false)

    async function handleToggle(e: React.MouseEvent) {
        e.stopPropagation()
        setIsToggling(true)
        await toggleProductAvailable(product.id)
        await onRefresh()
        setIsToggling(false)
    }

    const allergens = product.allergens || []
    const labels = product.labels || []

    if (view === 'list') {
        return (
            <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-green-300 hover:shadow-sm transition-all p-4">
                <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                            src={getImageUrl(product.image_url)}
                            alt={getLocalizedText(product.name)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f1f5f9" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3E🍽️%3C/text%3E%3C/svg%3E'
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base text-slate-900 mb-1 truncate">
                            {getLocalizedText(product.name)}
                        </h4>
                        <p className="text-sm text-slate-500 truncate">
                            {product.description ? getLocalizedText(product.description) : 'Sin descripción'}
                        </p>

                        {/* Allergens & Labels */}
                        {(allergens.length > 0 || labels.length > 0) && (
                            <div className="flex gap-1 mt-2">
                                {labels.slice(0, 3).map((labelId: string) => {
                                    const label = getLabelById(labelId)
                                    return label ? (
                                        <span
                                            key={labelId}
                                            className="text-xs px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: label.bg, color: label.color }}
                                            title={label.name}
                                        >
                                            {label.emoji}
                                        </span>
                                    ) : null
                                })}
                                {allergens.slice(0, 4).map((allergenId: string) => (
                                    <span
                                        key={allergenId}
                                        className="text-sm"
                                        title={allergenId}
                                    >
                                        {getAllergenEmoji(allergenId)}
                                    </span>
                                ))}
                                {(allergens.length + labels.length > 7) && (
                                    <span className="text-xs text-slate-400">
                                        +{allergens.length + labels.length - 7}
                                    </span>
                                )}
                            </div>
                        )}

                        <p className="text-lg font-bold text-green-600 mt-1">
                            €{product.price?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    {/* Stock Toggle */}
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={handleToggle}
                            disabled={isToggling}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${product.is_available
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {product.is_available ? 'Stock' : 'Agotado'}
                        </button>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit()
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                Editar
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    if (confirm('¿Eliminar este producto?')) {
                                        await deleteProduct(product.id)
                                        await onRefresh()
                                        if (onRefreshCounters) await onRefreshCounters()
                                    }
                                }}
                                className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Grid view
    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-green-300 hover:shadow-md transition-all overflow-hidden group">
            {/* Image */}
            <div className="relative aspect-square bg-slate-100 overflow-hidden">
                <img
                    src={getImageUrl(product.image_url)}
                    alt={getLocalizedText(product.name)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f1f5f9" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="80"%3E🍽️%3C/text%3E%3C/svg%3E'
                    }}
                />

                {/* Stock Badge */}
                <div className="absolute top-2 right-2">
                    <button
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all ${product.is_available
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                            } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {product.is_available ? 'Stock' : 'Agotado'}
                    </button>
                </div>

                {/* Labels Badge */}
                {labels.length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                        {labels.slice(0, 2).map((labelId: string) => {
                            const label = getLabelById(labelId)
                            return label ? (
                                <span
                                    key={labelId}
                                    className="text-xs px-2 py-1 rounded-full font-medium shadow-sm"
                                    style={{ backgroundColor: label.bg, color: label.color }}
                                    title={label.name}
                                >
                                    {label.emoji} {label.name}
                                </span>
                            ) : null
                        })}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h4 className="font-bold text-base text-slate-900 mb-1 line-clamp-1">
                    {getLocalizedText(product.name)}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.description ? getLocalizedText(product.description) : 'Sin descripción'}
                </p>

                {/* Allergens */}
                {allergens.length > 0 && (
                    <div className="flex gap-1 mb-3">
                        {allergens.slice(0, 6).map((allergenId: string) => (
                            <span
                                key={allergenId}
                                className="text-base"
                                title={allergenId}
                            >
                                {getAllergenEmoji(allergenId)}
                            </span>
                        ))}
                        {allergens.length > 6 && (
                            <span className="text-xs text-slate-400 self-center">
                                +{allergens.length - 6}
                            </span>
                        )}
                    </div>
                )}

                <p className="text-xl font-bold text-green-600 mb-3">
                    €{product.price?.toFixed(2) || '0.00'}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit()
                        }}
                        className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm('¿Eliminar este producto?')) {
                                await deleteProduct(product.id)
                                await onRefresh()
                                if (onRefreshCounters) await onRefreshCounters()
                            }
                        }}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    )
}
