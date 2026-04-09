'use client'

import { ALLERGENS, DIETARY_LABELS } from '@/lib/constants/menu'
import { t, parseNumber } from '@/lib/utils/translation'

type Category = {
    id: string
    name: string
    description?: string
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
    stats: {
        categories: number
        products: number
    }
    menuActive: boolean
}

export function MobilePreview({ category, products, stats, menuActive }: Props) {
    function getAllergenEmoji(id: string) {
        return ALLERGENS.find(a => a.id === id)?.emoji || '⚠️'
    }

    function getLabel(id: string) {
        return DIETARY_LABELS.find(l => l.id === id)
    }

    return (
        <div
            className="flex-shrink-0 flex flex-col p-6 gap-4"
            style={{
                width: '280px',
                background: 'var(--atelier-surface)',
                borderLeft: '1px solid var(--atelier-border)',
            }}
        >
            {/* Title */}
            <div>
                <p className="atelier-sans text-xs uppercase font-semibold tracking-wide" style={{ color: 'var(--atelier-ink3)' }}>
                    Vista del cliente
                </p>
            </div>

            {/* Phone Preview */}
            <div
                className="rounded-3xl overflow-hidden shadow-lg"
                style={{
                    background: 'white',
                    border: '8px solid #1A1510',
                    aspectRatio: '9/19.5',
                }}
            >
                {/* Phone screen */}
                <div className="h-full overflow-y-auto" style={{ background: '#FAFAFA' }}>
                    {category ? (
                        <div className="p-4">
                            {/* Category header */}
                            <div className="mb-4">
                                <h3 className="atelier-serif text-xl font-bold mb-1" style={{ color: '#1A1510' }}>
                                    {t(category.name)}
                                </h3>
                                {category.description && (
                                    <p className="atelier-sans text-xs" style={{ color: '#5C5549' }}>
                                        {t(category.description)}
                                    </p>
                                )}
                            </div>

                            {/* Products */}
                            <div className="space-y-3">
                                {products.filter(p => p.is_available).map((product) => {
                                    const labels = product.labels || []
                                    return (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-lg p-3 shadow-sm"
                                            style={{ border: '1px solid #E2DDD6' }}
                                        >
                                            <div className="flex gap-2">
                                                {/* Image */}
                                                {product.image_url && (
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                        <img
                                                            src={product.image_url}
                                                            alt={t(product.name)}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Labels */}
                                                    {labels.length > 0 && (
                                                        <div className="flex gap-1 mb-1">
                                                            {labels.slice(0, 2).map((labelId) => {
                                                                const label = getLabel(labelId)
                                                                return label ? (
                                                                    <span
                                                                        key={labelId}
                                                                        className="text-xs"
                                                                        title={label.name}
                                                                    >
                                                                        {label.emoji}
                                                                    </span>
                                                                ) : null
                                                            })}
                                                        </div>
                                                    )}

                                                    <h4 className="atelier-serif text-sm font-semibold mb-1 line-clamp-1" style={{ color: '#1A1510' }}>
                                                        {t(product.name)}
                                                    </h4>

                                                    {product.description && (
                                                        <p className="atelier-sans text-xs mb-1 line-clamp-2" style={{ color: '#5C5549' }}>
                                                            {t(product.description)}
                                                        </p>
                                                    )}

                                                    {/* Allergens */}
                                                    {product.allergens && product.allergens.length > 0 && (
                                                        <div className="flex gap-0.5 mb-1">
                                                            {product.allergens.slice(0, 3).map((allergenId) => (
                                                                <span key={allergenId} className="text-xs">
                                                                    {getAllergenEmoji(allergenId)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <p className="atelier-serif text-sm font-bold" style={{ color: '#2B4D35' }}>
                                                        €{parseNumber(product.price, 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {products.filter(p => p.is_available).length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="atelier-sans text-xs" style={{ color: '#A89F95' }}>
                                            Sin productos disponibles
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="atelier-sans text-xs" style={{ color: '#A89F95' }}>
                                Selecciona una categoría
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-lg p-4" style={{ background: 'var(--atelier-surface2)', border: '1px solid var(--atelier-border)' }}>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="atelier-sans text-xs mb-1" style={{ color: 'var(--atelier-ink2)' }}>
                            Categorías
                        </p>
                        <p className="atelier-serif text-xl font-bold" style={{ color: 'var(--atelier-accent)' }}>
                            {stats.categories}
                        </p>
                    </div>
                    <div>
                        <p className="atelier-sans text-xs mb-1" style={{ color: 'var(--atelier-ink2)' }}>
                            Productos
                        </p>
                        <p className="atelier-serif text-xl font-bold" style={{ color: 'var(--atelier-accent)' }}>
                            {stats.products}
                        </p>
                    </div>

                    <div>
                        <p className="atelier-sans text-xs mb-1" style={{ color: 'var(--atelier-ink2)' }}>
                            Estado
                        </p>
                        <div className="flex items-center gap-1">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: menuActive ? 'var(--atelier-accent)' : 'var(--atelier-ink3)' }}
                            />
                            <p className="atelier-sans text-xs font-semibold" style={{ color: 'var(--atelier-ink)' }}>
                                {menuActive ? 'Activo' : 'Inactivo'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
