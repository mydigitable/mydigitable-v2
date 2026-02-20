'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { t } from '@/lib/utils/translation'

type Product = {
    id: string
    name: string | { es: string; en?: string }
    description?: string | { es: string; en?: string }
    price: number
    image_url?: string
    allergens?: string[]
}

type AssignProductsPanelProps = {
    isOpen: boolean
    onClose: () => void
    menuId: string
    categoryId: string
    categoryName: string
    restaurantId: string
    onAssigned: () => void
}

export function AssignProductsPanel({
    isOpen,
    onClose,
    menuId,
    categoryId,
    categoryName,
    restaurantId,
    onAssigned,
}: AssignProductsPanelProps) {
    const supabase = createClient()

    const [products, setProducts] = useState<Product[]>([])
    const [assignedProductIds, setAssignedProductIds] = useState<Set<string>>(new Set())
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            loadProducts()
            loadAssignedProducts()
        } else {
            setSelectedProductIds(new Set())
            setSearchQuery('')
        }
    }, [isOpen, categoryId])

    async function loadProducts() {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })

        setProducts(data || [])
    }

    async function loadAssignedProducts() {
        const { data } = await supabase
            .from('product_assignments')
            .select('product_id')
            .eq('menu_id', menuId)
            .eq('category_id', categoryId)

        const ids = new Set(data?.map(a => a.product_id) || [])
        setAssignedProductIds(ids)
    }

    async function handleAssign() {
        if (selectedProductIds.size === 0) return

        setLoading(true)

        // Insert assignments
        const assignments = Array.from(selectedProductIds).map(productId => ({
            product_id: productId,
            menu_id: menuId,
            category_id: categoryId,
            restaurant_id: restaurantId,
        }))

        await supabase
            .from('product_assignments')
            .insert(assignments)

        setLoading(false)
        onAssigned()
        onClose()
    }

    function toggleProduct(productId: string) {
        const newSelected = new Set(selectedProductIds)
        if (newSelected.has(productId)) {
            newSelected.delete(productId)
        } else {
            newSelected.add(productId)
        }
        setSelectedProductIds(newSelected)
    }

    const filteredProducts = products.filter(p => {
        const name = t(p.name)
        return name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="atelier-slide-overlay open"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="atelier-slide-panel open">
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--atelier-border)' }}>
                    <div>
                        <h2 className="atelier-serif text-2xl font-bold" style={{ color: 'var(--atelier-ink)' }}>
                            Añadir productos
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--atelier-ink2)' }}>
                            a {categoryName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--atelier-surface)] transition-colors"
                    >
                        <X size={20} style={{ color: 'var(--atelier-ink2)' }} />
                    </button>
                </div>

                {/* Search */}
                <div className="flex-shrink-0 px-6 py-4" style={{ borderBottom: '1px solid var(--atelier-border)' }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--atelier-ink3)' }} />
                        <input
                            type="text"
                            placeholder="Buscar en tu biblioteca..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border atelier-sans text-sm"
                            style={{
                                borderColor: 'var(--atelier-border)',
                                background: 'var(--atelier-surface2)',
                                color: 'var(--atelier-ink)',
                            }}
                        />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map((product) => {
                            const isAssigned = assignedProductIds.has(product.id)
                            const isSelected = selectedProductIds.has(product.id)
                            const productName = t(product.name)
                            const initial = productName.charAt(0).toUpperCase()

                            return (
                                <button
                                    key={product.id}
                                    onClick={() => !isAssigned && toggleProduct(product.id)}
                                    disabled={isAssigned}
                                    className={`relative p-3 rounded-lg border text-left transition-all ${isAssigned
                                            ? 'opacity-50 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-[var(--atelier-accent)] bg-[var(--atelier-accent-l)]'
                                                : 'border-[var(--atelier-border)] hover:border-[var(--atelier-ink3)]'
                                        }`}
                                    style={{ background: isSelected ? 'var(--atelier-accent-l)' : 'var(--atelier-surface2)' }}
                                >
                                    {/* Image */}
                                    <div className="w-full aspect-video rounded-lg overflow-hidden mb-2" style={{ background: 'var(--atelier-surface)' }}>
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center atelier-serif text-2xl font-bold" style={{ color: 'var(--atelier-ink3)' }}>
                                                {initial}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <h3 className="atelier-sans font-medium text-sm mb-1 truncate" style={{ color: 'var(--atelier-ink)' }}>
                                        {productName}
                                    </h3>
                                    <p className="atelier-serif text-sm font-bold" style={{ color: 'var(--atelier-accent)' }}>
                                        €{product.price.toFixed(2)}
                                    </p>

                                    {/* Check overlay */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--atelier-accent)', color: 'white' }}>
                                            ✓
                                        </div>
                                    )}

                                    {/* Already assigned badge */}
                                    {isAssigned && (
                                        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--atelier-accent-l)', color: 'var(--atelier-accent)' }}>
                                            Ya asignado
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-sm" style={{ color: 'var(--atelier-ink3)' }}>
                                {searchQuery ? 'No se encontraron productos' : 'No hay productos en tu biblioteca'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 flex gap-3" style={{ borderTop: '1px solid var(--atelier-border)' }}>
                    <button
                        onClick={onClose}
                        className="atelier-btn-ghost flex-1 py-3"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={selectedProductIds.size === 0 || loading}
                        className="atelier-btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Asignando...' : `Asignar ${selectedProductIds.size} producto${selectedProductIds.size !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </>
    )
}
