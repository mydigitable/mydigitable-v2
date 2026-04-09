'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronLeft } from 'lucide-react'
import { ProductCard } from '@/app/dashboard/menu/components/ProductCard'
import { ProductPanel } from '@/app/dashboard/menu/components/ProductPanel'
import { AssignProductsPanel } from '@/app/dashboard/menu/components/AssignProductsPanel'
import { t } from '@/lib/utils/translation'

type Category = {
    id: string
    name: string | { es: string; en?: string }
}

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
    assignment_count?: number
}

type ProductAssignment = {
    product_id: string
    products: Product
}

export default function MenuProductosPage() {
    const params = useParams()
    const router = useRouter()
    const menuId = params?.menuId as string
    const supabase = createClient()

    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
    const [assignedProducts, setAssignedProducts] = useState<Product[]>([])
    const [restaurantId, setRestaurantId] = useState<string>('')
    const [loading, setLoading] = useState(true)

    const [productPanelOpen, setProductPanelOpen] = useState(false)
    const [assignPanelOpen, setAssignPanelOpen] = useState(false)
    const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined)

    useEffect(() => {
        loadRestaurantAndData()
    }, [menuId])

    useEffect(() => {
        if (selectedCategoryId && restaurantId) {
            loadAssignedProducts()
        }
    }, [selectedCategoryId, restaurantId])

    async function loadRestaurantAndData() {
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
            await loadCategories(restaurant.id)
        }
    }

    async function loadCategories(restId: string) {
        const { data } = await supabase
            .from('menu_categories')
            .select('id, name')
            .eq('menu_id', menuId)
            .eq('restaurant_id', restId)
            .order('display_order')

        if (data && data.length > 0) {
            setCategories(data)
            setSelectedCategoryId(data[0].id)
        }
        setLoading(false)
    }

    async function loadAssignedProducts() {
        const { data } = await supabase
            .from('product_assignments')
            .select(`
                product_id,
                products (*)
            `)
            .eq('menu_id', menuId)
            .eq('category_id', selectedCategoryId)

        const productsData = (data as any[] || [])
            .map((a: any) => a.products)
            .filter(Boolean)

        // Count total assignments for each product
        const productsWithCounts = await Promise.all(
            productsData.map(async (product: any) => {
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

        setAssignedProducts(productsWithCounts)
    }

    async function handleRemoveProduct(productId: string) {
        await supabase
            .from('product_assignments')
            .delete()
            .eq('product_id', productId)
            .eq('menu_id', menuId)
            .eq('category_id', selectedCategoryId)

        loadAssignedProducts()
    }

    const selectedCategory = categories.find(c => c.id === selectedCategoryId)
    const selectedCategoryName = selectedCategory ? t(selectedCategory.name) : ''

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ background: 'var(--atelier-bg)' }}>
                <div className="text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="atelier-sans" style={{ color: 'var(--atelier-ink2)' }}>
                        Cargando productos...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex" style={{ background: 'var(--atelier-bg)' }}>
            {/* Sidebar - Categories */}
            <div className="w-64 flex-shrink-0 flex flex-col" style={{ background: 'var(--atelier-surface2)', borderRight: '1px solid var(--atelier-border)' }}>
                <div className="p-4" style={{ borderBottom: '1px solid var(--atelier-border)' }}>
                    <button
                        onClick={() => router.push(`/dashboard/menu/${menuId}/categorias`)}
                        className="flex items-center gap-2 text-sm atelier-sans hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--atelier-ink2)' }}
                    >
                        <ChevronLeft size={16} />
                        Volver a categorías
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-xs font-semibold uppercase mb-3 atelier-sans" style={{ color: 'var(--atelier-ink3)' }}>
                        Categorías
                    </h3>
                    <div className="space-y-1">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategoryId(category.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all atelier-sans text-sm ${selectedCategoryId === category.id
                                    ? 'bg-[var(--atelier-accent-l)] text-[var(--atelier-accent)] font-medium'
                                    : 'text-[var(--atelier-ink2)] hover:bg-[var(--atelier-surface)]'
                                    }`}
                            >
                                {t(category.name)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 px-8 py-6" style={{ background: 'var(--atelier-surface2)', borderBottom: '1px solid var(--atelier-border)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="atelier-serif text-4xl font-bold mb-2" style={{ color: 'var(--atelier-ink)' }}>
                                {selectedCategoryName}
                            </h1>
                            <p className="atelier-sans text-base" style={{ color: 'var(--atelier-ink2)' }}>
                                {assignedProducts.length} producto{assignedProducts.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setEditingProductId(undefined)
                                    setProductPanelOpen(true)
                                }}
                                className="atelier-btn-ghost flex items-center gap-2 px-4 py-2"
                            >
                                <Plus size={18} />
                                Crear producto
                            </button>
                            <button
                                onClick={() => setAssignPanelOpen(true)}
                                className="atelier-btn-primary flex items-center gap-2 px-6 py-3"
                            >
                                <Plus size={20} />
                                Añadir desde biblioteca
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto p-8">
                    {!selectedCategoryId ? (
                        <div className="atelier-empty-state">
                            <div className="atelier-empty-icon">👈</div>
                            <h3 className="atelier-empty-title">
                                Selecciona una categoría
                            </h3>
                            <p className="atelier-empty-description">
                                Elige una categoría del panel lateral para ver sus productos
                            </p>
                        </div>
                    ) : assignedProducts.length === 0 ? (
                        <div className="atelier-empty-state">
                            <div className="atelier-empty-icon">🍽️</div>
                            <h3 className="atelier-empty-title">
                                No hay productos en esta categoría
                            </h3>
                            <p className="atelier-empty-description">
                                Añade productos desde tu biblioteca o crea uno nuevo
                            </p>
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setEditingProductId(undefined)
                                        setProductPanelOpen(true)
                                    }}
                                    className="atelier-btn-ghost px-6 py-3"
                                >
                                    Crear producto
                                </button>
                                <button
                                    onClick={() => setAssignPanelOpen(true)}
                                    className="atelier-btn-primary px-6 py-3"
                                >
                                    Añadir desde biblioteca
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {assignedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    assignmentCount={product.assignment_count || 0}
                                    variant="grid"
                                    onEdit={() => {
                                        setEditingProductId(product.id)
                                        setProductPanelOpen(true)
                                    }}
                                    onRemove={() => handleRemoveProduct(product.id)}
                                    showAssignButton={false}
                                    showRemoveButton={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Panel */}
            <ProductPanel
                isOpen={productPanelOpen}
                onClose={() => {
                    setProductPanelOpen(false)
                    setEditingProductId(undefined)
                }}
                productId={editingProductId}
                restaurantId={restaurantId}
                menuId={menuId}
                categoryId={selectedCategoryId}
                onSaved={() => {
                    loadAssignedProducts()
                }}
            />

            {/* Assign Products Panel */}
            {selectedCategory && (
                <AssignProductsPanel
                    isOpen={assignPanelOpen}
                    onClose={() => setAssignPanelOpen(false)}
                    menuId={menuId}
                    categoryId={selectedCategoryId}
                    categoryName={selectedCategoryName}
                    restaurantId={restaurantId}
                    onAssigned={() => {
                        loadAssignedProducts()
                    }}
                />
            )}
        </div>
    )
}
