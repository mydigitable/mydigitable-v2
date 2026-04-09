'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ProductCard } from './ProductCard'
import { CreateProductModal } from './CreateProductModal'
import { EditProductModal } from './EditProductModal'
import { reorderProducts } from '@/app/actions/menu'

// Sortable Product Card Component
function SortableProductCard({ product, view, onRefresh, onRefreshCounters, onEdit }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: product.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} className={`relative ${isDragging ? 'z-50' : ''}`}>
            {/* Drag Handle Overlay */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-2 top-2 w-8 h-8 bg-white/90 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity z-10 text-slate-400 hover:text-slate-600"
                title="Arrastra para reordenar"
            >
                ⋮⋮
            </div>

            <ProductCard
                product={product}
                view={view}
                onRefresh={onRefresh}
                onRefreshCounters={onRefreshCounters}
                onEdit={onEdit}
            />
        </div>
    )
}

export function ProductPanel({ products, onRefresh, onRefreshCounters, categoryId, restaurantId }: any) {
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [view, setView] = useState('grid')
    const [localProducts, setLocalProducts] = useState(products)

    // Update local products when prop changes
    useEffect(() => {
        setLocalProducts(products)
    }, [products])

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over || active.id === over.id) {
            return
        }

        const oldIndex = localProducts.findIndex((prod: any) => prod.id === active.id)
        const newIndex = localProducts.findIndex((prod: any) => prod.id === over.id)

        // Optimistic update
        const newProducts = arrayMove(localProducts, oldIndex, newIndex)
        setLocalProducts(newProducts)

        // Update server
        const orderedIds = newProducts.map((prod: any) => prod.id)
        const result = await reorderProducts(orderedIds)

        if (!result.success) {
            // Revert on error
            setLocalProducts(products)
            alert('Error al reordenar: ' + result.error)
        } else {
            // Refresh to get updated data
            onRefresh()
        }
    }

    function handleEdit(product: any) {
        setEditingProduct(product)
        setShowEditModal(true)
    }

    if (!categoryId) {
        return (
            <div className="flex-1 bg-white flex items-center justify-center">
                <div className="text-center text-slate-400 p-8">
                    <div className="text-7xl mb-4 opacity-50">📦</div>
                    <p className="text-base font-medium text-slate-600">Selecciona una categoría</p>
                    <p className="text-sm text-slate-400 mt-2">para ver y gestionar sus productos</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex-1 bg-white flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex-shrink-0 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-xs uppercase text-slate-600 tracking-wide">
                            Productos
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('grid')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'grid'
                                    ? 'bg-slate-200 text-slate-900'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                🔲 Grid
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'list'
                                    ? 'bg-slate-200 text-slate-900'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                📋 Lista
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-sm transition-colors"
                    >
                        + Nuevo producto
                    </button>
                </div>

                {/* Grid/Lista de productos */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                    {localProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4 opacity-50">🍕</div>
                            <p className="text-base font-medium text-slate-600">Sin productos</p>
                            <p className="text-sm text-slate-400 mt-2">Agrega tu primer producto a esta categoría</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={localProducts.map((prod: any) => prod.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className={view === 'grid'
                                    ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
                                    : 'space-y-3 max-w-4xl'
                                }>
                                    {localProducts.map((product: any) => (
                                        <SortableProductCard
                                            key={product.id}
                                            product={product}
                                            view={view}
                                            onRefresh={onRefresh}
                                            onRefreshCounters={onRefreshCounters}
                                            onEdit={() => handleEdit(product)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            {showModal && (
                <CreateProductModal
                    categoryId={categoryId}
                    restaurantId={restaurantId}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false)
                        onRefresh()
                    }}
                />
            )}

            {showEditModal && editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    categoryId={categoryId}
                    restaurantId={restaurantId}
                    onClose={() => {
                        setShowEditModal(false)
                        setEditingProduct(null)
                    }}
                    onSuccess={() => {
                        setShowEditModal(false)
                        setEditingProduct(null)
                        onRefresh()
                    }}
                />
            )}
        </>
    )
}
