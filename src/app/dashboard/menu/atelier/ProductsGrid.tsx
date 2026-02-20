'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreateProductPanel } from './CreateProductPanel'
import { ALLERGENS, DIETARY_LABELS } from '@/lib/constants/menu'
import { t, parseNumber, ensureArray } from '@/lib/utils/translation'

type Category = {
    id: string
    name: string
}

type Product = {
    id: string
    name: string
    description?: string
    price: number
    image_url?: string
    allergens: string[]
    labels: string[]
    is_available: boolean
}

type Props = {
    category: Category | null
    products: Product[]
    onProductChanged: () => void
    restaurantId: string
    hasCategories: boolean
}

export function ProductsGrid({ category, products, onProductChanged, restaurantId, hasCategories }: Props) {
    const [showCreatePanel, setShowCreatePanel] = useState(false)
    const supabase = createClient()

    async function handleToggleAvailable(productId: string, currentState: boolean) {
        await supabase
            .from('products')
            .update({ is_available: !currentState })
            .eq('id', productId)
        onProductChanged()
    }

    async function handleDeleteProduct(productId: string) {
        if (!confirm('¿Eliminar este producto?')) return
        await supabase.from('products').delete().eq('id', productId)
        onProductChanged()
    }

    function getAllergenEmoji(id: string) {
        return ALLERGENS.find(a => a.id === id)?.emoji || '⚠️'
    }

    function getLabel(id: string) {
        return DIETARY_LABELS.find(l => l.id === id)
    }

    return (
        <>
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--atelier-bg)' }}>
                {/* Topbar */}
                <div
                    className="flex-shrink-0 px-6 py-4 flex items-center justify-between sticky top-0 z-10"
                    style={{ background: 'var(--atelier-surface2)', borderBottom: '1px solid var(--atelier-border)' }}
                >
                    <h2 className="atelier-serif text-2xl font-bold" style={{ color: 'var(--atelier-ink)' }}>
                        {category ? t(category.name) : 'Productos'}
                    </h2>
                    {category && (
                        <button
                            onClick={() => setShowCreatePanel(true)}
                            className="atelier-btn-primary atelier-sans text-sm"
                        >
                            + Nuevo producto
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!hasCategories ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-8xl mb-6 opacity-30">📂</div>
                            <h3 className="atelier-serif text-2xl font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                                Crea una categoría primero
                            </h3>
                            <p className="atelier-sans text-base" style={{ color: 'var(--atelier-ink2)' }}>
                                Las categorías organizan tus productos
                            </p>
                        </div>
                    ) : !category ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-8xl mb-6 opacity-30">👈</div>
                            <h3 className="atelier-serif text-2xl font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                                Selecciona una categoría
                            </h3>
                            <p className="atelier-sans text-base" style={{ color: 'var(--atelier-ink2)' }}>
                                Elige una categoría del menú lateral
                            </p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-8xl mb-6 opacity-30">🍽️</div>
                            <h3 className="atelier-serif text-2xl font-semibold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                                Sin productos en esta categoría
                            </h3>
                            <p className="atelier-sans text-base mb-6" style={{ color: 'var(--atelier-ink2)' }}>
                                Añade tu primer producto
                            </p>
                            <button
                                onClick={() => setShowCreatePanel(true)}
                                className="atelier-btn-primary atelier-sans text-sm"
                            >
                                + Nuevo producto
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                            {products.map((product, index) => {
                                // Safely handle allergens and labels (might be null, undefined, or JSON string)
                                let labels: string[] = []
                                let allergens: string[] = []

                                try {
                                    if (product.labels) {
                                        labels = Array.isArray(product.labels) ? product.labels : JSON.parse(product.labels as any)
                                    }
                                } catch (e) {
                                    labels = []
                                }

                                try {
                                    if (product.allergens) {
                                        allergens = Array.isArray(product.allergens) ? product.allergens : JSON.parse(product.allergens as any)
                                    }
                                } catch (e) {
                                    allergens = []
                                }

                                return (
                                    <div
                                        key={product.id}
                                        className="atelier-card overflow-hidden atelier-grid-item group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={t(product.name)}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                                    🍽️
                                                </div>
                                            )}

                                            {/* Tags */}
                                            {labels.length > 0 && (
                                                <div className="absolute top-2 left-2 flex gap-1">
                                                    {labels.slice(0, 2).map((labelId) => {
                                                        const label = getLabel(labelId)
                                                        return label ? (
                                                            <span
                                                                key={labelId}
                                                                className="atelier-sans text-xs px-2 py-1 rounded-full font-medium"
                                                                style={{ background: label.bg, color: label.color }}
                                                            >
                                                                {label.emoji}
                                                            </span>
                                                        ) : null
                                                    })}
                                                </div>
                                            )}

                                            {/* Availability dot */}
                                            <div className="absolute top-2 right-2">
                                                <div
                                                    className="w-3 h-3 rounded-full border-2 border-white"
                                                    style={{ background: product.is_available ? 'var(--atelier-accent)' : 'var(--atelier-ink3)' }}
                                                />
                                            </div>

                                            {/* Delete button (hover reveal) */}
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full flex items-center justify-center transition-opacity"
                                                style={{ background: 'var(--atelier-red)', color: 'white' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h4 className="atelier-serif text-lg font-semibold mb-1 line-clamp-1" style={{ color: 'var(--atelier-ink)' }}>
                                                {t(product.name)}
                                            </h4>
                                            <p className="atelier-sans text-sm mb-3 line-clamp-2" style={{ color: 'var(--atelier-ink2)', minHeight: '2.5rem' }}>
                                                {t(product.description, 'Sin descripción')}
                                            </p>

                                            {/* Allergens */}
                                            {allergens.length > 0 && (
                                                <div className="flex gap-1 mb-3">
                                                    {allergens.slice(0, 4).map((allergenId) => (
                                                        <span key={allergenId} className="text-base" title={allergenId}>
                                                            {getAllergenEmoji(allergenId)}
                                                        </span>
                                                    ))}
                                                    {allergens.length > 4 && (
                                                        <span className="atelier-sans text-xs self-center" style={{ color: 'var(--atelier-ink3)' }}>
                                                            +{allergens.length - 4}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Price */}
                                            <p className="atelier-serif text-xl font-bold mb-3" style={{ color: 'var(--atelier-accent)' }}>
                                                €{parseNumber(product.price, 0).toFixed(2)}
                                            </p>

                                            {/* Toggle availability */}
                                            <button
                                                onClick={() => handleToggleAvailable(product.id, product.is_available)}
                                                className="atelier-sans w-full py-2 rounded-lg text-sm font-semibold transition-all"
                                                style={{
                                                    background: product.is_available ? 'var(--atelier-accent-l)' : 'var(--atelier-surface)',
                                                    color: product.is_available ? 'var(--atelier-accent)' : 'var(--atelier-ink3)',
                                                    border: `1px solid ${product.is_available ? 'var(--atelier-accent)' : 'var(--atelier-border)'}`,
                                                }}
                                            >
                                                {product.is_available ? 'Disponible' : 'No disponible'}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {showCreatePanel && category && (
                <CreateProductPanel
                    categoryId={category.id}
                    restaurantId={restaurantId}
                    onClose={() => setShowCreatePanel(false)}
                    onSuccess={() => {
                        setShowCreatePanel(false)
                        onProductChanged()
                    }}
                />
            )}
        </>
    )
}
