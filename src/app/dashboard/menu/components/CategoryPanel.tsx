'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CreateCategoryModal } from './CreateCategoryModal'
import { EditCategoryModal } from './EditCategoryModal'
import { getLocalizedText } from '@/lib/utils/i18n'
import { reorderCategories, toggleCategoryVisible, deleteCategory } from '@/app/actions/menu'

// Sortable Category Item Component
function SortableCategory({ category, isSelected, onSelect, onEdit, onRefresh, productCount }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id })

    const [isToggling, setIsToggling] = useState(false)

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    async function handleToggle(e: React.MouseEvent) {
        e.stopPropagation()
        setIsToggling(true)
        await toggleCategoryVisible(category.id)
        await onRefresh()
        setIsToggling(false)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelect(category)}
            className={`relative rounded-xl border-2 transition-all cursor-pointer ${isSelected
                ? 'bg-green-50 border-green-500 shadow-md'
                : 'bg-white border-slate-200 hover:border-green-300 hover:shadow-sm'
                } ${isDragging ? 'z-50 shadow-2xl' : ''}`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                title="Arrastra para reordenar"
            >
                ⋮⋮
            </div>

            <div className="p-4 pl-12">
                {/* Header with toggle */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-900 mb-1 truncate">
                            {getLocalizedText(category.name)}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {productCount} productos
                        </p>
                    </div>

                    {/* Toggle Visible */}
                    <button
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${category.is_visible
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {category.is_visible ? 'ON' : 'OFF'}
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(category)
                        }}
                        className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm('¿Eliminar esta categoría y todos sus productos?')) {
                                await deleteCategory(category.id)
                                await onRefresh()
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

export function CategoryPanel({ categories, selectedCategory, onSelectCategory, onRefresh, menuId, restaurantId, productCounts }: any) {
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [localCategories, setLocalCategories] = useState(categories)

    // Update local categories when prop changes
    useEffect(() => {
        setLocalCategories(categories)
    }, [categories])

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

        const oldIndex = localCategories.findIndex((cat: any) => cat.id === active.id)
        const newIndex = localCategories.findIndex((cat: any) => cat.id === over.id)

        // Optimistic update
        const newCategories = arrayMove(localCategories, oldIndex, newIndex)
        setLocalCategories(newCategories)

        // Update server
        const orderedIds = newCategories.map((cat: any) => cat.id)
        const result = await reorderCategories(orderedIds)

        if (!result.success) {
            // Revert on error
            setLocalCategories(categories)
            alert('Error al reordenar: ' + result.error)
        } else {
            // Refresh to get updated data
            onRefresh()
        }
    }

    if (!menuId) {
        return (
            <div className="w-[340px] bg-slate-50 border-r border-slate-200 flex items-center justify-center flex-shrink-0">
                <div className="text-center text-slate-400 p-8">
                    <div className="text-6xl mb-4 opacity-50">🍽️</div>
                    <p className="text-sm font-medium">Selecciona un menú</p>
                    <p className="text-xs mt-2">para ver sus categorías</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="w-[340px] bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
                {/* Header */}
                <div className="p-4 bg-white border-b border-slate-200">
                    <h2 className="font-bold text-xs uppercase text-slate-600 tracking-wide mb-3">
                        Categorías
                    </h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-sm transition-colors shadow-sm"
                    >
                        + Nueva categoría
                    </button>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto p-3">
                    {localCategories.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="text-5xl mb-3 opacity-50">🗂️</div>
                            <p className="text-sm text-slate-500 font-medium">Sin categorías</p>
                            <p className="text-xs text-slate-400 mt-2">Crea una categoría para organizar tus productos</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={localCategories.map((cat: any) => cat.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {localCategories.map((cat: any) => (
                                        <SortableCategory
                                            key={cat.id}
                                            category={cat}
                                            isSelected={selectedCategory?.id === cat.id}
                                            onSelect={onSelectCategory}
                                            onEdit={(category: any) => {
                                                setEditingCategory(category)
                                                setShowEditModal(true)
                                            }}
                                            onRefresh={onRefresh}
                                            productCount={productCounts?.[cat.id] || 0}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            {showModal && (
                <CreateCategoryModal
                    menuId={menuId}
                    restaurantId={restaurantId}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false)
                        onRefresh()
                    }}
                />
            )}

            {showEditModal && editingCategory && (
                <EditCategoryModal
                    category={editingCategory}
                    menuId={menuId}
                    restaurantId={restaurantId}
                    onClose={() => {
                        setShowEditModal(false)
                        setEditingCategory(null)
                    }}
                    onSuccess={() => {
                        setShowEditModal(false)
                        setEditingCategory(null)
                        onRefresh()
                    }}
                />
            )}
        </>
    )
}
