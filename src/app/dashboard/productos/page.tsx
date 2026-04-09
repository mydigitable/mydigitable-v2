'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'
import { ProductCard } from '@/app/dashboard/menu/components/ProductCard'
import { FilterBar } from '@/app/dashboard/menu/components/FilterBar'
import { ProductPanel } from '@/app/dashboard/menu/components/ProductPanel'

type Product = {
    id: string
    name: string | { es: string; en?: string }
    description?: string | { es: string; en?: string }
    price: number
    image_url?: string
    is_available: boolean
    restaurant_id: string
    allergens?: string[]
    dietary_tags?: string[]
}

type ProductWithAssignments = Product & {
    assignment_count: number
}

type FilterType = 'all' | 'assigned' | 'unassigned'
type ViewMode = 'grid' | 'list'

export default function ProductosLibraryPage() {
    const router = useRouter()
    const supabase = createClient()

    const [products, setProducts] = useState<ProductWithAssignments[]>([])
    const [filteredProducts, setFilteredProducts] = useState<ProductWithAssignments[]>([])
    const [restaurantId, setRestaurantId] = useState<string>('')
    const [loading, setLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<FilterType>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    const [panelOpen, setPanelOpen] = useState(false)
    const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined)

    useEffect(() => {
        loadRestaurantAndProducts()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [products, searchQuery, filterType])

    async function loadRestaurantAndProducts() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (restaurant) {
            setRestaurantId(restaurant.id)
            await loadProducts(restaurant.id)
        }
    }

    async function loadProducts(restId: string) {
        // Load all products
        const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .eq('restaurant_id', restId)
            .order('created_at', { ascending: false })


        if (!productsData) {
            setLoading(false)
            return
        }

        // Count assignments for each product
        const productsWithAssignments: ProductWithAssignments[] = await Promise.all(
            productsData.map(async (product) => {
                const { count } = await supabase
                    .from('product_assignments')
                    .select('*', { count: 'exact', head: true })
                    .eq('product_id', product.id)

                return {
                    ...product,
                    assignment_count: count || 0
                }
            })
        )

        setProducts(productsWithAssignments)
        setLoading(false)
    }

    function applyFilters() {
        let filtered = [...products]

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(p => {
                const name = typeof p.name === 'string' ? p.name : p.name.es
                return name.toLowerCase().includes(searchQuery.toLowerCase())
            })
        }

        // Apply filter type
        if (filterType === 'unassigned') {
            filtered = filtered.filter(p => p.assignment_count === 0)
        } else if (filterType === 'assigned') {
            filtered = filtered.filter(p => p.assignment_count > 0)
        }

        setFilteredProducts(filtered)
    }

    const counts = {
        all: products.length,
        assigned: products.filter(p => p.assignment_count > 0).length,
        unassigned: products.filter(p => p.assignment_count === 0).length,
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ background: 'var(--atelier-bg)' }}>
                <div className="text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="atelier-sans" style={{ color: 'var(--atelier-ink2)' }}>
                        Cargando biblioteca de productos...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col" style={{ background: 'var(--atelier-bg)' }}>
            {/* Header */}
            <div className="flex-shrink-0 px-8 py-6" style={{ background: 'var(--atelier-surface2)', borderBottom: '1px solid var(--atelier-border)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="atelier-serif text-4xl font-bold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                            Biblioteca de Productos
                        </h1>
                        <p className="atelier-sans text-base" style={{ color: 'var(--atelier-ink2)' }}>
                            Crea tus platos una vez y asígnalos a cualquier carta
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProductId(undefined)
                            setPanelOpen(true)
                        }}
                        className="atelier-btn-primary flex items-center gap-2 px-6 py-3 text-base"
                    >
                        <Plus size={20} />
                        Nuevo producto
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterType={filterType}
                onFilterChange={setFilterType}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                counts={counts}
            />

            {/* Products Grid/List */}
            <div className="flex-1 overflow-y-auto p-8">
                {filteredProducts.length === 0 ? (
                    <div className="atelier-empty-state">
                        <div className="atelier-empty-icon">🍽️</div>
                        <h3 className="atelier-empty-title">
                            {searchQuery ? 'No se encontraron productos' : 'No hay productos en tu biblioteca'}
                        </h3>
                        <p className="atelier-empty-description">
                            {searchQuery
                                ? 'Intenta con otra búsqueda'
                                : 'Crea tu primer producto para empezar a construir tu carta'
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => {
                                    setEditingProductId(undefined)
                                    setPanelOpen(true)
                                }}
                                className="atelier-btn-primary px-6 py-3"
                            >
                                Crear primer producto
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                assignmentCount={product.assignment_count}
                                variant="grid"
                                onEdit={() => {
                                    setEditingProductId(product.id)
                                    setPanelOpen(true)
                                }}
                                onAssign={() => {/* TODO: Open assign modal */ }}
                                showAssignButton={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                assignmentCount={product.assignment_count}
                                variant="list"
                                onEdit={() => {
                                    setEditingProductId(product.id)
                                    setPanelOpen(true)
                                }}
                                onAssign={() => {/* TODO: Open assign modal */ }}
                                showAssignButton={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Product Panel */}
            <ProductPanel
                isOpen={panelOpen}
                onClose={() => {
                    setPanelOpen(false)
                    setEditingProductId(undefined)
                }}
                productId={editingProductId}
                restaurantId={restaurantId}
                onSaved={() => {
                    loadProducts(restaurantId)
                }}
            />
        </div>
    )
}
